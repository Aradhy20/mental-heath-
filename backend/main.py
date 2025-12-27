"""
FastAPI Application for Vercel Deployment
This file exports the FastAPI app instance for Vercel's serverless platform.
"""
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI(
    title="MindfulAI Backend API",
    version="1.0.0",
    description="Mental Health AI Services - Serverless Deployment"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "MindfulAI Backend API",
        "status": "running",
        "version": "1.0.0",
        "platform": "Vercel Serverless"
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

# Import and include routers if available
try:
    # Try to import text service routes
    from text_service.main import app as text_app
    
    # Mount text service routes
    @app.get("/api/text/analyze")
    async def analyze_text_proxy():
        return {"message": "Text analysis endpoint - configure full service for functionality"}
    
except ImportError:
    pass

# Export app for Vercel
# Vercel looks for 'app' variable in this file
