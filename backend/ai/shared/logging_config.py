"""
Centralized Logging Configuration
Provides structured logging for all backend services
"""

import logging
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for better parsing"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "service": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
            
        return json.dumps(log_data)

def setup_logger(
    service_name: str,
    log_level: str = "INFO",
    log_dir: Optional[str] = None,
    use_json: bool = False
) -> logging.Logger:
    """
    Setup logger for a service
    
    Args:
        service_name: Name of the service (e.g., 'text_service')
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_dir: Directory for log files (None = console only)
        use_json: Use JSON formatting for logs
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(service_name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    if use_json:
        console_formatter = JSONFormatter()
    else:
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File Handler (if log_dir specified)
    if log_dir:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        
        # Info/Debug log file
        info_file = log_path / f"{service_name}.log"
        file_handler = logging.FileHandler(info_file)
        file_handler.setLevel(logging.INFO)
        
        if use_json:
            file_formatter = JSONFormatter()
        else:
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
        
        # Error log file
        error_file = log_path / f"{service_name}_error.log"
        error_handler = logging.FileHandler(error_file)
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(file_formatter)
        logger.addHandler(error_handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger

def log_request(logger: logging.Logger, request_id: str, method: str, path: str, user_id: Optional[int] = None):
    """Log incoming request"""
    extra = {"request_id": request_id}
    if user_id:
        extra["user_id"] = user_id
    logger.info(f"Incoming {method} request to {path}", extra=extra)

def log_response(logger: logging.Logger, request_id: str, status_code: int, duration_ms: float):
    """Log outgoing response"""
    extra = {
        "request_id": request_id,
        "duration_ms": duration_ms
    }
    logger.info(f"Response {status_code} in {duration_ms:.2f}ms", extra=extra)

def log_model_inference(logger: logging.Logger, model_name: str, duration_ms: float, from_cache: bool = False):
    """Log model inference timing"""
    cache_status = "cached" if from_cache else "fresh"
    logger.info(f"Model '{model_name}' inference ({cache_status}) completed in {duration_ms:.2f}ms")

# Example usage
if __name__ == "__main__":
    # Setup logger
    logger = setup_logger("test_service", log_level="DEBUG", log_dir="backend/logs", use_json=True)
    
    # Test logging
    logger.debug("This is a debug message")
    logger.info("Service started successfully")
    logger.warning("This is a warning")
    logger.error("This is an error")
    
    # Test structured logging
    log_request(logger, "req-123", "POST", "/analyze", user_id=42)
    log_response(logger, "req-123", 200, 150.5)
    log_model_inference(logger, "text_analyzer", 45.2, from_cache=True)
    
    print("\nLog files created in backend/logs/")
