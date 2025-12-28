"""
Performance Monitoring Utilities
Track and report performance metrics for backend services
"""

import time
import functools
from typing import Dict, List, Callable, Optional
from datetime import datetime
from collections import defaultdict
import statistics

class PerformanceMonitor:
    """Track performance metrics across services"""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = defaultdict(list)
        self.request_counts: Dict[str, int] = defaultdict(int)
        self.error_counts: Dict[str, int] = defaultdict(int)
    
    def track_duration(self, operation: str, duration_ms: float):
        """Track operation duration"""
        self.metrics[operation].append(duration_ms)
    
    def increment_requests(self, endpoint: str):
        """Increment request counter"""
        self.request_counts[endpoint] += 1
    
    def increment_errors(self, endpoint: str):
        """Increment error counter"""
        self.error_counts[endpoint] += 1
    
    def get_stats(self, operation: str) -> Optional[Dict]:
        """Get statistics for an operation"""
        if operation not in self.metrics or not self.metrics[operation]:
            return None
        
        durations = self.metrics[operation]
        return {
            "operation": operation,
            "count": len(durations),
            "avg_ms": statistics.mean(durations),
            "min_ms": min(durations),
            "max_ms": max(durations),
            "median_ms": statistics.median(durations),
            "p95_ms": self._percentile(durations, 95),
            "p99_ms": self._percentile(durations, 99)
        }
    
    def get_all_stats(self) -> Dict:
        """Get all statistics"""
        return {
            "operations": {op: self.get_stats(op) for op in self.metrics.keys()},
            "requests": dict(self.request_counts),
            "errors": dict(self.error_counts)
        }
    
    def _percentile(self, data: List[float], percentile: float) -> float:
        """Calculate percentile"""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def reset(self):
        """Reset all metrics"""
        self.metrics.clear()
        self.request_counts.clear()
        self.error_counts.clear()

# Global monitor instance
monitor = PerformanceMonitor()

def track_performance(operation_name: str):
    """Decorator to track function performance"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                monitor.track_duration(operation_name, duration_ms)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                monitor.track_duration(f"{operation_name}_error", duration_ms)
                raise
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                monitor.track_duration(operation_name, duration_ms)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                monitor.track_duration(f"{operation_name}_error", duration_ms)
                raise
        
        # Return appropriate wrapper based on whether function is async
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

class RequestTimer:
    """Context manager for timing requests"""
    
    def __init__(self, operation: str, logger=None):
        self.operation = operation
        self.logger = logger
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000
        monitor.track_duration(self.operation, duration_ms)
        
        if self.logger:
            if exc_type is None:
                self.logger.info(f"{self.operation} completed in {duration_ms:.2f}ms")
            else:
                self.logger.error(f"{self.operation} failed after {duration_ms:.2f}ms")

def get_performance_report() -> Dict:
    """Get formatted performance report"""
    stats = monitor.get_all_stats()
    
    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "summary": {
            "total_operations": sum(len(v) for v in monitor.metrics.values()),
            "total_requests": sum(monitor.request_counts.values()),
            "total_errors": sum(monitor.error_counts.values())
        },
        "operations": stats["operations"],
        "endpoints": {
            "requests": stats["requests"],
            "errors": stats["errors"]
        }
    }
    
    return report

# Example usage
if __name__ == "__main__":
    # Test decorator
    @track_performance("test_operation")
    def test_function():
        time.sleep(0.1)
        return "done"
    
    # Run multiple times
    for _ in range(10):
        test_function()
    
    # Test context manager
    for i in range(5):
        with RequestTimer("database_query"):
            time.sleep(0.05 * (i + 1))
    
    # Get stats
    print("Performance Stats:")
    stats = monitor.get_stats("test_operation")
    if stats:
        print(f"  Average: {stats['avg_ms']:.2f}ms")
        print(f"  P95: {stats['p95_ms']:.2f}ms")
    
    # Get full report
    import json
    report = get_performance_report()
    print("\nFull Report:")
    print(json.dumps(report, indent=2))
