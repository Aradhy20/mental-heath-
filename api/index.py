import sys
import os
from fastapi import FastAPI

# Add root directory to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Initialize app with fallback immediately to satisfy static analysis
app = FastAPI(title="Fallback App")

try:
    # Try importing the real app from the backend package
    from backend.api.index import app as backend_app
    app = backend_app
except ImportError as e:
    # If import fails, we keep the fallback app but add a health route debugging info
    @app.get("/api/deployment-debug")
    async def debug():
        return {
            "status": "import_error", 
            "message": f"Could not import backend.api.index: {str(e)}",
            "cwd": os.getcwd(),
            "path": sys.path
        }

