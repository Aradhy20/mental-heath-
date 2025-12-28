"""
Start All Backend Services - Fixed for Current Setup
"""

import subprocess
import sys
import time
from pathlib import Path

def start_service(name, port):
    """Start a FastAPI service"""
    service_dir = Path(f"{name}_service")
    
    if not service_dir.exists():
        print(f"⚠️  {name} service directory not found, skipping")
        return None
    
    main_file = service_dir / "main.py"
    if not main_file.exists():
        print(f"⚠️  {name} service main.py not found, skipping")
        return None
    
    print(f"🚀 Starting {name.title()} Service on port {port}...")
    
    try:
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", f"--port={port}", "--reload"],
            cwd=service_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        time.sleep(1)
        
        if process.poll() is None:
            print(f"✅ {name.title()} Service: http://localhost:{port}")
            return process
        else:
            print(f"❌ {name.title()} Service failed to start")
            return None
            
    except Exception as e:
        print(f"❌ Error starting {name}: {e}")
        return None

def main():
    print("=" * 60)
    print("🏥 Mental Health App - Backend Services")
    print("=" * 60)
    print()
    
    # Services that actually exist
    services = [
        ("auth", 8001),
        ("text", 8002),
        ("voice", 8003),
        ("face", 8004),
        ("fusion", 8005),
        ("mood_journal", 8008),
    ]
    
    processes = []
    
    for name, port in services:
        process = start_service(name, port)
        if process:
            processes.append((name, port, process))
        time.sleep(0.5)
    
    if not processes:
        print("\n❌ No services started")
        return
    
    print()
    print("=" * 60)
    print(f"✅ {len(processes)}/{len(services)} Services Running")
    print("=" * 60)
    print()
    print("Endpoints:")
    for name, port, _ in processes:
        print(f"  • {name.title():15} http://localhost:{port}")
    
    print()
    print("Health Checks:")
    for name, port, _ in processes:
        print(f"  • http://localhost:{port}/health")
    
    print()
    print("🔗 Frontend: http://localhost:3000")
    print()
    print("Press Ctrl+C to stop all services")
    print("=" * 60)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down services...")
        for name, port, process in processes:
            print(f"   Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
            except:
                process.kill()
        print("\n✅ All services stopped\n")

if __name__ == "__main__":
    main()
