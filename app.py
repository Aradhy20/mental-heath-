import sys
import os

# Robust path addition
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.main import app
except ImportError:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/")
    async def root():
        return {"message": "Fallback app in root app.py"}
