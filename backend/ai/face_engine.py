import os
import sys
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from collections import deque

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

# Try importing the model
try:
    from backend.ml.models.face_cnn import FaceCNN
except ImportError:
    # If path issue inside backend scripts
    from ml.models.face_cnn import FaceCNN

EMOTIONS = ["happy", "sad", "angry", "neutral", "surprised"]

class FaceEmotionEngine:
    def __init__(self, model_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = FaceCNN(num_classes=5)
        
        if model_path is None:
            model_path = os.path.join(project_root, "ml", "weights", "face_cnn_best.pth")
            
        self.model_path = model_path
        self.model_loaded = False
        
        # Load Haar Cascade Face Detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Stability Queue: stores last 5 frame predictions (tuples of (emotion_idx, confidence_score))
        self.prediction_queue = deque(maxlen=5)
        
        self.lazy_load()

    def lazy_load(self):
        """Lazy-loads the model weights if they exist."""
        if self.model_loaded:
            return True
            
        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                self.model_loaded = True
                print(f"FaceEmotionEngine: PyTorch model loaded successfully from {self.model_path}")
                return True
            except Exception as e:
                print(f"FaceEmotionEngine: Error loading model weights — {e}")
        else:
            print(f"FaceEmotionEngine: Weights not found at {self.model_path}. Please run train_face.py first.")
        return False

    def predict_frame(self, frame_bytes: bytes) -> dict:
        """
        Analyzes a single image frame (bytes) for facial emotions.
        
        Args:
            frame_bytes: Binary buffer of the image frame (e.g. JPEG/PNG)
            
        Returns:
            dict: { "emotion": str, "confidence": float } or { "emotion": "uncertain", "confidence": 0.0 }
        """
        # Ensure model is loaded
        if not self.lazy_load():
            return {"emotion": "uncertain", "confidence": 0.0, "error": "Model weights not loaded"}

        # Decode image from bytes
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"emotion": "uncertain", "confidence": 0.0, "error": "Failed to decode image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        if len(faces) == 0:
            # If no face is detected, we clear prediction queue to prevent old state drift
            self.prediction_queue.clear()
            return {"emotion": "uncertain", "confidence": 0.0}

        # Take the largest face (closest to camera)
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]

        # Resize to 48x48
        face_roi = cv2.resize(face_roi, (48, 48), interpolation=cv2.INTER_LINEAR)
        
        # Normalize (0 to 1)
        face_roi = face_roi.astype(np.float32) / 255.0

        # Reshape to (1, 1, 48, 48) PyTorch tensor
        tensor = torch.tensor(face_roi).unsqueeze(0).unsqueeze(0).to(self.device)

        # Run inference
        with torch.no_grad():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=-1)
            
        # Get predictions
        prob_max, pred_idx = torch.max(probs, dim=-1)
        confidence = prob_max.item()
        emotion_idx = pred_idx.item()

        # Add to stability queue
        self.prediction_queue.append((emotion_idx, confidence))

        # Stability Logic: return the most frequent emotion predicted in the last 5 frames
        emotion_counts = {}
        for idx, conf in self.prediction_queue:
            emotion_counts[idx] = emotion_counts.get(idx, 0) + 1

        # Find most frequent emotion
        final_idx = max(emotion_counts, key=emotion_counts.get)
        
        # Calculate average confidence for the chosen emotion
        matching_confidences = [conf for idx, conf in self.prediction_queue if idx == final_idx]
        avg_confidence = sum(matching_confidences) / len(matching_confidences)

        # Confidence Filtering
        if avg_confidence < 0.5:
            return {"emotion": "uncertain", "confidence": float(round(avg_confidence, 4))}

        return {
            "emotion": EMOTIONS[final_idx],
            "confidence": float(round(avg_confidence, 4))
        }

# Global singleton
face_engine = FaceEmotionEngine()

if __name__ == "__main__":
    # Test block with dummy frame
    # Create black dummy image
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, encoded = cv2.imencode('.jpg', dummy_img)
    res = face_engine.predict_frame(encoded.tobytes())
    print("Dummy test output (no face):", res)
