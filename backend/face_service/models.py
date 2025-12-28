from pydantic import BaseModel
from typing import Optional

class FaceAnalysisResult(BaseModel):
    face_id: int
    user_id: int
    face_score: float
    emotion_label: str
    confidence: float

class FaceAnalysisResponse(BaseModel):
    result: FaceAnalysisResult
    message: str