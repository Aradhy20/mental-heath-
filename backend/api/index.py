"""
Vercel Entrypoint for FastAPI Application
This file exports the FastAPI app instance for Vercel's serverless platform.
"""
import sys
import os

# Add parent directory to path to import main
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import the app from main.py
from main import app

# Export app for Vercel
# Vercel will use this 'app' instance
__all__ = ['app']
