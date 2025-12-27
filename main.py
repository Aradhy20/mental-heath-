import sys
import os
from fastapi import FastAPI

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Initialize app immediately
app = FastAPI(title="Root Main App")

try:
    from backend.main import app as backend_app
    app = backend_app
except ImportError as e:
    @app.get("/")
    async def root():
        return {"status": "import_error", "message": str(e)}

