# 🤖 AI Models Quick Start Guide

This guide will help you start all AI services for the Mental Health App.

## 📋 Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🚀 Quick Start

### Option 1: Start All Services at Once

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
pip install -r requirements_all.txt

# Start all AI services
python start_services.py
```

This will start all 4 AI services:
- Text Analysis (Port 8002)
- Voice Analysis (Port 8003)
- Face Analysis (Port 8004)
- Fusion Model (Port 8005)

### Option 2: Start Individual Services

#### Text Analysis Service
```bash
cd backend/text_service
python main.py
```

#### Voice Analysis Service
```bash
cd backend/voice_service
python main.py
```

#### Face Analysis Service
```bash
cd backend/face_service
python main.py
```

## 🧪 Verify Services Are Running

Run the test script:
```bash
cd ..
node test-system.js
```

You should see:
```
🤖 AI MODELS
────────────────────────────────────────────────────────────
✅ TEXT: RUNNING
✅ VOICE: RUNNING
✅ FACE: RUNNING
✅ FUSION: RUNNING
```

## 🔍 Manual Testing

### Test Text Analysis
```bash
curl -X POST http://localhost:8002/v1/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "I am feeling anxious and stressed", "user_id": "test-123"}'
```

### Test Voice Analysis
```bash
curl http://localhost:8003/health
```

### Test Face Analysis
```bash
curl http://localhost:8004/health
```

## 📦 Dependencies

The AI services require:
- **transformers** - For text emotion models
- **torch** - PyTorch for deep learning
- **deepface** - For facial analysis
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **python-multipart** - For file uploads
- **librosa** - For audio processing

## ⚠️ Common Issues

### Issue: "Module not found"
**Solution:**
```bash
pip install -r backend/requirements_all.txt
```

### Issue: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :8002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8002 | xargs kill -9
```

### Issue: "CUDA not available"
**Solution:** This is normal. The models will run on CPU. For GPU support, install:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## 🎯 Integration with Frontend

Once AI services are running, the frontend will automatically use them:

1. **Text Analysis** - Used in journal entries and chat
2. **Voice Analysis** - Used in voice mood tracking
3. **Face Analysis** - Used in facial emotion detection
4. **Fusion Model** - Combines all three for comprehensive analysis

## 📊 Service Endpoints

### Text Service (8002)
- `POST /v1/analyze/text` - Analyze text emotion
- `POST /v1/analyze/text/contextual` - Contextual analysis
- `GET /v1/analyze/emotion/history` - User history

### Voice Service (8003)
- `POST /v1/analyze/voice` - Analyze voice emotion
- `GET /health` - Health check

### Face Service (8004)
- `POST /v1/analyze/face` - Analyze facial expression
- `GET /health` - Health check

### Fusion Service (8005)
- `POST /v1/analyze/fusion` - Multi-modal analysis
- `GET /health` - Health check

## 🔧 Configuration

AI services can be configured via environment variables:

```env
# .env file in backend directory
AI_TEXT_SERVICE_URL=http://localhost:8002
AI_VOICE_SERVICE_URL=http://localhost:8003
AI_FACE_SERVICE_URL=http://localhost:8004
AI_FUSION_SERVICE_URL=http://localhost:8005

# MongoDB for storing analysis results
MONGODB_URI=mongodb://localhost:27017/mental_health_db
```

## 💡 Tips

1. **First Run:** Initial model download may take 5-10 minutes
2. **Memory:** AI services require ~2-4GB RAM
3. **CPU Usage:** Expect 20-40% CPU usage during analysis
4. **Optional:** AI services are optional - core app works without them

## 🎓 Model Information

### Text Analysis
- **Model:** DistilRoBERTa (j-hartmann/emotion-english-distilroberta-base)
- **Size:** ~300MB
- **Emotions:** joy, sadness, anger, fear, surprise, disgust, neutral

### Voice Analysis
- **Model:** Custom audio processing pipeline
- **Features:** Pitch, tone, energy analysis

### Face Analysis
- **Model:** DeepFace with multiple backends
- **Emotions:** happy, sad, angry, fear, surprise, disgust, neutral

## 📈 Performance

Expected response times:
- Text Analysis: 100-300ms
- Voice Analysis: 500-1000ms
- Face Analysis: 300-800ms
- Fusion Analysis: 1-2s

## 🛑 Stopping Services

To stop all services:
1. Press `Ctrl+C` in the terminal running `start_services.py`
2. Or close the terminal windows

## 🔄 Restart Services

If services crash or hang:
```bash
# Kill all Python processes (Windows)
taskkill /F /IM python.exe

# Kill all Python processes (Linux/Mac)
pkill -9 python

# Restart
cd backend
python start_services.py
```

## ✅ Success Indicators

When services are running correctly, you'll see:
```
[OK] FastAPI installed
[OK] Uvicorn installed
[OK] SQLAlchemy installed
[OK] Pydantic installed

[INFO] Starting Text Service v2.0 (Enhanced) on port 8002...
✅ Text Service running on http://localhost:8002

[INFO] Starting Voice Service v2.0 (Enhanced) on port 8003...
✅ Voice Service running on http://localhost:8003

[INFO] Starting Face Service v2.0 (Enhanced) on port 8004...
✅ Face Service running on http://localhost:8004

[INFO] Starting Fusion Service v2.0 (Enhanced) on port 8005...
✅ Fusion Service running on http://localhost:8005
```

---

**Need Help?** Check the logs or run the test script to diagnose issues.

**Remember:** The core Mental Health App works perfectly without AI services. They are optional enhancements!
