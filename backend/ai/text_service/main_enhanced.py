"""
Enhanced Text Analysis Service with Performance Optimizations
Includes: caching, logging, monitoring, and improved error handling
"""

from fastapi import FastAPI, HTTPException, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import random
import sys
import os
import time

# Add parent to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import shared utilities
from shared.cache import cache_model, model_cache
from shared.logging_config import setup_logger, log_model_inference
from shared.monitoring import track_performance, RequestTimer, monitor
from shared.middleware import RequestIDMiddleware, PerformanceMiddleware, ErrorLoggingMiddleware

# Import service-specific modules
from text_analyzer import analyzer
from database import get_db
from models import TextAnalysisModel
from temporal_analyzer import initialize_temporal_analyzer
from vector_db import vector_db

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(
    "text_service",
    log_level="INFO",
    log_dir="backend/logs",
    use_json=False  # Set to True for production
)

logger.info("Initializing Text Analysis Service...")

# Initialize FastAPI app
app = FastAPI(
    title="Text Analysis Service",
    version="2.0.0",
    description="Enhanced text analysis with caching and monitoring"
)

# Add middleware (order matters!)
app.add_middleware(ErrorLoggingMiddleware, logger=logger)
app.add_middleware(PerformanceMiddleware, logger=logger)
app.add_middleware(RequestIDMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class TextInput(BaseModel):
    user_id: int
    text: str

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

class ContextualAnalysisRequest(BaseModel):
    user_id: int
    text: str

class ContextualAnalysisResponse(BaseModel):
    result: dict
    message: str

# Create API Router
router = APIRouter()

# Cached model initialization
@cache_model("text_analyzer")
def get_analyzer():
    """Get or load the text analyzer (cached)"""
    logger.info("Loading text analyzer model...")
    return analyzer

# Routes
@router.post("/analyze/text", response_model=TextAnalysisResponse)
@track_performance("text_analysis")
async def analyze_text(input_data: TextInput, request: Request, db: Session = Depends(get_db)):
    """
    Analyze text for emotional content (with caching and monitoring)
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info(f"Processing text analysis for user {input_data.user_id}", extra={"request_id": request_id})
    
    try:
        # Get cached analyzer
        start_time = time.time()
        text_analyzer = get_analyzer()
        load_time_ms = (time.time() - start_time) * 1000
        
        # Log model loading performance
        from_cache = model_cache.get("text_analyzer") is not None
        log_model_inference(logger, "text_analyzer_load", load_time_ms, from_cache)
        
        # Perform analysis
        with RequestTimer("emotion_analysis", logger):
            emotion_label, emotion_score, confidence = text_analyzer.analyze_emotion(input_data.text)
        
        # Create result
        result = TextAnalysisResult(
            text_id=random.randint(1000, 9999),
            user_id=input_data.user_id,
            input_text=input_data.text,
            emotion_label=emotion_label,
            emotion_score=round(emotion_score, 4),
            confidence=round(confidence, 4)
        )
        
        # Save to database
        with RequestTimer("database_insert", logger):
            db_result = TextAnalysisModel(
                user_id=input_data.user_id,
                input_text=input_data.text,
                emotion_label=emotion_label,
                emotion_score=round(emotion_score, 4),
                confidence=round(confidence, 4)
            )
            db.add(db_result)
            db.commit()
            db.refresh(db_result)
        
        logger.info(f"Text analysis completed: {emotion_label} ({confidence:.2f})", extra={"request_id": request_id})
        monitor.increment_requests("analyze_text")
        
        return TextAnalysisResponse(
            result=result,
            message="Text analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Text analysis failed: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        monitor.increment_errors("analyze_text")
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/analyze/text/contextual", response_model=ContextualAnalysisResponse)
@track_performance("contextual_analysis")
async def analyze_text_contextual(input_data: ContextualAnalysisRequest, request: Request, db: Session = Depends(get_db)):
    """
    Analyze text with contextual understanding using RAG and vector database
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info(f"Processing contextual analysis for user {input_data.user_id}", extra={"request_id": request_id})
    
    try:
        text_analyzer = get_analyzer()
        
        # Retrieve conversational memory
        with RequestTimer("memory_retrieval", logger):
            recent_memories = vector_db.get_user_memory(input_data.user_id, query=input_data.text, n_results=3)
        
        memory_context = ""
        if recent_memories:
            memory_context = "Previous context:\\n" + "\\n".join([f"- {m['content']}" for m in recent_memories])
        
        # Perform contextual analysis
        with RequestTimer("contextual_inference", logger):
            contextual_result = text_analyzer.analyze_with_context(input_data.text)
        
        # Save to database
        emotion_data = contextual_result["emotion_analysis"]
        db_result = TextAnalysisModel(
            user_id=input_data.user_id,
            input_text=input_data.text,
            emotion_label=emotion_data["emotion_label"],
            emotion_score=round(emotion_data["emotion_score"], 4),
            confidence=round(emotion_data["confidence"], 4)
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        # Save to vector memory
        memory_content = f"User: {input_data.text} | Emotion: {emotion_data['emotion_label']}"
        vector_db.add_user_memory(
            user_id=input_data.user_id,
            text=memory_content,
            metadata={
                "emotion": emotion_data["emotion_label"],
                "score": emotion_data["emotion_score"]
            }
        )
        
        # Format response
        knowledge_docs = []
        for doc in contextual_result["relevant_knowledge"]:
            knowledge_docs.append({
                "id": doc["id"],
                "content": doc["content"],
                "metadata": doc.get("metadata"),
                "distance": doc.get("distance")
            })
        
        result = {
            "emotion_analysis": contextual_result["emotion_analysis"],
            "contextual_response": contextual_result["contextual_response"],
            "relevant_knowledge": knowledge_docs,
            "risk_level": contextual_result["risk_level"],
            "recommendations": contextual_result["recommendations"]
        }
        
        logger.info(f"Contextual analysis completed: risk={contextual_result['risk_level']}", extra={"request_id": request_id})
        monitor.increment_requests("analyze_text_contextual")
        
        return ContextualAnalysisResponse(
            result=result,
            message="Contextual text analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Contextual analysis failed: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        monitor.increment_errors("analyze_text_contextual")
        raise HTTPException(status_code=500, detail=f"Contextual text analysis failed: {str(e)}")

@router.get("/analyze/emotion/history")
@track_performance("emotion_history")
async def get_emotion_history(user_id: int, days: int = 30, db: Session = Depends(get_db)):
    """Get emotion history, patterns, and forecasts"""
    try:
        with RequestTimer("temporal_analysis", logger):
            temporal_analyzer = initialize_temporal_analyzer(db)
            analysis_result = temporal_analyzer.analyze_patterns(user_id)
        
        monitor.increment_requests("emotion_history")
        return analysis_result
    
    except Exception as e:
        logger.error(f"Emotion history failed: {str(e)}", exc_info=True)
        monitor.increment_errors("emotion_history")
        raise HTTPException(status_code=500, detail=f"Emotion history analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Text Analysis Service v2.0 with Performance Enhancements",
        "features": ["caching", "monitoring", "structured_logging"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "text_service",
        "version": "2.0.0",
        "cached_models": list(model_cache.cache.keys())
    }

@app.get("/metrics")
async def get_metrics():
    """Get performance metrics"""
    from shared.monitoring import get_performance_report
    return get_performance_report()

# Include router
app.include_router(router, prefix="/v1")

# Startup event - warm up cache
@app.on_event("startup")
async def startup_event():
    logger.info("Service starting up - warming cache...")
    # Pre-load model into cache
    get_analyzer()
    logger.info("Cache warmed - service ready")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
