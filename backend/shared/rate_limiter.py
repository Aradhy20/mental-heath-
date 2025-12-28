"""
Rate limiting middleware for FastAPI services
Prevents API abuse and ensures fair usage
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio


class RateLimiter:
    """
    Simple in-memory rate limiter
    For production, use Redis-based rate limiting
    """
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.cleanup_interval = 60  # seconds
        self.last_cleanup = time.time()
    
    def _cleanup_old_requests(self):
        """Remove requests older than 1 minute"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            cutoff_time = current_time - 60
            for ip in list(self.requests.keys()):
                self.requests[ip] = [
                    req_time for req_time in self.requests[ip]
                    if req_time > cutoff_time
                ]
                if not self.requests[ip]:
                    del self.requests[ip]
            self.last_cleanup = current_time
    
    def is_allowed(self, client_ip: str) -> tuple[bool, int]:
        """
        Check if request is allowed
        Returns: (is_allowed, remaining_requests)
        """
        self._cleanup_old_requests()
        
        current_time = time.time()
        cutoff_time = current_time - 60
        
        # Get recent requests from this IP
        recent_requests = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff_time
        ]
        
        # Check if limit exceeded
        if len(recent_requests) >= self.requests_per_minute:
            return False, 0
        
        # Add current request
        self.requests[client_ip].append(current_time)
        remaining = self.requests_per_minute - len(recent_requests) - 1
        
        return True, remaining


# Global rate limiter instance
rate_limiter = RateLimiter(requests_per_minute=60)


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware
    
    Usage:
        from shared.rate_limiter import rate_limit_middleware
        
        app = FastAPI()
        app.middleware("http")(rate_limit_middleware)
    """
    # Get client IP
    client_ip = request.client.host
    
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    # Check rate limit
    is_allowed, remaining = rate_limiter.is_allowed(client_ip)
    
    if not is_allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "detail": f"Too many requests. Please try again later.",
                "retry_after": 60
            },
            headers={
                "X-RateLimit-Limit": str(rate_limiter.requests_per_minute),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 60),
                "Retry-After": "60"
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.requests_per_minute)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60)
    
    return response


def add_rate_limiting(app, requests_per_minute: int = 60):
    """
    Add rate limiting to FastAPI app
    
    Usage:
        from shared.rate_limiter import add_rate_limiting
        
        app = FastAPI()
        add_rate_limiting(app, requests_per_minute=100)
    """
    global rate_limiter
    rate_limiter = RateLimiter(requests_per_minute=requests_per_minute)
    app.middleware("http")(rate_limit_middleware)
