"""
Therapy Session Notes Service (Phase 5)
Enhanced session notes for therapists
"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum


class SessionType(str, Enum):
    INITIAL = "initial"
    FOLLOWUP = "followup"
    CRISIS = "crisis"
    GROUP = "group"
    FAMILY = "family"


class MoodRating(int, Enum):
    VERY_LOW = 1
    LOW = 2
    MODERATE = 3
    GOOD = 4
    EXCELLENT = 5


class SessionNote(BaseModel):
    note_id: Optional[int] = None
    client_id: int
    therapist_id: int
    session_type: SessionType
    session_date: datetime
    duration_minutes: int
    
    # Client state
    mood_rating: MoodRating
    anxiety_level: int  # 1-10
    stress_level: int  # 1-10
    
    # Session content
    topics_discussed: List[str]
    interventions_used: List[str]
    client_insights: Optional[str] = None
    therapist_observations: str
    
    # Progress tracking
    goals_reviewed: List[str]
    goals_achieved: List[str]
    new_goals: List[str]
    homework_assigned: Optional[str] = None
    
    # Risk assessment
    risk_level: str = "low"  # low, moderate, high
    safety_concerns: Optional[str] = None
    
    # Follow-up
    next_session_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None
    
    # Metadata
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Config:
        use_enum_values = True


class SessionSummary(BaseModel):
    client_id: int
    total_sessions: int
    average_mood: float
    average_anxiety: float
    average_stress: float
    common_topics: List[dict]
    progress_indicators: List[str]
    treatment_effectiveness: str


class TherapyNotesService:
    """Service for managing therapy session notes"""
    
    def __init__(self):
        self.notes = []  # In production, use database
    
    def create_note(self, note: SessionNote) -> SessionNote:
        """Create a new session note"""
        note.note_id = len(self.notes) + 1
        self.notes.append(note)
        return note
    
    def get_client_notes(self, client_id: int) -> List[SessionNote]:
        """Get all notes for a client"""
        return [note for note in self.notes if note.client_id == client_id]
    
    def get_session_summary(self, client_id: int) -> SessionSummary:
        """Generate summary of therapy sessions"""
        notes = self.get_client_notes(client_id)
        
        if not notes:
            return SessionSummary(
                client_id=client_id,
                total_sessions=0,
                average_mood=0,
                average_anxiety=0,
                average_stress=0,
                common_topics=[],
                progress_indicators=[],
                treatment_effectiveness="No sessions recorded"
            )
        
        # Calculate averages
        avg_mood = sum(note.mood_rating for note in notes) / len(notes)
        avg_anxiety = sum(note.anxiety_level for note in notes) / len(notes)
        avg_stress = sum(note.stress_level for note in notes) / len(notes)
        
        # Count topics
        topic_counts = {}
        for note in notes:
            for topic in note.topics_discussed:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        common_topics = [
            {"topic": topic, "count": count}
            for topic, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Analyze progress
        progress_indicators = []
        if len(notes) > 1:
            mood_trend = notes[-1].mood_rating - notes[0].mood_rating
            if mood_trend > 0:
                progress_indicators.append(f"Mood improved by {mood_trend} points")
            
            anxiety_trend = notes[0].anxiety_level - notes[-1].anxiety_level
            if anxiety_trend > 0:
                progress_indicators.append(f"Anxiety reduced by {anxiety_trend} points")
        
        # Determine effectiveness
        total_goals_achieved = sum(len(note.goals_achieved) for note in notes)
        if total_goals_achieved > len(notes):
            effectiveness = "Highly effective - multiple goals achieved"
        elif total_goals_achieved > 0:
            effectiveness = "Effective - making progress"
        else:
            effectiveness = "In progress - continue treatment"
        
        return SessionSummary(
            client_id=client_id,
            total_sessions=len(notes),
            average_mood=round(avg_mood, 2),
            average_anxiety=round(avg_anxiety, 2),
            average_stress=round(avg_stress, 2),
            common_topics=common_topics,
            progress_indicators=progress_indicators,
            treatment_effectiveness=effectiveness
        )


# Global service instance
therapy_notes_service = TherapyNotesService()
