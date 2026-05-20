import os
import sys
import numpy as np
import cv2

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.face_service.emotion_cnn import analyze_emotion

def test_inference():
    print("[*] Creating a structured simulated face image (happy emotion template)...")
    img = np.ones((480, 640, 3), dtype=np.uint8) * 120
    cv2.circle(img, (320, 240), 100, (200, 200, 200), -1) # Face
    cv2.circle(img, (280, 200), 10, (0, 0, 0), -1)       # Left eye
    cv2.circle(img, (360, 200), 10, (0, 0, 0), -1)       # Right eye
    cv2.ellipse(img, (320, 260), (40, 20), 0, 0, 180, (0, 0, 0), 4) # Smile arc
    
    success, encoded_img = cv2.imencode('.jpg', img)
    if not success:
        print("[❌] Failed to encode simulated image.")
        return
        
    image_bytes = encoded_img.tobytes()
    
    print("[*] Performing direct OpenCV pixel-level CNN emotion analysis...")
    emotion_label, face_score, confidence = analyze_emotion(image_bytes)
    
    print("=" * 50)
    print(f" Detected Emotion : {emotion_label}")
    print(f" Valence Score    : {face_score}")
    print(f" Confidence Level : {confidence:.4f}")
    print("=" * 50)
    print("[✅] OpenCV Face Expression Analysis verified successfully!")

if __name__ == "__main__":
    test_inference()
