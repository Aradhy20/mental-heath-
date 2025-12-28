from pydantic import BaseModel
from typing import Optional, List, Dict

class TextInput(BaseModel):
    text: str
    user_id: int

class TextAnalysisResult(BaseModel):
    text_id: int
    user_id: int
    input_text: str
    emotion_label: str
    emotion_score: float
    confidence: float

class TextAnalysisResponse(BaseModel):
    result: TextAnalysisResult
    message: str

# New models for RAG-based analysis
class ContextualAnalysisRequest(BaseModel):
    text: str
    user_id: int

class KnowledgeDocument(BaseModel):
    id: str
    content: str
    metadata: Optional[Dict]
    distance: Optional[float]

class ContextualAnalysisResult(BaseModel):
    emotion_analysis: Dict
    contextual_response: str
    relevant_knowledge: List[KnowledgeDocument]
    risk_level: str
    recommendations: List[str]

class ContextualAnalysisResponse(BaseModel):
    result: ContextualAnalysisResult
    message: str