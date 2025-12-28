"""
CSRF Protection Middleware
Protects against Cross-Site Request Forgery attacks
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import secrets
import hashlib
from typing import Optional


class CSRFProtection:
    """CSRF protection middleware for FastAPI"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.safe_methods = {"GET", "HEAD", "OPTIONS"}
        self.csrf_header_name = "X-CSRF-Token"
        self.csrf_cookie_name = "csrf_token"
    
    def generate_csrf_token(self) -> str:
        """Generate a new CSRF token"""
        token = secrets.token_urlsafe(32)
        return token
    
    def verify_csrf_token(self, token: str, cookie_token: str) -> bool:
        """Verify CSRF token matches cookie"""
        return secrets.compare_digest(token, cookie_token)
    
    async def __call__(self, request: Request, call_next):
        """CSRF middleware"""
        # Skip CSRF check for safe methods
        if request.method in self.safe_methods:
            return await call_next(request)
        
        # Skip CSRF check for API endpoints with Bearer token
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return await call_next(request)
        
        # Get CSRF token from header
        csrf_token = request.headers.get(self.csrf_header_name)
        
        # Get CSRF token from cookie
        csrf_cookie = request.cookies.get(self.csrf_cookie_name)
        
        # Verify tokens
        if not csrf_token or not csrf_cookie:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "CSRF token missing"}
            )
        
        if not self.verify_csrf_token(csrf_token, csrf_cookie):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "CSRF token invalid"}
            )
        
        # Process request
        response = await call_next(request)
        return response


def add_csrf_protection(app, secret_key: str):
    """
    Add CSRF protection to FastAPI app
    
    Usage:
        from shared.csrf_protection import add_csrf_protection
        
        app = FastAPI()
        add_csrf_protection(app, secret_key="your-secret-key")
    """
    csrf = CSRFProtection(secret_key)
    app.middleware("http")(csrf)
    
    # Add endpoint to get CSRF token
    @app.get("/csrf-token")
    async def get_csrf_token():
        token = csrf.generate_csrf_token()
        response = JSONResponse({"csrf_token": token})
        response.set_cookie(
            key=csrf.csrf_cookie_name,
            value=token,
            httponly=True,
            secure=True,  # Only send over HTTPS
            samesite="strict"
        )
        return response
