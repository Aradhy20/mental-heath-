"""
Face Analyzer using CNN Model
Integrates the CNN model with the face service
"""

import io
from PIL import Image
import numpy as np
import sys
import os

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from ai_models.face.inference.face_analyzer import FaceAnalyzer as SharedFaceAnalyzer
except ImportError as e:
    print(f"Warning: Could not import shared FaceAnalyzer: {e}")
    SharedFaceAnalyzer = None

class FaceAnalyzer:
    def __init__(self):
        """
        Initialize the face analyzer
        """
        self.initialized = True
        if SharedFaceAnalyzer:
            try:
                self.analyzer = SharedFaceAnalyzer()
            except Exception as e:
                print(f"Error initializing shared FaceAnalyzer: {e}")
                self.analyzer = None
        else:
            self.analyzer = None
    
    def analyze_emotion(self, image_data):
        """
        Analyze emotion from image data
        Args:
            image_data: bytes of image file
        Returns:
            tuple: (emotion_label, face_score, confidence)
        """
        if self.analyzer:
            try:
                return self.analyzer.analyze_emotion(image_data)
            except Exception as e:
                print(f"Error in shared face analysis: {str(e)}")
        
        # Fallback
        return "Neutral", 0.5, 0.5
    
    def analyze_micro_expressions(self, image_data):
        """
        Analyze micro-expressions from image data (Phase 4 placeholder)
        """
        if self.analyzer:
            try:
                return self.analyzer.analyze_micro_expressions(image_data)
            except Exception:
                pass
                
        # Fallback
        return {
            'detected': False,
            'micro_expressions': [],
            'confidence': 0.0,
            'analysis': 'Micro-expression analysis not yet implemented. Future integration planned.',
            'note': 'This feature requires specialized ML model for detecting brief facial movements (40-500ms duration)'
        }

# Global analyzer instance
analyzer = FaceAnalyzer()