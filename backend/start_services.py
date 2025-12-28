"""
Quick Start Script for All Backend Services
Launches all microservices with enhanced features
"""

import subprocess
import sys
import os
import time
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(msg):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"{msg}")
    print(f"{'='*60}{Colors.ENDC}\n")

def print_success(msg):
    print(f"{Colors.OKGREEN}[OK]{Colors.ENDC} {msg}")

def print_info(msg):
    print(f"{Colors.OKCYAN}[INFO]{Colors.ENDC} {msg}")

def print_warning(msg):
    print(f"{Colors.WARNING}[WARN]{Colors.ENDC} {msg}")

def print_error(msg):
    print(f"{Colors.FAIL}[ERROR]{Colors.ENDC} {msg}")

def check_dependencies():
    """Check if required dependencies are installed"""
    print_header("Checking Dependencies")
    
    required = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'sqlalchemy': 'SQLAlchemy',
        'pydantic': 'Pydantic'
    }
    
    missing = []
    for module, name in required.items():
        try:
            __import__(module)
            print_success(f"{name} installed")
        except ImportError:
            print_error(f"{name} NOT installed")
            missing.append(module)
    
    if missing:
        print_warning(f"\nMissing dependencies: {', '.join(missing)}")
        print_info("Install with: pip install " + " ".join(missing))
        return False
    
    return True

def start_service(name, port, enhanced=True):
    """Start a single service"""
    service_dir = Path(f"{name}_service")
    
    if enhanced and (service_dir / "main_enhanced.py").exists():
        script = "main_enhanced.py"
        version = "v2.0 (Enhanced)"
    else:
        script = "main.py"
        version = "v1.0"
    
    print_info(f"Starting {name.title()} Service {version} on port {port}...")
    
    try:
        # Start service in background
        process = subprocess.Popen(
            [sys.executable, script],
            cwd=service_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        time.sleep(2)  # Give it time to start
        
        # Check if still running
        if process.poll() is None:
            print_success(f"{name.title()} Service running on http://localhost:{port}")
            return process
        else:
            stdout, stderr = process.communicate()
            print_error(f"{name.title()} Service failed to start")
            if stderr:
                print(stderr.decode())
            return None
    
    except Exception as e:
        print_error(f"Failed to start {name} service: {e}")
        return None

def main():
    print_header("Backend Services Launcher")
    print_info("Enhanced version with caching, monitoring, and logging")
    
    # Check dependencies
    if not check_dependencies():
        print_error("\nPlease install missing dependencies first")
        return
    
    print_header("Starting Services")
    
    services = [
        ("auth", 8001),
        ("text", 8002),
        ("voice", 8003),
        ("face", 8004),
        ("fusion", 8005),
        ("doctor", 8006),
        ("notification", 8007),
        ("mood_journal", 8008),
        ("report", 8009),
        ("chatbot", 8010),
    ]
    
    processes = []
    
    for name, port in services:
        process = start_service(name, port, enhanced=True)
        if process:
            processes.append((name, process))
    
    if not processes:
        print_error("\nNo services started successfully")
        return
    
    print_header("Services Running")
    print_info(f"Started {len(processes)}/{len(services)} services")
    print_info("\nEndpoints:")
    for name, _ in processes:
        port = dict(services)[name]
        print(f"  - {name.title()}: http://localhost:{port}")
        print(f"    Health: http://localhost:{port}/health")
        print(f"    Metrics: http://localhost:{port}/metrics")
    
    print_info("\nPress Ctrl+C to stop all services")
    
    try:
        # Wait for user interrupt
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_header("Shutting Down Services")
        for name, process in processes:
            print_info(f"Stopping {name} service...")
            process.terminate()
            process.wait(timeout=5)
        print_success("\nAll services stopped")

if __name__ == "__main__":
    main()
