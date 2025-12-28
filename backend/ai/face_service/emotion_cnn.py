"""
CNN Model for Facial Emotion Detection
Uses a pre-trained model with fine-tuning for emotion recognition
"""

import cv2
import numpy as np
from tensorflow import keras
from keras.models import Sequential, load_model
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from keras.preprocessing.image import img_to_array
import os

class EmotionCNN:
    def __init__(self, model_path=None):
        """
        Initialize the CNN model for emotion detection
        """
        self.img_size = (48, 48)
        self.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        
        if model_path and os.path.exists(model_path):
            self.model = load_model(model_path)
        else:
            self.model = self._build_model()
        
        # Load face cascade for detection
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
    
    def _build_model(self):
        """
        Build CNN architecture for emotion recognition
        Architecture inspired by mini-Xception
        """
        model = Sequential([
            # Block 1
            Conv2D(32, (3, 3), activation='relu', input_shape=(48, 48, 1)),
            BatchNormalization(),
            Conv2D(64, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(pool_size=(2, 2)),
            Dropout(0.25),
            
            # Block 2
            Conv2D(128, (3, 3), activation='relu'),
            BatchNormalization(),
            Conv2D(128, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(pool_size=(2, 2)),
            Dropout(0.25),
            
            # Block 3
            Conv2D(256, (3, 3), activation='relu'),
            BatchNormalization(),
            Conv2D(256, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(pool_size=(2, 2)),
            Dropout(0.25),
            
            # Fully connected layers
            Flatten(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(7, activation='softmax')  # 7 emotions
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def detect_faces(self, image_data):
        """
        Detect faces in the image
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        return faces, gray
    
    def preprocess_face(self, face_roi):
        """
        Preprocess face ROI for model input
        """
        # Resize to model input size
        face_roi = cv2.resize(face_roi, self.img_size)
        
        # Normalize pixel values
        face_roi = face_roi.astype('float32') / 255.0
        
        # Reshape for model input
        face_roi = np.expand_dims(face_roi, axis=0)
        face_roi = np.expand_dims(face_roi, axis=-1)
        
        return face_roi
    
    def predict_emotion(self, image_data):
        """
        Predict emotion from image
        Returns: (emotion_label, confidence, all_probabilities)
        """
        try:
            # Detect faces
            faces, gray = self.detect_faces(image_data)
            
            if len(faces) == 0:
                return "Neutral", 0.5, [0.14] * 7  # Default if no face detected
            
            # Use the first detected face
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Preprocess
            face_input = self.preprocess_face(face_roi)
            
            # Predict
            predictions = self.model.predict(face_input, verbose=0)[0]
            
            # Get emotion with highest probability
            emotion_idx = np.argmax(predictions)
            emotion_label = self.emotions[emotion_idx]
            confidence = float(predictions[emotion_idx])
            
            return emotion_label, confidence, predictions.tolist()
            
        except Exception as e:
            print(f"Error in emotion prediction: {str(e)}")
            return "Neutral", 0.5, [0.14] * 7
    
    def save_model(self, path):
        """
        Save the trained model
        """
        self.model.save(path)
        print(f"Model saved to {path}")
    
    def detect_micro_expressions(self, video_frames):
        """
        Detect micro-expressions from video frames (Phase 4 placeholder)
        
        Micro-expressions are brief, involuntary facial expressions
        that last 1/25 to 1/5 of a second
        
        Args:
            video_frames: List of consecutive frames
        
        Returns:
            List of detected micro-expressions with timestamps
        """
        micro_expressions = []
        
        # Placeholder implementation
        # In production, this would:
        # 1. Analyze frame-by-frame emotion changes
        # 2. Detect rapid transitions (< 200ms)
        # 3. Identify suppressed emotions
        # 4. Compare with baseline expressions
        
        for i, frame in enumerate(video_frames):
            # Simulate micro-expression detection
            # Real implementation would use temporal CNN or optical flow
            pass
        
        return {
            'detected': False,
            'count': 0,
            'expressions': micro_expressions,
            'note': 'Micro-expression detection is a placeholder for future implementation'
        }

# Global model instance
emotion_cnn = EmotionCNN()

def analyze_emotion(image_data):
    """
    Main function to analyze emotion from image
    Returns: (emotion_label, face_score, confidence)
    """
    emotion_label, confidence, probabilities = emotion_cnn.predict_emotion(image_data)
    
    # Calculate face score (0-1 scale, higher = more positive emotion)
    emotion_scores = {
        'Happy': 1.0,
        'Surprise': 0.8,
        'Neutral': 0.5,
        'Sad': 0.3,
        'Fear': 0.2,
        'Angry': 0.1,
        'Disgust': 0.1
    }
    
    face_score = emotion_scores.get(emotion_label, 0.5)
    
    return emotion_label, face_score, confidence
