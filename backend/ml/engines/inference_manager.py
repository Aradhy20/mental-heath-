import os
import torch
import torch.nn.functional as F
import numpy as np

from pathlib import Path
import sys

# Path resolution
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from core.logging import log

class InferenceManager:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.weights_dir = self.base_dir / "weights"
        # Force CPU if memory is tight, though MPS is usually okay on Mac
        self.device = torch.device('cpu') 
        
        log.info(f"InferenceManager: Initialized in LAZY mode on {self.device}")
        
        self.text_model = None
        self.audio_model = None
        self.face_model = None
        self.tokenizer = None

    def _load_text(self):
        if self.text_model is not None:
            return
        from ml.models.text_model_hf import HFTextEmotionRiskModel
        from transformers import AutoTokenizer
        text_path = os.path.join(self.weights_dir, "text_distilbert_best.pth")
        if os.path.exists(text_path):
            try:
                log.info("InferenceManager: Loading Text Model (DistilBERT)...")
                self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
                self.text_model = HFTextEmotionRiskModel(num_emotions=5, num_risk_levels=3)
                self.text_model.load_state_dict(torch.load(text_path, map_location=self.device))
                self.text_model.to(self.device)
                self.text_model.eval()
                log.info("InferenceManager: ✅ Text Model Ready")
            except Exception as e:
                log.error(f"InferenceManager: Error loading Text Model: {e}")

    def _load_audio(self):
        if self.audio_model is not None:
            return
        from ml.models.audio_model import AudioCNNModel
        audio_path = os.path.join(self.weights_dir, "audio_cnn_best.pth")
        if os.path.exists(audio_path):
            try:
                log.info("InferenceManager: Loading Audio Model (CNN)...")
                self.audio_model = AudioCNNModel(input_dim=16, num_emotions=5)
                self.audio_model.load_state_dict(torch.load(audio_path, map_location=self.device))
                self.audio_model.to(self.device)
                self.audio_model.eval()
                log.info("InferenceManager: ✅ Audio Model Ready")
            except Exception as e:
                log.error(f"InferenceManager: Error loading Audio Model: {e}")

    def _load_face(self):
        if self.face_model is not None:
            return
        from ml.models.face_model import FaceVisionModel
        face_path = os.path.join(self.weights_dir, "face_efficientnet_best.pth")
        if os.path.exists(face_path):
            try:
                log.info("InferenceManager: Loading Face Model...")
                self.face_model = FaceVisionModel()
                self.face_model.load_state_dict(torch.load(face_path, map_location=self.device))
                self.face_model.to(self.device)
                self.face_model.eval()
                log.info("InferenceManager: ✅ Face Model Ready")
            except Exception as e:
                log.error(f"InferenceManager: Error loading Face Model: {e}")

    def predict_text(self, text: str):
        self._load_text()
        if not self.text_model or not self.tokenizer:
            return None, None
            
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            emo_logits, risk_logits = self.text_model(inputs['input_ids'], inputs['attention_mask'])
            
        emo_probs = F.softmax(emo_logits, dim=-1).cpu().numpy()[0]
        risk_probs = F.softmax(risk_logits, dim=-1).cpu().numpy()[0]
        
        return emo_probs, risk_probs

    def predict_audio(self, features: np.ndarray):
        self._load_audio()
        if not self.audio_model:
            return None
            
        feat_tensor = torch.tensor(features, dtype=torch.float32).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.audio_model(feat_tensor)
            
        probs = F.softmax(logits, dim=-1).cpu().numpy()[0]
        return probs

    def predict_face(self, landmarks: np.ndarray):
        self._load_face()
        if not self.face_model:
            return None
            
        land_tensor = torch.tensor(landmarks, dtype=torch.float32).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.face_model(land_tensor)
            
        probs = F.softmax(logits, dim=-1).cpu().numpy()[0]
        return probs

# Singleton for system-wide access
inference_manager = InferenceManager()
