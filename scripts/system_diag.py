import asyncio
import httpx
import socket

SERVICES = {
    "MongoDB Cluster": ("127.0.0.1", 27017),
    "Express API Gateway": "http://localhost:5000/health",
    "AI Text Analyzer (T)": "http://localhost:8002/health",
    "AI Voice Analyzer (V)": "http://localhost:8003/health",
    "AI Face Analyzer (S)": "http://localhost:8004/health",
}

async def check_http(name, url):
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'ONLINE')
                return name, True, f"{status} (HTTP 200)"
            return name, False, f"OFFLINE (HTTP {response.status_code})"
    except Exception as e:
        return name, False, f"UNREACHABLE"

async def check_port(name, host_port):
    host, port = host_port
    try:
        with socket.create_connection((host, port), timeout=1):
            return name, True, f"CONNECTED (Port {port})"
    except:
        return name, False, f"OFFLINE (Port {port})"

async def run_diagnostics():
    print("-" * 75)
    print("   NEURAL NEST - PRE-FLIGHT CHECK (T.V.S & MONGODB PROTOCOLS)")
    print("-" * 75 + "\n")

    tasks = [
        check_port("MongoDB Domain", SERVICES["MongoDB Cluster"]),
        check_http("Express API Gateway", SERVICES["Express API Gateway"]),
        check_http("AI Text Analyzer (T)", SERVICES["AI Text Analyzer (T)"]),
        check_http("AI Voice Analyzer (V)", SERVICES["AI Voice Analyzer (V)"]),
        check_http("AI Face Analyzer (S)", SERVICES["AI Face Analyzer (S)"]),
    ]
    
    results = await asyncio.gather(*tasks)
    
    for name, ok, msg in results:
        status_icon = "[OK]" if ok else "[XX]"
        print(f"{status_icon} {name:30} : {msg}")

    print("\n" + "-" * 75)
    print("📋 Testing OTP Subsystem (Auth Gateway Protocol)...")
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post("http://localhost:5000/api/auth/request-otp", json={"phone": "+919999999999"})
            if resp.status_code == 200:
                print("OK   OTP Request Protocol: VERIFIED (Status 200)")
            elif resp.status_code == 404:
                print("OK   OTP Status: NO ACCOUNT FOUND (Handled Correctly)")
            else:
                print(f"XX   OTP Flow Failure: HTTP {resp.status_code}")
    except:
        print("XX   OTP Subsystem: UNREACHABLE")

    print("-" * 75 + "\n")

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
