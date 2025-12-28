import sys
import os

# Add the shared directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv
import json

import models
import text_analyzer
from models import TextInput, TextAnalysisResult, TextAnalysisResponse, ContextualAnalysisRequest, ContextualAnalysisResponse
from text_analyzer import analyzer
from shared.mongodb import text_collection, fix_id

# Load environment variables
load_dotenv()

app = FastAPI(title="Text Analysis Service (MongoDB)", version="3.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Routes
@router.post("/analyze/text", response_model=TextAnalysisResponse)
async def analyze_text(input_data: TextInput):
    """
    Analyze text for emotional content
    """
    try:
        # Perform text analysis
        emotion_label, emotion_score, confidence = analyzer.analyze_emotion(input_data.text)
        
        # Save to MongoDB
        doc = {
            "user_id": str(input_data.user_id),
            "input_text": input_data.text,
            "emotion_label": emotion_label,
            "emotion_score": float(emotion_score),
            "confidence": float(confidence),
            "created_at": datetime.utcnow()
        }
        
        result = await text_collection.insert_one(doc)
        doc_id = str(result.inserted_id)
        
        # Create result object
        analysis_result = TextAnalysisResult(
            text_id=doc_id,
            user_id=str(input_data.user_id),
            input_text=input_data.text,
            emotion_label=emotion_label,
            emotion_score=round(emotion_score, 4),
            confidence=round(confidence, 4)
        )
        
        return TextAnalysisResponse(
            result=analysis_result,
            message="Text analysis completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/analyze/text/contextual", response_model=ContextualAnalysisResponse)
async def analyze_text_contextual(input_data: ContextualAnalysisRequest):
    """
    Analyze text with contextual understanding using RAG and vector database
    """
    try:
        # Perform contextual analysis
        contextual_result = analyzer.analyze_with_context(input_data.text)
        
        # Save to MongoDB
        emotion_data = contextual_result["emotion_analysis"]
        doc = {
            "user_id": str(input_data.user_id),
            "input_text": input_data.text,
            "emotion_label": emotion_data["emotion_label"],
            "emotion_score": float(emotion_data["emotion_score"]),
            "confidence": float(emotion_data["confidence"]),
            "contextual_response": contextual_result["contextual_response"],
            "risk_level": contextual_result["risk_level"],
            "created_at": datetime.utcnow()
        }
        await text_collection.insert_one(doc)
        
        # Format knowledge documents
        knowledge_docs = []
        for doc_item in contextual_result["relevant_knowledge"]:
            knowledge_docs.append({
                "id": doc_item["id"],
                "content": doc_item["content"],
                "metadata": doc_item.get("metadata"),
                "distance": doc_item.get("distance")
            })
        
        # Create result object
        result = {
            "emotion_analysis": contextual_result["emotion_analysis"],
            "contextual_response": contextual_result["contextual_response"],
            "relevant_knowledge": knowledge_docs,
            "risk_level": contextual_result["risk_level"],
            "recommendations": contextual_result["recommendations"]
        }
        
        return ContextualAnalysisResponse(
            result=result,
            message="Contextual text analysis completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contextual text analysis failed: {str(e)}")

@router.get("/analyze/emotion/history")
async def get_emotion_history(user_id: str, days: int = 30):
    """
    Get emotion history for a user from MongoDB
    """
    try:
        from datetime import timedelta
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = text_collection.find({
            "user_id": str(user_id),
            "created_at": {"$gte": start_date}
        }).sort("created_at", -1).limit(100)
        
        results = await cursor.to_list(length=100)
        
        formatted_results = []
        for r in results:
            formatted_results.append({
                "text_id": str(r["_id"]),
                "user_id": r["user_id"],
                "text": r["input_text"],
                "emotion_label": r["emotion_label"],
                "confidence": r["confidence"],
                "created_at": r["created_at"]
            })
        
        return {
            "user_id": user_id,
            "days": days,
            "count": len(formatted_results),
            "history": formatted_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch emotion history: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Text Analysis Service is running (MongoDB)",
        "version": "3.0.0",
        "database": "mongodb"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "text_service",
        "version": "3.0.0",
        "database": "mongodb"
    }

# Include router with /v1 prefix
app.include_router(router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)