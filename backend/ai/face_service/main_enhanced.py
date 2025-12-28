"""
Enhanced Face Analysis Service with Performance Optimizations
Includes: caching, logging, monitoring, and improved error handling
"""

from fastapi import FastAPI, HTTPException, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
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
from face_analyzer import analyzer
from database import get_db
from models import FaceAnalysisModel

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(
    "face_service",
    log_level="INFO",
    log_dir="backend/logs",
    use_json=False
)

logger.info("Initializing Face Analysis Service...")

# Initialize FastAPI app
app = FastAPI(
    title="Face Analysis Service",
    version="2.0.0",
    description="Enhanced face analysis with caching and monitoring"
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
class FaceInput(BaseModel):
    user_id: int
    image_data: bytes

class FaceAnalysisResult(BaseModel):
    face_id: int
    user_id: int
    emotion: str
    emotion_score: float
    confidence: float

class FaceAnalysisResponse(BaseModel):
    result: FaceAnalysisResult
    message: str

class MicroExpressionResult(BaseModel):
    detected: bool
    expressions: list

# Create API Router
router = APIRouter()

# Cached model initialization
@cache_model("face_analyzer")
def get_analyzer():
    """Get or load the face analyzer (cached)"""
    logger.info("Loading face analyzer model...")
    return analyzer

# Routes
@router.post("/analyze/face", response_model=FaceAnalysisResponse)
@track_performance("face_analysis")
async def analyze_face(input_data: FaceInput, request: Request, db: Session = Depends(get_db)):
    """
    Analyze face for emotion detection (with caching and monitoring)
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info(f"Processing face analysis for user {input_data.user_id}", extra={"request_id": request_id})
    
    try:
        # Get cached analyzer
        start_time = time.time()
        face_analyzer = get_analyzer()
        load_time_ms = (time.time() - start_time) * 1000
        
        from_cache = model_cache.get("face_analyzer") is not None
        log_model_inference(logger, "face_analyzer_load", load_time_ms, from_cache)
        
        # Perform analysis
        with RequestTimer("emotion_detection", logger):
            emotion, emotion_score, confidence = face_analyzer.analyze_emotion(input_data.image_data)
        
        # Create result
        import random
        result = FaceAnalysisResult(
            face_id=random.randint(1000, 9999),
            user_id=input_data.user_id,
            emotion=emotion,
            emotion_score=round(emotion_score, 4),
            confidence=round(confidence, 4)
        )
        
        # Save to database
        with RequestTimer("database_insert", logger):
            db_result = FaceAnalysisModel(
                user_id=input_data.user_id,
                emotion=emotion,
                emotion_score=round(emotion_score, 4),
                confidence=round(confidence, 4)
            )
            db.add(db_result)
            db.commit()
            db.refresh(db_result)
        
        logger.info(f"Face analysis completed: {emotion} ({confidence:.2f})", extra={"request_id": request_id})
        monitor.increment_requests("analyze_face")
        
        return FaceAnalysisResponse(
            result=result,
            message="Face analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Face analysis failed: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        monitor.increment_errors("analyze_face")
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")

@router.post("/analyze/micro-expressions")
@track_performance("micro_expression_analysis")
async def analyze_micro_expressions(input_data: FaceInput, request: Request):
    """Analyze micro-expressions"""
    request_id = getattr(request.state, "request_id", "unknown")
    
    try:
        face_analyzer = get_analyzer()
        
        with RequestTimer("micro_expression_detection", logger):
            result = face_analyzer.analyze_micro_expressions(input_data.image_data)
        
        monitor.increment_requests("micro_expressions")
        return result
    
    except Exception as e:
        logger.error(f"Micro-expression analysis failed: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        monitor.increment_errors("micro_expressions")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "Face Analysis Service v2.0 with Performance Enhancements",
        "features": ["caching", "monitoring", "structured_logging", "micro_expressions"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "face_service",
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

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Service starting up - warming cache...")
    get_analyzer()
    logger.info("Cache warmed - service ready")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
