import sys
import os

# Robust path addition
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.append(root_path)

try:
    from backend.api.index import app
except ImportError:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api")
    async def api_root():
        return {"message": "Fallback app in root api/index.py"}
    
    @app.get("/api/health")
    async def health():
        return {"status": "ok", "source": "fallback"}
