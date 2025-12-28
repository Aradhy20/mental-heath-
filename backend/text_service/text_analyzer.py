import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from typing import Tuple
import os
import sys

# Add project root to path to allow importing ai_models
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from ai_models.text.inference.text_analyzer import TextAnalyzer as SharedTextAnalyzer
except ImportError as e:
    print(f"Warning: Could not import shared TextAnalyzer: {e}")
    SharedTextAnalyzer = None

# Import vector database and RAG modules
try:
    from .vector_db import vector_db
    from .rag import rag_system
except ImportError:
    # If relative import fails or chromadb not available, try absolute import with mocks
    try:
        import vector_db as vector_db_module
        import rag as rag_module
        vector_db = vector_db_module.vector_db
        rag_system = rag_module.rag_system
    except Exception:
        # Use mock versions
        import vector_db_mock
        import rag_mock
        vector_db = vector_db_mock.vector_db
        rag_system = rag_mock.rag_system

class TextEmotionAnalyzer:
    def __init__(self):
        # Initialize the emotion analysis model
        if SharedTextAnalyzer:
            self.analyzer = SharedTextAnalyzer()
        else:
            print("Using fallback mock analyzer due to import error")
            self.analyzer = None
            
        # Fallback mock weights
        self.mock_weights = {
            "joy": ["happy", "excited", "pleased", "delighted", "thrilled", "wonderful", "amazing", "fantastic"],
            "sadness": ["sad", "depressed", "lonely", "upset", "disappointed", "miserable", "gloomy", "melancholy"],
            "anger": ["angry", "furious", "irritated", "annoyed", "mad", "outraged", "enraged", "livid"],
            "fear": ["afraid", "scared", "terrified", "anxious", "worried", "nervous", "panicked", "frightened"],
            "disgust": ["disgusted", "repulsed", "revolted", "nauseated", "appalled", "offended", "sickened"],
            "surprise": ["surprised", "amazed", "astonished", "shocked", "stunned", "startled", "bewildered"],
            "neutral": ["normal", "okay", "fine", "regular", "standard", "typical", "usual", "common"]
        }
    
    def analyze_emotion(self, text: str) -> Tuple[str, float, float]:
        """
        Analyze text for emotional content
        Returns: (emotion_label, emotion_score, confidence)
        """
        if self.analyzer:
            return self.analyzer.analyze_emotion(text)
            
        # Fallback implementation
        text_lower = text.lower()
        emotion_scores = {}
        total_matches = 0
        
        for emotion, keywords in self.mock_weights.items():
            matches = sum(1 for keyword in keywords if keyword in text_lower)
            emotion_scores[emotion] = matches
            total_matches += matches
        
        if total_matches == 0:
            return "neutral", 0.5, 0.7
        
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        max_matches = emotion_scores[dominant_emotion]
        
        emotion_score = min(max_matches / 10.0, 0.95)
        confidence = min(0.5 + (len(text.split()) * 0.02) + (max_matches / total_matches * 0.3), 0.95)
        
        return dominant_emotion, emotion_score, confidence
    
    def analyze_with_context(self, text: str) -> dict:
        """
        Analyze text with vector database and RAG context
        Returns comprehensive analysis with recommendations
        """
        # Get emotion analysis
        emotion_label, emotion_score, confidence = self.analyze_emotion(text)
        
        # Get RAG-based response
        rag_result = rag_system.analyze_with_rag(text, emotion_label)
        
        # Search for similar documents in vector database
        similar_docs = vector_db.search_similar_documents(text, n_results=2)
        
        return {
            "emotion_analysis": {
                "emotion_label": emotion_label,
                "emotion_score": emotion_score,
                "confidence": confidence
            },
            "contextual_response": rag_result["response"],
            "relevant_knowledge": similar_docs,
            "risk_level": rag_result["risk_level"],
            "recommendations": self._generate_recommendations(emotion_label, rag_result["risk_level"])
        }
    
    def _generate_recommendations(self, emotion_label: str, risk_level: str) -> list:
        """
        Generate personalized recommendations based on emotion and risk level
        """
        recommendations = []
        
        if risk_level == "high":
            recommendations.append("Immediate professional help is recommended. Please contact a mental health crisis helpline.")
            recommendations.append("Reach out to trusted friends or family members for support.")
        elif risk_level == "medium":
            recommendations.append("Consider scheduling an appointment with a mental health professional.")
            recommendations.append("Practice stress-reduction techniques like deep breathing or meditation.")
        else:
            recommendations.append("Continue practicing self-care and mindfulness.")
            recommendations.append("Maintain regular communication with supportive friends or family.")
        
        # Add emotion-specific recommendations
        if emotion_label == "sadness":
            recommendations.append("Engage in activities that usually bring you joy or comfort.")
            recommendations.append("Consider journaling your thoughts and feelings.")
        elif emotion_label == "anxiety":
            recommendations.append("Try progressive muscle relaxation or grounding techniques.")
            recommendations.append("Limit caffeine intake which can increase anxiety.")
        elif emotion_label == "anger":
            recommendations.append("Practice deep breathing or counting to ten before reacting.")
            recommendations.append("Consider physical exercise to release tension.")
        
        return recommendations

# Global instance
analyzer = TextEmotionAnalyzer()