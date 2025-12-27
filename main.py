import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from backend.main import app
except ImportError:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/")
    async def root():
        return {"status": "ok", "source": "root main.py"}
