"""
MongoDB Document Models
Defines the schema structure for MongoDB collections
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TextAnalysisDocument(BaseModel):
    """Text analysis result document"""
    user_id: str
    input_text: str
    emotion_label: str
    emotion_score: float
    confidence: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sentiment: Optional[str] = None
    keywords: Optional[List[str]] = None
    risk_level: Optional[str] = None


class VoiceAnalysisDocument(BaseModel):
    """Voice analysis result document"""
    user_id: str
    audio_path: Optional[str] = None
    stress_level: str
    intensity: float
    confidence: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    duration: Optional[float] = None
    features: Optional[Dict[str, Any]] = None


class FaceAnalysisDocument(BaseModel):
    """Face analysis result document"""
    user_id: str
    emotion_label: str
    face_score: float
    confidence: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    image_data: Optional[str] = None
    facial_landmarks: Optional[Dict[str, Any]] = None


class MoodTrackingDocument(BaseModel):
    """Mood tracking entry"""
    user_id: str
    mood_label: str
    score: float
    notes: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    triggers: Optional[List[str]] = None
    activities: Optional[List[str]] = None


class JournalEntryDocument(BaseModel):
    """Journal entry document"""
    user_id: str
    title: str
    content: str
    mood: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_private: bool = True


class MeditationSessionDocument(BaseModel):
    """Meditation session record"""
    user_id: str
    session_type: str  # breathing, guided, mindfulness, etc.
    duration: int  # in seconds
    completed: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
    rating: Optional[int] = None  # 1-5


class ChatLogDocument(BaseModel):
    """Chat conversation log"""
    user_id: str
    message: str
    response: str
    emotion_data: Optional[Dict[str, Any]] = None
    personality: Optional[str] = "empathetic"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EmotionHistoryDocument(BaseModel):
    """Aggregated emotion history for trend analysis"""
    user_id: str
    date: datetime
    dominant_emotion: str
    emotion_scores: Dict[str, float]
    text_count: int = 0
    voice_count: int = 0
    face_count: int = 0
    average_confidence: float
    risk_level: Optional[str] = None


class ReportDocument(BaseModel):
    """User report/assessment document"""
    user_id: str
    report_type: str  # weekly, monthly, custom
    start_date: datetime
    end_date: datetime
    summary: Dict[str, Any]
    recommendations: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
