import sys
import os

# Add the shared directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, HTTPException, APIRouter, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv
import random

import models
import voice_analyzer
from models import VoiceAnalysisResult, VoiceAnalysisResponse
from voice_analyzer import analyzer
from shared.mongodb import voice_collection, fix_id

# Load environment variables
load_dotenv()

app = FastAPI(title="Voice Analysis Service (MongoDB)", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

@router.post("/analyze/voice", response_model=VoiceAnalysisResponse)
async def analyze_voice(
    user_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    """
    Analyze voice recording for stress and emotional indicators - MongoDB version
    """
    try:
        audio_data = await audio_file.read()
        voice_label, voice_score, confidence = analyzer.analyze_stress(audio_data)
        
        # Save to MongoDB
        doc = {
            "user_id": str(user_id),
            "voice_label": voice_label,
            "voice_score": float(voice_score),
            "confidence": float(confidence),
            "created_at": datetime.utcnow()
        }
        
        result = await voice_collection.insert_one(doc)
        doc_id = str(result.inserted_id)
        
        # Create result object
        analysis_result = VoiceAnalysisResult(
            voice_id=doc_id,
            user_id=str(user_id),
            voice_score=round(float(voice_score), 4),
            voice_label=voice_label,
            confidence=round(float(confidence), 4)
        )
        
        return VoiceAnalysisResponse(
            result=analysis_result,
            message="Voice analysis completed successfully"
        )
    except Exception as e:
        print(f"Error saving voice analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

@router.get("/analyze/voice/history")
async def get_voice_history(user_id: str, days: int = 30):
    """
    Get voice analysis history for a user from MongoDB
    """
    try:
        from datetime import timedelta
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = voice_collection.find({
            "user_id": str(user_id),
            "created_at": {"$gte": start_date}
        }).sort("created_at", -1).limit(100)
        
        results = await cursor.to_list(length=100)
        
        history = [
            {
                "voice_id": str(r["_id"]),
                "user_id": r["user_id"],
                "voice_label": r["voice_label"],
                "voice_score": r["voice_score"],
                "confidence": r["confidence"],
                "created_at": r["created_at"].isoformat()
            } for r in results
        ]
        
        return {
            "user_id": user_id,
            "days": days,
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch voice history: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Voice Analysis Service is running (MongoDB)",
        "version": "3.0.0",
        "database": "mongodb"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "voice_service",
        "version": "3.0.0",
        "database": "mongodb"
    }

app.include_router(router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)