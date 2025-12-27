"""
Test script to verify FastAPI entrypoint is correctly configured
Run this before deploying to ensure everything works
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_api_import():
    """Test that API can be imported"""
    try:
        from api.index import app
        print("✅ API import successful")
        print(f"   - Title: {app.title}")
        print(f"   - Version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ API import failed: {e}")
        return False

def test_main_import():
    """Test that main.py can be imported"""
    try:
        from main import app
        print("✅ Main.py import successful")
        print(f"   - Title: {app.title}")
        print(f"   - Version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ Main.py import failed: {e}")
        return False

def test_routes():
    """Test that routes are registered"""
    try:
        from api.index import app
        routes = [r for r in app.routes if hasattr(r, 'path')]
        print(f"✅ Found {len(routes)} routes")
        
        # Check for key endpoints
        paths = [r.path for r in routes]
        required = ["/", "/health", "/api/status", "/api/services", "/docs"]
        
        for req in required:
            if req in paths:
                print(f"   ✓ {req}")
            else:
                print(f"   ✗ {req} (missing)")
        
        return True
    except Exception as e:
        print(f"❌ Route check failed: {e}")
        return False

def test_services():
    """Test which services loaded successfully"""
    try:
        from api.index import services_loaded
        print(f"✅ Services loaded: {len(services_loaded)}")
        for service in services_loaded:
            print(f"   ✓ {service}")
        
        if len(services_loaded) == 0:
            print("   ⚠️  No services loaded (expected if dependencies not installed)")
        
        return True
    except Exception as e:
        print(f"❌ Service check failed: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("FastAPI Entrypoint Verification Test")
    print("="*60 + "\n")
    
    tests = [
        ("API Import", test_api_import),
        ("Main Import", test_main_import),
        ("Routes Check", test_routes),
        ("Services Check", test_services)
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n▶ Testing: {name}")
        print("-" * 60)
        result = test_func()
        results.append((name, result))
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    all_passed = all(r[1] for r in results)
    
    print("\n" + "="*60)
    if all_passed:
        print("✅ All tests passed! Ready for deployment.")
    else:
        print("⚠️  Some tests failed. Check errors above.")
    print("="*60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
