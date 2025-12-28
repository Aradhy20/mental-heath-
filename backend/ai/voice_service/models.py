from pydantic import BaseModel
from typing import Optional

class VoiceAnalysisResult(BaseModel):
    voice_id: int
    user_id: int
    voice_score: float
    voice_label: str
    confidence: float

class VoiceAnalysisResponse(BaseModel):
    result: VoiceAnalysisResult
    message: str