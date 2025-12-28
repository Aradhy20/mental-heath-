"""
24/7 Crisis Chat Escalation System
Detects crisis situations and escalates to appropriate resources
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class CrisisLevel(str, Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class CrisisIndicator(BaseModel):
    keyword: str
    severity: int  # 1-10
    category: str  # self_harm, suicide, violence, etc.


class CrisisResponse(BaseModel):
    crisis_level: CrisisLevel
    detected_indicators: List[str]
    immediate_actions: List[str]
    resources: List[Dict[str, str]]
    escalation_required: bool
    emergency_contact_triggered: bool


# Crisis keywords and patterns
CRISIS_INDICATORS = [
    # Critical - Immediate intervention
    CrisisIndicator(keyword="suicide", severity=10, category="suicide"),
    CrisisIndicator(keyword="kill myself", severity=10, category="suicide"),
    CrisisIndicator(keyword="end my life", severity=10, category="suicide"),
    CrisisIndicator(keyword="want to die", severity=10, category="suicide"),
    
    # High severity - Urgent attention
    CrisisIndicator(keyword="self harm", severity=9, category="self_harm"),
    CrisisIndicator(keyword="cut myself", severity=9, category="self_harm"),
    CrisisIndicator(keyword="hurt myself", severity=8, category="self_harm"),
    CrisisIndicator(keyword="overdose", severity=9, category="self_harm"),
    
    # Moderate severity - Close monitoring
    CrisisIndicator(keyword="hopeless", severity=6, category="depression"),
    CrisisIndicator(keyword="worthless", severity=6, category="depression"),
    CrisisIndicator(keyword="can't go on", severity=7, category="depression"),
    CrisisIndicator(keyword="give up", severity=5, category="depression"),
    
    # Violence indicators
    CrisisIndicator(keyword="hurt someone", severity=9, category="violence"),
    CrisisIndicator(keyword="kill someone", severity=10, category="violence"),
]


class CrisisDetector:
    """Detect crisis situations in chat messages"""
    
    def __init__(self):
        self.indicators = CRISIS_INDICATORS
    
    def analyze_message(self, message: str, user_id: int) -> CrisisResponse:
        """Analyze message for crisis indicators"""
        message_lower = message.lower()
        detected = []
        max_severity = 0
        categories = set()
        
        # Check for crisis indicators
        for indicator in self.indicators:
            if indicator.keyword in message_lower:
                detected.append(indicator.keyword)
                max_severity = max(max_severity, indicator.severity)
                categories.add(indicator.category)
        
        # Determine crisis level
        if max_severity >= 9:
            crisis_level = CrisisLevel.CRITICAL
        elif max_severity >= 7:
            crisis_level = CrisisLevel.HIGH
        elif max_severity >= 5:
            crisis_level = CrisisLevel.MODERATE
        elif max_severity >= 3:
            crisis_level = CrisisLevel.LOW
        else:
            crisis_level = CrisisLevel.NONE
        
        # Generate response
        return self._generate_response(crisis_level, detected, categories, user_id)
    
    def _generate_response(
        self,
        crisis_level: CrisisLevel,
        detected: List[str],
        categories: set,
        user_id: int
    ) -> CrisisResponse:
        """Generate appropriate crisis response"""
        
        immediate_actions = []
        resources = []
        escalation_required = False
        emergency_contact = False
        
        if crisis_level == CrisisLevel.CRITICAL:
            immediate_actions = [
                "IMMEDIATE: Contact emergency services (911)",
                "Display National Suicide Prevention Lifeline: 988",
                "Notify on-call crisis counselor",
                "Alert emergency contacts",
                "Lock dangerous features (e.g., medication reminders)"
            ]
            resources = [
                {"name": "National Suicide Prevention Lifeline", "contact": "988", "available": "24/7"},
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "available": "24/7"},
                {"name": "Emergency Services", "contact": "911", "available": "24/7"},
            ]
            escalation_required = True
            emergency_contact = True
            
        elif crisis_level == CrisisLevel.HIGH:
            immediate_actions = [
                "Connect to crisis counselor immediately",
                "Display crisis hotline numbers",
                "Notify therapist if available",
                "Suggest safety planning"
            ]
            resources = [
                {"name": "National Suicide Prevention Lifeline", "contact": "988", "available": "24/7"},
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "available": "24/7"},
                {"name": "SAMHSA Helpline", "contact": "1-800-662-4357", "available": "24/7"},
            ]
            escalation_required = True
            
        elif crisis_level == CrisisLevel.MODERATE:
            immediate_actions = [
                "Offer to connect with counselor",
                "Provide coping resources",
                "Suggest crisis chat support",
                "Monitor closely"
            ]
            resources = [
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "available": "24/7"},
                {"name": "SAMHSA Helpline", "contact": "1-800-662-4357", "available": "24/7"},
            ]
            
        elif crisis_level == CrisisLevel.LOW:
            immediate_actions = [
                "Provide supportive resources",
                "Suggest wellness activities",
                "Offer to schedule therapist session"
            ]
            resources = [
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "available": "24/7"},
            ]
        
        return CrisisResponse(
            crisis_level=crisis_level,
            detected_indicators=detected,
            immediate_actions=immediate_actions,
            resources=resources,
            escalation_required=escalation_required,
            emergency_contact_triggered=emergency_contact
        )
    
    def log_crisis_event(self, user_id: int, response: CrisisResponse):
        """Log crisis event for follow-up"""
        # In production, save to database
        event = {
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "crisis_level": response.crisis_level,
            "indicators": response.detected_indicators,
            "actions_taken": response.immediate_actions,
            "escalated": response.escalation_required
        }
        print(f"Crisis event logged: {event}")
        return event


# Global crisis detector
crisis_detector = CrisisDetector()
