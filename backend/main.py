"""
FastAPI Application - Main Entrypoint
This file exports the FastAPI app instance with all AI services integrated.
Can be used for local development and deployment to various platforms.
"""
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

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
        "service": "mindful_ai_backend"
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
    print("✓ Text service loaded successfully")
except Exception as e:
    print(f"✗ Failed to load text_service: {e}")

# Try to import voice service
try:
    from voice_service.main import router as voice_router
    app.include_router(voice_router, prefix="/v1", tags=["voice-analysis"])
    services_loaded.append("voice_service")
    print("✓ Voice service loaded successfully")
except Exception as e:
    print(f"✗ Failed to load voice_service: {e}")

# Try to import face service
try:
    from face_service.main import router as face_router
    app.include_router(face_router, prefix="/v1", tags=["face-analysis"])
    services_loaded.append("face_service")
    print("✓ Face service loaded successfully")
except Exception as e:
    print(f"✗ Failed to load face_service: {e}")

# Endpoint to check loaded services
@app.get("/api/services")
async def get_loaded_services():
    return {
        "services_loaded": services_loaded,
        "total": len(services_loaded)
    }

# For local development
if __name__ == "__main__":
    import uvicorn
    print(f"\n{'='*60}")
    print(f"MindfulAI Backend API v2.0.0")
    print(f"Loaded services: {', '.join(services_loaded) if services_loaded else 'None'}")
    print(f"{'='*60}\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

