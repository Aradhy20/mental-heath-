import sys
import os

# Add the shared directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
import httpx

# Load environment variables
load_dotenv()

app = FastAPI(title="Fusion Analysis Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Service URLs
TEXT_SERVICE = os.getenv("AI_TEXT_SERVICE_URL", "http://localhost:8002")
VOICE_SERVICE = os.getenv("AI_VOICE_SERVICE_URL", "http://localhost:8003")
FACE_SERVICE = os.getenv("AI_FACE_SERVICE_URL", "http://localhost:8004")

# Models
class FusionInput(BaseModel):
    user_id: str
    text: Optional[str] = None
    has_voice: bool = False
    has_face: bool = False

class FusionResult(BaseModel):
    fusion_id: str
    user_id: str
    overall_emotion: str
    overall_score: float
    confidence: float
    text_emotion: Optional[dict] = None
    voice_emotion: Optional[dict] = None
    face_emotion: Optional[dict] = None
    analysis_summary: str

class FusionResponse(BaseModel):
    result: FusionResult
    message: str

# Emotion mapping and weights
EMOTION_WEIGHTS = {
    "text": 0.4,
    "voice": 0.3,
    "face": 0.3
}

def calculate_fusion_emotion(text_data=None, voice_data=None, face_data=None):
    """
    Combine emotions from multiple modalities using weighted fusion
    """
    emotions = {}
    total_weight = 0
    
    # Process text emotion
    if text_data:
        emotion = text_data.get('emotion_label', 'neutral')
        score = text_data.get('emotion_score', 0.5)
        emotions['text'] = {'emotion': emotion, 'score': score}
        total_weight += EMOTION_WEIGHTS['text']
    
    # Process voice emotion
    if voice_data:
        emotion = voice_data.get('voice_label', 'neutral')
        score = voice_data.get('voice_score', 0.5)
        emotions['voice'] = {'emotion': emotion, 'score': score}
        total_weight += EMOTION_WEIGHTS['voice']
    
    # Process face emotion
    if face_data:
        emotion = face_data.get('face_label', 'neutral')
        score = face_data.get('face_score', 0.5)
        emotions['face'] = {'emotion': emotion, 'score': score}
        total_weight += EMOTION_WEIGHTS['face']
    
    # Calculate weighted average
    if not emotions:
        return 'neutral', 0.5, 0.5
    
    # Simple fusion: use the emotion with highest weighted score
    best_emotion = None
    best_score = 0
    
    for modality, data in emotions.items():
        weighted_score = data['score'] * EMOTION_WEIGHTS[modality]
        if weighted_score > best_score:
            best_score = weighted_score
            best_emotion = data['emotion']
    
    # Calculate confidence based on agreement
    confidence = min(total_weight, 1.0)
    
    return best_emotion, best_score / total_weight if total_weight > 0 else 0.5, confidence

@router.post("/analyze/fusion", response_model=FusionResponse)
async def analyze_fusion(input_data: FusionInput):
    """
    Perform multi-modal emotion fusion analysis
    """
    try:
        text_result = None
        voice_result = None
        face_result = None
        
        # Analyze text if provided
        if input_data.text:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        f"{TEXT_SERVICE}/v1/analyze/text",
                        json={"text": input_data.text, "user_id": input_data.user_id}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        text_result = data.get('result', {})
            except Exception as e:
                print(f"Text analysis failed: {e}")
        
        # Calculate fusion
        overall_emotion, overall_score, confidence = calculate_fusion_emotion(
            text_result, voice_result, face_result
        )
        
        # Generate summary
        modalities_used = []
        if text_result:
            modalities_used.append("text")
        if voice_result:
            modalities_used.append("voice")
        if face_result:
            modalities_used.append("face")
        
        summary = f"Fusion analysis using {', '.join(modalities_used) if modalities_used else 'no'} modalities. "
        summary += f"Overall emotion detected: {overall_emotion} with {confidence*100:.1f}% confidence."
        
        # Create result
        fusion_result = FusionResult(
            fusion_id=f"fusion_{input_data.user_id}_{int(datetime.utcnow().timestamp())}",
            user_id=input_data.user_id,
            overall_emotion=overall_emotion,
            overall_score=round(overall_score, 4),
            confidence=round(confidence, 4),
            text_emotion=text_result,
            voice_emotion=voice_result,
            face_emotion=face_result,
            analysis_summary=summary
        )
        
        return FusionResponse(
            result=fusion_result,
            message="Fusion analysis completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Fusion Analysis Service is running",
        "version": "1.0.0",
        "description": "Multi-modal emotion fusion combining text, voice, and face analysis"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint with service status
    """
    services_status = {}
    
    # Check text service
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{TEXT_SERVICE}/health")
            services_status['text'] = response.status_code == 200
    except:
        services_status['text'] = False
    
    # Check voice service
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{VOICE_SERVICE}/health")
            services_status['voice'] = response.status_code == 200
    except:
        services_status['voice'] = False
    
    # Check face service
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{FACE_SERVICE}/health")
            services_status['face'] = response.status_code == 200
    except:
        services_status['face'] = False
    
    return {
        "status": "healthy",
        "service": "fusion_service",
        "version": "1.0.0",
        "connected_services": services_status,
        "available_modalities": [k for k, v in services_status.items() if v]
    }

app.include_router(router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
