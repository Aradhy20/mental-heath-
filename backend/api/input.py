from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime
import base64
import numpy as np
import cv2
import asyncio

from core.security import get_optional_user
from ml.engines.inference_manager import inference_manager
from ai.memory import memory
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ai.chatbot_engine import chatbot_engine
from ai.voice_interface import voice_interface
from ai.llm_manager import llm_manager

router = APIRouter(prefix="/input", tags=["Multi-Modal Input"])

try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh_tool = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)
    HAS_MEDIAPIPE = True
except (AttributeError, ImportError):
    print("Warning: MediaPipe solutions not found in api/input.py. Using mock.")
    HAS_MEDIAPIPE = False
    face_mesh_tool = None

# --- Request Models ---
class TextInputRequest(BaseModel):
    text: str
    typing_speed_wpm: Optional[float] = None
    session_duration_sec: Optional[float] = None

class VoiceInputRequest(BaseModel):
    audio_base64: str
    session_duration_sec: Optional[float] = None

class FaceInputRequest(BaseModel):
    image_base64: str
    session_duration_sec: Optional[float] = None

class FusionInputRequest(BaseModel):
    text: Optional[str] = None
    audio_base64: Optional[str] = None
    image_base64: Optional[str] = None
    typing_speed_wpm: Optional[float] = None
    inactivity_sec: Optional[float] = None
    session_duration_sec: Optional[float] = None

class FusionResponse(BaseModel):
    final_emotion: str
    confidence_score: float
    reply: str
    reasoning: str
    component_scores: Dict[str, Any]

class VoiceAssistantRequest(BaseModel):
    audio_base64: Optional[str] = None
    text: Optional[str] = None
    image_base64: Optional[str] = None

class VoiceAssistantResponse(BaseModel):
    emotion: str
    confidence: float
    reply: str
    audio_base64: Optional[str] = None

# --- Processing Helpers ---
def extract_audio_features(audio_bytes: bytes) -> np.ndarray:
    try:
        import librosa
        import io
        import numpy as np

        data, samplerate = None, None

        # Try decoding with PyAV (handles webm, wav, mp3, ogg, etc. robustly)
        try:
            import av
            container = av.open(io.BytesIO(audio_bytes))
            stream = container.streams.audio[0]
            resampler = av.AudioResampler(format='flt', layout='mono', rate=16000)

            all_frames = []
            for frame in container.decode(stream):
                resampled_frames = resampler.resample(frame)
                for rf in resampled_frames:
                    all_frames.append(rf.to_ndarray()[0])

            resampled_frames = resampler.resample(None)
            for rf in resampled_frames:
                all_frames.append(rf.to_ndarray()[0])

            if all_frames:
                data = np.concatenate(all_frames)
                samplerate = 16000
        except Exception as av_err:
            print(f"PyAV feature extraction decoding failed: {av_err}. Falling back to soundfile...")

        # Fallback to soundfile if PyAV wasn't successful
        if data is None:
            import soundfile as sf
            with io.BytesIO(audio_bytes) as audio_file:
                data, samplerate = sf.read(audio_file)
                if len(data.shape) > 1:
                    data = np.mean(data, axis=1)

        if data is None or len(data) == 0:
            raise ValueError("Empty audio data decoded")

        # Ensure we have enough samples for librosa mfcc (minimum 2048 samples)
        if len(data) < 2048:
            data = np.pad(data, (0, 2048 - len(data)), mode='constant')

        # Extract MFCCs
        mfccs = librosa.feature.mfcc(y=data, sr=samplerate, n_mfcc=16)
        # Average over time
        mfccs_scaled = np.mean(mfccs.T, axis=0)
        return np.array(mfccs_scaled, dtype=np.float32)
    except Exception as e:
        print(f"Audio feature extraction failed: {e}. Falling back to random noise.")
        return np.random.rand(16).astype(np.float32) * 0.1


def extract_face_landmarks(image_bytes: bytes) -> np.ndarray:
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return np.zeros((478 * 3,), dtype=np.float32)
            
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        flat_landmarks = []
        if HAS_MEDIAPIPE and face_mesh_tool:
            results = face_mesh_tool.process(rgb_frame)
            if results.multi_face_landmarks:
                for lm in results.multi_face_landmarks[0].landmark:
                    flat_landmarks.extend([lm.x, lm.y, lm.z])
        
        if not flat_landmarks:
            return np.random.rand(478 * 3).astype(np.float32) * 0.01
            
        flat_landmarks = np.array(flat_landmarks, dtype=np.float32)
        target_size = 478 * 3
        if len(flat_landmarks) < target_size:
            flat_landmarks = np.pad(flat_landmarks, (0, target_size - len(flat_landmarks)))
        elif len(flat_landmarks) > target_size:
            flat_landmarks = flat_landmarks[:target_size]
        return flat_landmarks
    except Exception as e:
        print(f"Face extraction failed: {e}")
        
    return np.random.rand(478 * 3).astype(np.float32) * 0.01

def behavior_emotion(typing_speed_wpm: float, inactivity_sec: float) -> Dict[str, float]:
    probs = {"happy": 0.2, "sad": 0.2, "anxious": 0.2, "angry": 0.2, "neutral": 0.2}
    if inactivity_sec > 30:
        probs["sad"] += 0.4
        probs["neutral"] -= 0.1
    if typing_speed_wpm is not None:
        if typing_speed_wpm > 80:
            probs["anxious"] += 0.3
            probs["angry"] += 0.2
        elif typing_speed_wpm < 20:
            probs["sad"] += 0.3
    total = sum(probs.values())
    return {k: v / total for k, v in probs.items()}

# --- Endpoints ---

@router.post("/text")
async def process_text(req: TextInputRequest, user_id: str = Depends(get_optional_user)):
    emo_probs, risk_probs = inference_manager.predict_text(req.text)
    if emo_probs is None:
        emo_probs = np.array([0, 0, 0, 0, 1])
    labels = ["happy", "sad", "anxious", "angry", "neutral"]
    label_idx = int(np.argmax(emo_probs))
    return {
        "emotion": labels[label_idx],
        "confidence": float(np.max(emo_probs)),
        "scores": {labels[i]: float(emo_probs[i]) for i in range(5)}
    }

@router.post("/voice")
async def process_voice(req: VoiceInputRequest, user_id: str = Depends(get_optional_user)):
    try:
        header, data = req.audio_base64.split(",", 1) if "," in req.audio_base64 else (None, req.audio_base64)
        audio_bytes = base64.b64decode(data)
        features = extract_audio_features(audio_bytes)
        probs = inference_manager.predict_audio(features)
        labels = ["happy", "sad", "anxious", "angry", "neutral"]
        label_idx = int(np.argmax(probs))
        from ai.voice_interface import voice_interface
        transcribed_text = await voice_interface.speech_to_text(audio_bytes)
        if transcribed_text == "(Voice transcription unavailable offline)":
             transcribed_text = "I'm feeling a bit overwhelmed."
        return {
            "emotion": labels[label_idx],
            "confidence": float(np.max(probs)),
            "scores": {labels[i]: float(probs[i]) for i in range(5)},
            "transcription": transcribed_text
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/face")
async def process_face(req: FaceInputRequest, user_id: str = Depends(get_optional_user)):
    try:
        header, data = req.image_base64.split(",", 1) if "," in req.image_base64 else (None, req.image_base64)
        image_bytes = base64.b64decode(data)
        landmarks = extract_face_landmarks(image_bytes)
        probs = inference_manager.predict_face(landmarks)
        labels = ["happy", "sad", "anxious", "angry", "neutral"]
        label_idx = int(np.argmax(probs))
        return {
            "emotion": labels[label_idx],
            "confidence": float(np.max(probs)),
            "scores": {labels[i]: float(probs[i]) for i in range(5)}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/fusion", response_model=FusionResponse)
async def process_fusion(req: FusionInputRequest, db: AsyncSession = Depends(get_db), user_id: str = Depends(get_optional_user)):
    labels = ["happy", "sad", "anxious", "angry", "neutral"]
    text_probs = np.array([0.2]*5)
    transcribed_text = req.text or ""
    if req.text:
        ep, rp = inference_manager.predict_text(req.text)
        if ep is not None:
            text_probs = ep
    elif req.audio_base64:
        header, data = req.audio_base64.split(",", 1) if "," in req.audio_base64 else (None, req.audio_base64)
        audio_bytes = base64.b64decode(data)
        from ai.voice_interface import voice_interface
        transcribed_text = await voice_interface.speech_to_text(audio_bytes)
        if transcribed_text == "(Voice transcription unavailable offline)":
            transcribed_text = "I'm feeling a bit overwhelmed."
        ep, rp = inference_manager.predict_text(transcribed_text)
        if ep is not None:
            text_probs = ep
            
    voice_probs = np.array([0.2]*5)
    if req.audio_base64:
        header, data = req.audio_base64.split(",", 1) if "," in req.audio_base64 else (None, req.audio_base64)
        audio_bytes = base64.b64decode(data)
        features = extract_audio_features(audio_bytes)
        vp = inference_manager.predict_audio(features)
        if vp is not None:
            voice_probs = vp
            
    face_probs = np.array([0.2]*5)
    if req.image_base64:
        header, data = req.image_base64.split(",", 1) if "," in req.image_base64 else (None, req.image_base64)
        image_bytes = base64.b64decode(data)
        landmarks = extract_face_landmarks(image_bytes)
        fp = inference_manager.predict_face(landmarks)
        if fp is not None:
            face_probs = fp
            
    behav_dict = behavior_emotion(req.typing_speed_wpm or 40, req.inactivity_sec or 0)
    behav_probs = np.array([behav_dict[l] for l in labels])
    
    w_t, w_v, w_f, w_b = 0.4, 0.3, 0.2, 0.1
    if not req.text and not req.audio_base64: w_t = 0
    if not req.audio_base64: w_v = 0
    if not req.image_base64: w_f = 0
    
    total_w = w_t + w_v + w_f + w_b
    if total_w == 0:
        w_t, total_w = 1.0, 1.0
        
    final_probs = (w_t * text_probs + w_v * voice_probs + w_f * face_probs + w_b * behav_probs) / total_w
    final_idx = int(np.argmax(final_probs))
    final_emotion = labels[final_idx]
    confidence_score = float(np.max(final_probs))
    
    chat_history = await memory.get_history(user_id, db)
    history_summary = " | ".join([m["content"] for m in chat_history[-3:]]) if chat_history else "No recent context."
    reasoning = f"Fused (T:{w_t:.1f}, V:{w_v:.1f}, F:{w_f:.1f}, B:{w_b:.1f}). History: {history_summary[:30]}..."
    
    from ai.llm_manager import llm_manager
    system_prompt = f"You are MindfulAI. The user feels {final_emotion}. Respond empathetically. Context: {history_summary}."
    reply = await llm_manager.generate_response(system_prompt, transcribed_text or "Hello.")
    
    if transcribed_text:
        await memory.add_entry(user_id, "user", transcribed_text, db)
    await memory.add_entry(user_id, "assistant", reply, db)
    
    return FusionResponse(
        final_emotion=final_emotion,
        confidence_score=confidence_score,
        reply=reply,
        reasoning=reasoning,
        component_scores={
            "text": {labels[i]: float(text_probs[i]) for i in range(5)},
            "voice": {labels[i]: float(voice_probs[i]) for i in range(5)},
            "face": {labels[i]: float(face_probs[i]) for i in range(5)},
            "behavior": {labels[i]: float(behav_probs[i]) for i in range(5)},
            "fused": {labels[i]: float(final_probs[i]) for i in range(5)}
        }
    )

@router.post("/voice-assistant", response_model=VoiceAssistantResponse)
async def voice_assistant_endpoint(
    req: VoiceAssistantRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_optional_user)
):
    labels = ["happy", "sad", "anxious", "angry", "neutral"]
    
    # 1. Transcribe audio if provided
    transcribed_text = req.text or ""
    audio_bytes = None
    if req.audio_base64:
        try:
            header, data = req.audio_base64.split(",", 1) if "," in req.audio_base64 else (None, req.audio_base64)
            audio_bytes = base64.b64decode(data)
            transcribed_text = await voice_interface.speech_to_text(audio_bytes)
            if transcribed_text == "(Voice transcription unavailable offline)":
                transcribed_text = "I'm feeling a bit overwhelmed."
        except Exception as e:
            print(f"Assistant audio decode/transcribe error: {e}")
            
    if not transcribed_text:
        transcribed_text = "Hello."

    # 2. Emotion estimation from multimodally fused inputs
    text_probs = np.array([0.2]*5)
    ep, rp = inference_manager.predict_text(transcribed_text)
    if ep is not None:
        text_probs = ep
        
    voice_probs = np.array([0.2]*5)
    if audio_bytes is not None:
        try:
            features = extract_audio_features(audio_bytes)
            vp = inference_manager.predict_audio(features)
            if vp is not None:
                voice_probs = vp
        except Exception as e:
            print(f"Assistant audio prediction error: {e}")
            
    face_probs = np.array([0.2]*5)
    if req.image_base64:
        try:
            header, data = req.image_base64.split(",", 1) if "," in req.image_base64 else (None, req.image_base64)
            image_bytes = base64.b64decode(data)
            landmarks = extract_face_landmarks(image_bytes)
            fp = inference_manager.predict_face(landmarks)
            if fp is not None:
                face_probs = fp
        except Exception as e:
            print(f"Assistant face prediction error: {e}")
            
    # Simple weights: text 0.5, voice 0.3, face 0.2
    w_t, w_v, w_f = 0.5, 0.3, 0.2
    if not req.image_base64:
        w_f = 0
    if not req.audio_base64:
        w_v = 0
        
    total_w = w_t + w_v + w_f
    if total_w == 0:
        w_t, total_w = 1.0, 1.0
        
    final_probs = (w_t * text_probs + w_v * voice_probs + w_f * face_probs) / total_w
    final_idx = int(np.argmax(final_probs))
    final_emotion = labels[final_idx]
    confidence_score = float(np.max(final_probs))

    # 3. Chat history for context
    chat_history = await memory.get_history(user_id, db)
    history_summary = " | ".join([m["content"] for m in chat_history[-3:]]) if chat_history else "No recent context."
    
    # 4. Prompt injection for persona guidelines:
    # Speaks like a senior doctor + caring friend
    # Soft & slow tone
    # Max 2-3 sentences, warm acknowledgment, reassurance, support, optional gentle question
    system_prompt = (
        "You are MindfulAI, speaking as an experienced senior medical doctor, gentle counselor, and caring supportive friend. "
        "The user feels {emotion}. Speak in a soft, slow, calm, and grounding tone. "
        "Do NOT lecture, use technical jargon, or over-explain. "
        "You MUST respond in maximum 2 to 3 sentences. "
        "Strictly follow this structure:\n"
        "1. Warmly acknowledge their feeling/emotion.\n"
        "2. Show reassurance and support.\n"
        "3. Ask a gentle, open question (optional).\n"
        "Context of recent chat: {history_summary}."
    ).format(emotion=final_emotion, history_summary=history_summary[:300])

    reply = await llm_manager.generate_response(system_prompt, transcribed_text)

    # Clean punctuation just in case the LLM returned too much or raw formatting
    # Max 3 sentences check
    sentences = [s.strip() for s in reply.split(".") if s.strip()]
    if len(sentences) > 3:
        reply = ". ".join(sentences[:3]) + "."

    # 5. Record to memory
    await memory.add_entry(user_id, "user", transcribed_text, db)
    await memory.add_entry(user_id, "assistant", reply, db)

    # 6. Advanced TTS modulated by emotion
    tts_audio_base64 = await voice_interface.text_to_speech_advanced(reply, final_emotion)

    return VoiceAssistantResponse(
        emotion=final_emotion,
        confidence=confidence_score,
        reply=reply,
        audio_base64=tts_audio_base64
    )
