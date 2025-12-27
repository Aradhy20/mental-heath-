"""
Vercel Entrypoint for FastAPI Application
This file exports the FastAPI app instance for Vercel's serverless platform.
Integrates all AI services: text, voice, and face analysis
"""
import sys
import os

# Add parent directory to Python path to import services
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI(
    title="MindfulAI Backend API",
    version="2.0.0",
    description="Mental Health AI Services - Text, Voice & Face Analysis"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@app.get("/")
async def root():
    return {
        "message": "MindfulAI Backend API",
        "status": "running",
        "version": "2.0.0",
        "platform": "Vercel Serverless",
        "services": {
            "text_analysis": "/v1/analyze/text",
            "voice_analysis": "/v1/analyze/voice",
            "face_analysis": "/v1/analyze/face",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mindful_ai_backend",
        "services_loaded": []
    }

@app.get("/api/status")
async def api_status():
    return {
        "api": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }

# Import and include service routers
services_loaded = []

# Try to import text service
try:
    from text_service.main import router as text_router
    app.include_router(text_router, prefix="/v1", tags=["text-analysis"])
    services_loaded.append("text_service")
except Exception as e:
    print(f"Failed to load text_service: {e}")

# Try to import voice service
try:
    from voice_service.main import router as voice_router
    app.include_router(voice_router, prefix="/v1", tags=["voice-analysis"])
    services_loaded.append("voice_service")
except Exception as e:
    print(f"Failed to load voice_service: {e}")

# Try to import face service
try:
    from face_service.main import router as face_router
    app.include_router(face_router, prefix="/v1", tags=["face-analysis"])
    services_loaded.append("face_service")
except Exception as e:
    print(f"Failed to load face_service: {e}")

# Update health check with loaded services
@app.get("/api/services")
async def get_loaded_services():
    return {
        "services_loaded": services_loaded,
        "total": len(services_loaded)
    }
