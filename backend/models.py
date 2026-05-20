from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, JSON, Float, Integer
from database import Base
import datetime as dt

# ================= SQL MODELS (Identity) =================
class DBUser(Base):
    __tablename__ = "users"
    
    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    subscription_tier = Column(String(50), default="free")
    last_login = Column(DateTime, default=dt.datetime.utcnow)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class MoodLog(Base):
    __tablename__ = "mood_logs"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    score = Column(Float) # 1-5 scale
    feelings = Column(String(255))
    activities = Column(String(255))
    note = Column(String(500))
    sleep_hours = Column(Float, default=0.0)
    energy_level = Column(Integer, default=5)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class DBChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    role = Column(String(20)) # user / assistant
    content = Column(String(2000))
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    content = Column(String(2000))
    sentiment = Column(String(50), default="neutral")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class DBOTP(Base):
    __tablename__ = "otps"
    identifier = Column(String(100), primary_key=True, index=True)
    otp = Column(String(10))
    created_at = Column(DateTime, default=dt.datetime.utcnow)

# ================= WEARABLE / REAL-WORLD MODELS =================
class DBWearableData(Base):
    __tablename__ = "wearable_data"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    heart_rate = Column(Integer, default=0)
    sleep_hours = Column(Float, default=0.0)
    activity_level = Column(String(50), default="low")
    created_at = Column(DateTime, default=dt.datetime.utcnow)


# ================= AUTH REQUESTS/RESPONSES =================
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None

class OTPVerify(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str

class Token(BaseModel):
    access_token: str
    token: Optional[str] = None
    token_type: str
    user_id: str
    user: Optional[dict] = None

# ================= AI MODULE REQUESTS =================
class TextAnalysisRequest(BaseModel):
    text: str

class VoiceAnalysisRequest(BaseModel):
    audio_base64: str

class FaceAnalysisRequest(BaseModel):
    image_base64: str

class FusionRequest(BaseModel):
    text_score: Optional[float] = None
    voice_score: Optional[float] = None
    face_score: Optional[float] = None

class MoodEntry(BaseModel):
    score: int  # 1-5
    feelings: Optional[List[str]] = []
    activities: Optional[List[str]] = []
    note: Optional[str] = ""
    user_id: Optional[str] = "guest"
    sleep_hours: Optional[float] = 0.0   # 0-10 hours
    energy_level: Optional[int] = 5      # 1-10 scale


# ================= CHAT (RAG) MODELS =================
class ChatRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

# ================= DATABASE RESPONSES =================
class AnalysisResult(BaseModel):
    score: float
    label: str
    confidence: float

class SessionDocument(BaseModel):
    user_id: str
    text_score: float
    voice_score: float
    face_score: float
    final_score: float
    risk_level: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ================= AI EMOTIONAL COPILOT MODELS =================
class CopilotContext(BaseModel):
    time_of_day: Optional[str] = None
    sleep_hours: Optional[float] = None
    recent_trigger: Optional[str] = None
    available_minutes: Optional[int] = 5


class EmotionalSignal(BaseModel):
    emotion: str
    score: float
    confidence: float
    valence: float
    arousal: float
    stress: float
    source: str


class RecommendedAction(BaseModel):
    type: str
    title: str
    reason: str
    duration_minutes: int
    follow_up_prompt: str


class EmotionalState(BaseModel):
    primary_emotion: str
    secondary_emotions: List[str] = []
    valence: float
    arousal: float
    stress_score: float
    confidence: float
    risk_level: str
    emotion_score: float
    emotional_fatigue_score: float
    burnout_risk: float
    contributors: Dict[str, float]
    explanation: List[str] = []


class AnalyzeEmotionRequest(BaseModel):
    text: Optional[str] = None
    voice_score: Optional[float] = None
    voice_confidence: Optional[float] = None
    face_score: Optional[float] = None
    face_confidence: Optional[float] = None
    context: Optional[CopilotContext] = None


class AnalyzeEmotionResponse(BaseModel):
    emotion: str
    confidence: float
    risk_level: str
    emotional_fatigue_score: float
    burnout_risk: float
    recommended_action: RecommendedAction
    state: EmotionalState


class ChatTherapyRequest(BaseModel):
    message: str
    mode: str = "auto"
    include_context: bool = True
    context: Optional[CopilotContext] = None


class ChatTherapyResponse(BaseModel):
    reply: str
    mode: str
    detected_distortions: List[str] = []
    risk_level: str
    next_action: RecommendedAction
    state: EmotionalState
    memory_summary: Optional[str] = None


class PredictMoodRequest(BaseModel):
    horizon_days: int = 7


class PredictMoodResponse(BaseModel):
    trend: str
    forecast_confidence: float
    burnout_risk: float
    circadian_low_windows: List[str]
    explanation: List[str]


class RecommendActionsRequest(BaseModel):
    emotion: str
    stress_score: float
    energy_score: Optional[float] = 0.5
    available_minutes: Optional[int] = 5


class RecommendActionsResponse(BaseModel):
    recommended_actions: List[RecommendedAction]
    rationale: str


class MemorySnapshot(BaseModel):
    history_score: float = 0.5
    recent_mood_average: float = 0.5
    recent_emotions: List[str] = []
    common_distortions: List[str] = []
    summary: str = "No recent emotional memory available."
    helpful_actions: List[str] = []

# ================= WEARABLE / REAL-WORLD MODELS =================
class WearableRequest(BaseModel):
    heart_rate: Optional[int] = None
    sleep_hours: Optional[float] = None
    activity_level: Optional[str] = "low"

class LocationRecommendation(BaseModel):
    name: str
    type: str
    distance: str
    address: str

class MoodGameScore(Base):
    __tablename__ = "mood_game_scores"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    game_name = Column(String(50))
    score = Column(Integer)
    mood_impact = Column(Float) # -1.0 to 1.0
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class GameScoreRequest(BaseModel):
    game_name: str
    score: int
    mood_impact: float


# ================= REINFORCEMENT LEARNING MODELS =================
class DBRLFeedback(Base):
    __tablename__ = "rl_feedback"
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=True)
    input_text = Column(String(2000))
    response_text = Column(String(2000))
    style_selected = Column(String(50)) # short, deep, coaching
    emotion_detected = Column(String(50))
    reward = Column(Float, default=0.0)
    feedback_type = Column(String(20), nullable=True) # like, dislike
    response_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class DBRLUserWeights(Base):
    __tablename__ = "rl_user_weights"
    user_id = Column(String(50), primary_key=True, index=True)
    alpha_short = Column(Float, default=1.0)
    beta_short = Column(Float, default=1.0)
    alpha_deep = Column(Float, default=1.0)
    beta_deep = Column(Float, default=1.0)
    alpha_coaching = Column(Float, default=1.0)
    beta_coaching = Column(Float, default=1.0)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


class ChatFeedbackPayload(BaseModel):
    feedback_id: str
    feedback_type: str # like, dislike
    response_time_ms: Optional[float] = None

