"""
Enhanced Voice Analysis Service with Performance Optimizations
Includes: caching, logging, monitoring, and improved error handling
"""

from fastapi import FastAPI, HTTPException, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import sys
import os
import time

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import shared utilities
from shared.cache import cache_model, model_cache
from shared.logging_config import setup_logger, log_model_inference
from shared.monitoring import track_performance, RequestTimer, monitor
from shared.middleware import RequestIDMiddleware, PerformanceMiddleware, ErrorLoggingMiddleware

# Import service-specific modules
from voice_analyzer import analyzer
from database import get_db
from models import VoiceAnalysisModel

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(
    "voice_service",
    log_level="INFO",
    log_dir="backend/logs",
    use_json=False
)

logger.info("Initializing Voice Analysis Service...")

# Initialize FastAPI app
app = FastAPI(
    title="Voice Analysis Service",
    version="2.0.0",
    description="Enhanced voice analysis with caching and monitoring"
)

# Add middleware
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
class VoiceInput(BaseModel):
    user_id: int
    audio_data: bytes

class VoiceAnalysisResult(BaseModel):
    voice_id: int
    user_id: int
    stress_level: str
    stress_score: float
    confidence: float

class VoiceAnalysisResponse(BaseModel):
    result: VoiceAnalysisResult
    message: str

# Create API Router
router = APIRouter()

# Cached model initialization
@cache_model("voice_analyzer")
def get_analyzer():
    """Get or load the voice analyzer (cached)"""
    logger.info("Loading voice analyzer model...")
    return analyzer

# Routes
@router.post("/analyze/voice", response_model=VoiceAnalysisResponse)
@track_performance("voice_analysis")
async def analyze_voice(input_data: VoiceInput, request: Request, db: Session = Depends(get_db)):
    """
    Analyze voice for stress detection (with caching and monitoring)
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info(f"Processing voice analysis for user {input_data.user_id}", extra={"request_id": request_id})
    
    try:
        # Get cached analyzer
        start_time = time.time()
        voice_analyzer = get_analyzer()
        load_time_ms = (time.time() - start_time) * 1000
        
        from_cache = model_cache.get("voice_analyzer") is not None
        log_model_inference(logger, "voice_analyzer_load", load_time_ms, from_cache)
        
        # Perform analysis
        with RequestTimer("stress_analysis", logger):
            stress_level, stress_score, confidence = voice_analyzer.analyze_stress(input_data.audio_data)
        
        # Create result
        import random
        result = VoiceAnalysisResult(
            voice_id=random.randint(1000, 9999),
            user_id=input_data.user_id,
            stress_level=stress_level,
            stress_score=round(stress_score, 4),
            confidence=round(confidence, 4)
        )
        
        # Save to database
        with RequestTimer("database_insert", logger):
            db_result = VoiceAnalysisModel(
                user_id=input_data.user_id,
                stress_level=stress_level,
                stress_score=round(stress_score, 4),
                confidence=round(confidence, 4)
            )
            db.add(db_result)
            db.commit()
            db.refresh(db_result)
        
        logger.info(f"Voice analysis completed: {stress_level} ({confidence:.2f})", extra={"request_id": request_id})
        monitor.increment_requests("analyze_voice")
        
        return VoiceAnalysisResponse(
            result=result,
            message="Voice analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Voice analysis failed: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        monitor.increment_errors("analyze_voice")
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Voice Analysis Service v2.0 with Performance Enhancements",
        "features": ["caching", "monitoring", "structured_logging"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "voice_service",
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
    get_analyzer()
    logger.info("Cache warmed - service ready")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
