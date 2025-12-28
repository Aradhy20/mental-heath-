from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Add the current directory to sys.path so submodules can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the fusion service as the primary entry point
# This handles text, voice, and face coordination
try:
    from fusion_service.main import app as fusion_app
    app = fusion_app
except ImportError as e:
    # If fusion import fails, create a fallback diagnostic app
    app = FastAPI(title="AI Services Gateway Fallback")
    
    @app.get("/")
    async def root():
        return {
            "status": "partial_health",
            "message": "Gateway running, but primary service failed to load",
            "error": str(e),
            "cwd": os.getcwd(),
            "path": sys.path
        }

# Ensure CORS is handled at the gateway level too
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
