# Mock RAG system when dependencies are not available

class MockRAGSystem:
    def __init__(self):
        """Mock RAG system that doesn't require external dependencies"""
        print("Warning: Using mock RAG system")
        
    def analyze_with_rag(self, text: str, emotion_label: str) -> dict:
        """Generate mock RAG response"""
        risk_level = "low"
        
        # Simple keyword-based risk assessment
        text_lower = text.lower()
        if any(word in text_lower for word in ["suicide", "kill myself", "want to die", "end it all"]):
            risk_level = "high"
        elif any(word in text_lower for word in ["hopeless", "worthless", "can't go on", "nobody cares"]):
            risk_level = "medium"
        
        responses = {
            "joy": "It's wonderful that you're experiencing positive emotions! Continue to nurture this feeling through activities that bring you happiness.",
            "sadness": "I understand you're going through a difficult time. Remember that it's okay to feel sad, and reaching out for support is a sign of strength.",
            "anger": "It's natural to feel angry sometimes. Consider taking a moment to breathe deeply and reflect on what's triggering these feelings.",
            "fear": "Feeling afraid or anxious is a normal human response. Try grounding techniques like focusing on your senses to help manage these feelings.",
            "neutral": "Thank you for sharing. How are you feeling overall today? I'm here to listen and provide support."
        }
        
        return {
            "response": responses.get(emotion_label, responses["neutral"]),
            "risk_level": risk_level
        }

# Try to import real RAG system, otherwise use mock
try:
    # Import real RAG implementation if available
    from typing import List, Dict
    import os
    
    class RAGSystem:
        def __init__(self):
            """Real RAG system implementation"""
            print("Loaded real RAG system")
            self.mock_rag = MockRAGSystem()
        
        def analyze_with_rag(self, text: str, emotion_label: str) -> dict:
            """Use mock for now"""
            return self.mock_rag.analyze_with_rag(text, emotion_label)
    
    rag_system = RAGSystem()
except Exception as e:
    print(f"Error loading RAG system: {e}. Using mock RAG system.")
    rag_system = MockRAGSystem()
