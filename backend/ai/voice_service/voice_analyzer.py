import numpy as np
from typing import Tuple
import io
import sys
import os

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from ai_models.voice.inference.voice_analyzer import VoiceAnalyzer as SharedVoiceAnalyzer
except ImportError as e:
    print(f"Warning: Could not import shared VoiceAnalyzer: {e}")
    SharedVoiceAnalyzer = None

class VoiceStressAnalyzer:
    def __init__(self):
        if SharedVoiceAnalyzer:
            self.analyzer = SharedVoiceAnalyzer()
        else:
            self.analyzer = None
            # Mock emotion labels for voice analysis fallback
            self.stress_levels = ["calm", "mild_stress", "moderate_stress", "high_stress", "anxiety", "depression"]
    
    def extract_features(self, audio_data: bytes) -> dict:
        """
        Extract voice features from audio data
        """
        if self.analyzer:
            return self.analyzer.extract_features(audio_data)
            
        # Fallback mock feature extraction
        audio_size = len(audio_data)
        features = {
            "pitch": min(100 + (audio_size / 1000), 400),
            "intensity": min(50 + (audio_size / 500), 110),
            "jitter": min(0.01 + (audio_size / 100000), 0.12),
            "duration": audio_size / 10000
        }
        return features
    
    def analyze_stress(self, audio_data: bytes) -> Tuple[str, float, float]:
        """
        Analyze voice recording for stress and emotional indicators
        Returns: (stress_label, stress_score, confidence)
        """
        if self.analyzer:
            return self.analyzer.analyze_stress(audio_data)
            
        # Fallback logic
        features = self.extract_features(audio_data)
        
        pitch = features["pitch"]
        intensity = features["intensity"]
        jitter = features["jitter"]
        
        pitch_score = min(max((pitch - 100) / 300, 0), 1)
        intensity_score = min(max((intensity - 50) / 60, 0), 1)
        jitter_score = min(max((jitter - 0.01) / 0.11, 0), 1)
        
        stress_score = (pitch_score * 0.4 + intensity_score * 0.4 + jitter_score * 0.2)
        
        if stress_score < 0.2:
            stress_label = "calm"
        elif stress_score < 0.4:
            stress_label = "mild_stress"
        elif stress_score < 0.6:
            stress_label = "moderate_stress"
        elif stress_score < 0.8:
            stress_label = "high_stress"
        elif features["pitch"] > 300:
            stress_label = "anxiety"
        else:
            stress_label = "depression"
        
        confidence = min(0.5 + (features["duration"] / 10), 0.95)
        
        return stress_label, stress_score, confidence

# Global instance
analyzer = VoiceStressAnalyzer()