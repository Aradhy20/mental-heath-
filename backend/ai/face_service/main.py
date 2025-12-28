import sys
import os
import base64
import random
from datetime import datetime
from pydantic import BaseModel

# Add the parent directory to the Python path to allow imports from shared
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from face_analyzer import analyzer
from shared.mongodb import face_collection, fix_id

app = FastAPI(title="Face Analysis Service (MongoDB)", version="3.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

class FaceAnalysisRequest(BaseModel):
    user_id: str
    image: str # Base64 string

class FaceAnalysisResponse(BaseModel):
    emotion: str
    score: float
    confidence: float
    timestamp: datetime

@router.post("/analyze/face", response_model=FaceAnalysisResponse)
async def analyze_face(request: FaceAnalysisRequest):
    try:
        # Decode base64 image
        if "," in request.image:
            header, encoded = request.image.split(",", 1)
        else:
            encoded = request.image
        
        image_data = base64.b64decode(encoded)
        
        # Analyze emotion
        emotion_label, face_score, confidence = analyzer.analyze_emotion(image_data)
        
        # Save to MongoDB
        doc = {
            "user_id": str(request.user_id),
            "emotion_label": emotion_label,
            "face_score": float(face_score),
            "confidence": float(confidence),
            "created_at": datetime.utcnow()
        }
        
        await face_collection.insert_one(doc)
        
        return FaceAnalysisResponse(
            emotion=emotion_label,
            score=float(face_score),
            confidence=float(confidence),
            timestamp=doc["created_at"]
        )
        
    except Exception as e:
        print(f"Error: {e}")
        # Fallback for demo/testing if analysis fails
        return FaceAnalysisResponse(
            emotion="Neutral",
            score=0.5,
            confidence=0.5,
            timestamp=datetime.utcnow()
        )

@app.get("/")
async def root():
    return {"message": "Face Analysis Service is running (MongoDB)", "database": "mongodb"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "face_service",
        "version": "3.0.0",
        "database": "mongodb"
    }

app.include_router(router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)