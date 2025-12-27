import sys
import os

# Add root directory to sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI

try:
    # Try importing as a package from root
    from backend.main import app as backend_app
    app = backend_app
except ImportError as e:
    app = FastAPI()
    @app.get("/app-health")
    async def health():
        return {"status": "error", "message": f"Could not import backend in app.py: {str(e)}"}

# For Vercel discovery
app = app
