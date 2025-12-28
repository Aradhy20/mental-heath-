from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import collections

class TemporalEmotionAnalyzer:
    def __init__(self):
        self.emotion_history = collections.defaultdict(list)
        
    def add_entry(self, user_id: int, emotion: str, score: float, timestamp: datetime = None):
        """Add an emotion entry for a user"""
        if timestamp is None:
            timestamp = datetime.now()
        
        self.emotion_history[user_id].append({
            "emotion": emotion,
            "score": score,
            "timestamp": timestamp
        })
        
    def get_emotion_history(self, user_id: int, days: int = 7) -> List[Dict]:
        """Get emotion history for the last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        history = [
            entry for entry in self.emotion_history[user_id]
            if entry["timestamp"] >= cutoff_date
        ]
        
        return sorted(history, key=lambda x: x["timestamp"])
    
    def analyze_patterns(self, user_id: int) -> Dict:
        """Analyze emotion patterns for a user"""
        history = self.get_emotion_history(user_id, days=30)
        
        if not history:
            return {
                "dominant_emotion": "neutral",
                "volatility": 0.0,
                "trend": "stable"
            }
            
        # Calculate dominant emotion
        emotions = [entry["emotion"] for entry in history]
        emotion_counts = collections.Counter(emotions)
        dominant_emotion = emotion_counts.most_common(1)[0][0]
        
        # Calculate volatility (changes in emotion)
        changes = 0
        for i in range(1, len(emotions)):
            if emotions[i] != emotions[i-1]:
                changes += 1
        
        volatility = changes / len(emotions) if len(emotions) > 1 else 0.0
        
        return {
            "dominant_emotion": dominant_emotion,
            "volatility": round(volatility, 2),
            "trend": self._calculate_trend(history)
        }
    
    def _calculate_trend(self, history: List[Dict]) -> str:
        """Calculate the emotional trend (improving, worsening, stable)"""
        # Simplified trend calculation based on "positive" vs "negative" emotions
        positive_emotions = {"joy", "surprise", "neutral"}
        negative_emotions = {"sadness", "anger", "fear", "disgust"}
        
        score = 0
        for entry in history:
            if entry["emotion"] in positive_emotions:
                score += 1
            elif entry["emotion"] in negative_emotions:
                score -= 1
                
        if score > len(history) * 0.2:
            return "improving"
        elif score < -len(history) * 0.2:
            return "worsening"
        else:
            return "stable"

    def detect_triggers(self, user_id: int, text_input: str) -> List[str]:
        """Detect potential triggers based on text input and history"""
        # This is a mock implementation. In a real system, this would use 
        # more sophisticated NLP to link keywords to negative emotional shifts.
        triggers = []
        
        keywords = {
            "work": ["deadline", "boss", "meeting", "project"],
            "relationship": ["fight", "argument", "breakup", "partner"],
            "health": ["pain", "sick", "tired", "insomnia"],
            "finance": ["money", "debt", "bill", "expensive"]
        }
        
        text_lower = text_input.lower()
        
        for category, words in keywords.items():
            if any(word in text_lower for word in words):
                triggers.append(category)
                
        return triggers

# Global instance
pattern_analyzer = TemporalEmotionAnalyzer()
