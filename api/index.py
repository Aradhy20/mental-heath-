import sys
import os

# Add the root directory to sys.path so we can import 'backend'
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI

try:
    # Try importing the app from the backend package
    from backend.api.index import app as backend_app
    app = backend_app
except ImportError as e:
    # Diagnostic app to show the error if it fails on Vercel
    app = FastAPI()
    @app.get("/api/health")
    async def health():
        return {
            "status": "partial_error", 
            "message": f"Could not import backend.api.index. Error: {str(e)}",
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }

# For Vercel discovery
app = app


