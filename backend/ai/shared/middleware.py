"""
FastAPI Middleware for Request Tracking and Performance
"""

import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to each request"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Track request/response performance"""
    
    def __init__(self, app: ASGIApp, logger: logging.Logger = None):
        super().__init__(app)
        self.logger = logger
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get request ID if available
        request_id = getattr(request.state, "request_id", "unknown")
        
        # Log request
        if self.logger:
            self.logger.info(
                f"Request started: {request.method} {request.url.path}",
                extra={"request_id": request_id}
            )
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Add performance header
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        # Log response
        if self.logger:
            self.logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code} in {duration_ms:.2f}ms",
                extra={
                    "request_id": request_id,
                    "duration_ms": duration_ms,
                    "status_code": response.status_code
                }
            )
        
        return response

class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    """Log all errors with context"""
    
    def __init__(self, app: ASGIApp, logger: logging.Logger = None):
        super().__init__(app)
        self.logger = logger
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            request_id = getattr(request.state, "request_id", "unknown")
            
            if self.logger:
                self.logger.error(
                    f"Request failed: {request.method} {request.url.path} - {str(e)}",
                    extra={"request_id": request_id},
                    exc_info=True
                )
            
            # Re-raise to let FastAPI handle the error response
            raise
