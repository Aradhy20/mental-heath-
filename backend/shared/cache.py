"""
Caching Utilities for Backend Services
Provides in-memory caching for AI models and frequently accessed data
"""

import functools
import time
from typing import Any, Callable, Dict, Optional
from datetime import datetime, timedelta
import threading

class TTLCache:
    """Time-To-Live cache implementation"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, tuple] = {}  # {key: (value, expiry_time)}
        self.ttl = ttl_seconds
        self.lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        with self.lock:
            if key in self.cache:
                value, expiry = self.cache[key]
                if time.time() < expiry:
                    return value
                else:
                    # Expired, remove it
                    del self.cache[key]
            return None
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache with TTL"""
        with self.lock:
            expiry = time.time() + self.ttl
            self.cache[key] = (value, expiry)
    
    def clear(self) -> None:
        """Clear all cache"""
        with self.lock:
            self.cache.clear()
    
    def cleanup_expired(self) -> int:
        """Remove expired entries, returns number removed"""
        with self.lock:
            current_time = time.time()
            expired_keys = [k for k, (_, exp) in self.cache.items() if current_time >= exp]
            for key in expired_keys:
                del self.cache[key]
            return len(expired_keys)

# Global caches
model_cache = TTLCache(ttl_seconds=3600)  # 1 hour TTL for models
data_cache = TTLCache(ttl_seconds=300)     # 5 minutes TTL for data

def cache_model(key: str):
    """Decorator to cache model instances"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Check cache first
            cached_model = model_cache.get(key)
            if cached_model is not None:
                print(f"[CACHE HIT] Model '{key}' loaded from cache")
                return cached_model
            
            # Load model
            print(f"[CACHE MISS] Loading model '{key}'...")
            model = func(*args, **kwargs)
            
            # Store in cache
            model_cache.set(key, model)
            print(f"[CACHE SET] Model '{key}' cached for reuse")
            
            return model
        return wrapper
    return decorator

def cache_result(ttl_seconds: int = 300):
    """Decorator to cache function results"""
    cache = TTLCache(ttl_seconds=ttl_seconds)
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and args
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            cache.set(cache_key, result)
            
            return result
        return wrapper
    return decorator

def clear_all_caches():
    """Clear all caches"""
    model_cache.clear()
    data_cache.clear()
    print("[CACHE] All caches cleared")

if __name__ == "__main__":
    # Test the cache
    @cache_model("test_model")
    def load_test_model():
        time.sleep(2)  # Simulate slow loading
        return {"model": "loaded"}
    
    # First call - slow
    start = time.time()
    model1 = load_test_model()
    print(f"First load: {time.time() - start:.2f}s")
    
    # Second call - fast (cached)
    start = time.time()
    model2 = load_test_model()
    print(f"Second load: {time.time() - start:.2f}s")
    
    assert model1 is model2, "Should return same cached instance"
    print("Cache test passed!")
