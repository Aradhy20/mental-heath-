import os
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

import json
import asyncio
import time
from typing import List
from dotenv import load_dotenv

# Load environment variables (API Keys, DB URLs) before other imports
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: local load_dotenv failed: {e}")

try:
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
except Exception as e:
    print(f"Warning: root load_dotenv failed: {e}")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from core.logging import log
from api import auth, analysis, input, wellness, chat, alerts, voice, biometrics, clinical_assessments, insights, explain, trends, checkin, analytics, games
from ai.learning_loop import router as learning_router

app = FastAPI(
    title="MindfulAI Core OS — v3.0",
    description="The world's first AI-powered mental health operating system. Modern charcoal architecture with high-fidelity neural processing.",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# ── Performance Timing Middleware ─────────────────────────────────────────────
class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        t0 = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.1f}"
        if elapsed_ms > 500:  # Only log slow requests
            log.info(f"[PERF] {request.method} {request.url.path} → {elapsed_ms:.0f}ms")
        return response

app.add_middleware(TimingMiddleware)

# Robust CORS Setup (Placed after other middleware to ensure response headers are preserved)
ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://mindfulai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/analysis")
async def websocket_analysis(websocket: WebSocket):
    """
    Real-time multimodal analysis stream.
    Client sends JSON frames with optional: audio_features, face_landmarks, face_confidence, text.
    Returns: emotion, risk_level, fused_state probabilities.
    """
    await manager.connect(websocket)
    
    # Lazy-import ML components to avoid startup delay
    from ml.engines.inference_manager import inference_manager
    from ml.engines.fusion_engine import MultimodalFusionEngine
    import numpy as np
    
    ws_fusion = MultimodalFusionEngine()
    EMOTION_LABELS = ["happy", "sad", "anxious", "angry", "neutral"]
    RISK_LABELS    = ["low", "moderate", "high"]
    
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                frame = json.loads(raw)
            except Exception:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
                continue

            # ── Text inference (if text present in frame) ──
            text = frame.get("text", "")
            text_emo_prob  = np.array([0.1]*4 + [0.6])
            text_risk_prob = np.array([0.9, 0.05, 0.05])
            if text:
                te, tr = inference_manager.predict_text(text)
                if te is not None: text_emo_prob  = te
                if tr is not None: text_risk_prob = tr

            # ── Audio inference ──
            audio_prob = np.array([0.2]*5)
            raw_audio = frame.get("audio_features")
            if raw_audio is not None:
                ap = inference_manager.predict_audio(np.array(raw_audio, dtype=np.float32))
                if ap is not None: audio_prob = ap

            # ── Face inference ──
            face_prob = np.array([0.2]*5)
            face_conf = float(frame.get("face_confidence", 0.0))
            raw_face  = frame.get("face_landmarks")
            if raw_face is not None:
                fp = inference_manager.predict_face(np.array(raw_face, dtype=np.float32))
                if fp is not None: face_prob = fp

            # ── Fusion ──
            fused = ws_fusion.fuse_current_state(text_emo_prob, audio_prob, face_prob, face_confidence=face_conf)
            emotion   = ws_fusion.predict_emotion(fused)
            risk_idx  = int(np.argmax(text_risk_prob))
            risk_level = RISK_LABELS[risk_idx]

            response = {
                "emotion":              emotion,
                "risk_level":           risk_level,
                "emotion_confidence":   float(np.max(fused)),
                "risk_confidence":      float(np.max(text_risk_prob)),
                "fused_probs":          {EMOTION_LABELS[i]: round(float(fused[i]), 3) for i in range(5)},
                "timestamp":            asyncio.get_event_loop().time(),
            }
            await manager.send_personal_message(json.dumps(response), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        log.error(f"WebSocket error: {e}", exc_info=True)
        manager.disconnect(websocket)


@app.websocket("/ws/face")
async def websocket_face(websocket: WebSocket):
    """
    Real-time face emotion detection stream.
    Accepts raw binary image data or base64-encoded images.
    Returns: {"emotion": str, "confidence": float}
    """
    await manager.connect(websocket)
    
    # Lazy import to avoid server boot slowdown
    from ai.face_engine import face_engine
    import base64
    
    try:
        while True:
            data = await websocket.receive()
            frame_bytes = None
            
            if "bytes" in data:
                frame_bytes = data["bytes"]
            elif "text" in data:
                text_data = data["text"]
                if text_data.startswith("data:image"):
                    # Handle raw base64 data url from canvas
                    try:
                        _, encoded = text_data.split(",", 1)
                        frame_bytes = base64.b64decode(encoded)
                    except Exception:
                        pass
                else:
                    try:
                        # Handle JSON wrapped image payload
                        payload = json.loads(text_data)
                        img_b64 = payload.get("image")
                        if img_b64:
                            if "," in img_b64:
                                img_b64 = img_b64.split(",", 1)[1]
                            frame_bytes = base64.b64decode(img_b64)
                    except Exception:
                        pass
            
            if frame_bytes is None:
                await websocket.send_text(json.dumps({"emotion": "uncertain", "confidence": 0.0, "error": "Invalid format"}))
                continue
                
            # Run our PyTorch CNN pipeline
            res = face_engine.predict_frame(frame_bytes)
            await websocket.send_text(json.dumps(res))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        log.error(f"WebSocket face error: {e}", exc_info=True)
        manager.disconnect(websocket)


# Connect Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(input.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(wellness.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(voice.router, prefix="/api/v1")
app.include_router(biometrics.router, prefix="/api/v1")
app.include_router(clinical_assessments.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
app.include_router(games.router, prefix="/api/v1")
app.include_router(explain.router, prefix="/api/v1")
app.include_router(trends.router, prefix="/api/v1")
app.include_router(checkin.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(learning_router, prefix="/api/v1")


@app.get("/")
def health_check():
    return {
        "status": "online", 
        "version": "2.0.0",
        "message": "MindfulAI 2.0 Backend is fully operational"
    }

def check_dependencies():
    """Validates that all critical AI dependencies are installed and accessible."""
    try:
        import torch
        import librosa
        import mediapipe
        import cv2
        import numpy
        log.info("AI Infrastructure validated: All core libraries accessible.")
        return True
    except ImportError as e:
        log.critical(f"FATAL: Missing AI dependency: {e}. System cannot boot.")
        return False

@app.on_event("startup")
async def startup_event():
    log.info("MindfulAI Backend (Low RAM Optimized) Starting...")
    # Auto-create all MySQL tables from SQLAlchemy models
    from database import engine, Base
    import models  # noqa: F401 — ensure all models are registered with Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("✅ Database tables verified / created successfully")

    # Pre-warm AI models in background (avoids cold-start timeout on first request)
    import asyncio
    async def _prewarm_models():
        try:
            loop = asyncio.get_running_loop()
            from ai.emotion_model import emotion_model
            from ai.risk_model import risk_model
            from ai.llm_manager import llm_manager
            await loop.run_in_executor(None, emotion_model.predict, "I feel okay")
            await loop.run_in_executor(None, risk_model.predict, "I feel okay")
            llm_manager._lazy_init()
            log.info("🔥 AI models pre-warmed successfully")
        except Exception as e:
            log.warning(f"Model pre-warm warning (non-fatal): {e}")
    asyncio.create_task(_prewarm_models())

@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0"}
