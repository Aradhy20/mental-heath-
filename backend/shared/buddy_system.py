"""
Accountability Buddy System
Connects users for mutual support and accountability
"""

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class BuddyStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"


class CheckInFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"


class BuddyMatch(BaseModel):
    match_id: Optional[int] = None
    user1_id: int
    user2_id: int
    status: BuddyStatus = BuddyStatus.PENDING
    check_in_frequency: CheckInFrequency
    shared_goals: List[str]
    match_score: float  # 0-100 compatibility score
    created_at: datetime = datetime.utcnow()


class CheckIn(BaseModel):
    check_in_id: Optional[int] = None
    match_id: int
    user_id: int
    message: str
    mood_rating: int  # 1-5
    goals_progress: Dict[str, float]
    timestamp: datetime = datetime.utcnow()


class BuddySystem:
    """Manage accountability buddy matching and check-ins"""
    
    def __init__(self):
        self.matches = []  # In production, use database
        self.check_ins = []
    
    def find_buddy_match(
        self,
        user_id: int,
        user_profile: Dict,
        preferences: Dict
    ) -> Optional[BuddyMatch]:
        """
        Find compatible accountability buddy
        
        Matching criteria:
        - Similar goals
        - Compatible schedules
        - Similar wellness journey stage
        - Complementary strengths/challenges
        """
        # In production, use ML matching algorithm
        # For now, return mock match
        
        match_score = self._calculate_compatibility(user_profile, preferences)
        
        if match_score > 70:
            return BuddyMatch(
                user1_id=user_id,
                user2_id=999,  # Mock buddy
                check_in_frequency=CheckInFrequency.WEEKLY,
                shared_goals=["Improve sleep", "Daily exercise", "Mindfulness practice"],
                match_score=match_score
            )
        
        return None
    
    def _calculate_compatibility(self, profile: Dict, preferences: Dict) -> float:
        """Calculate compatibility score between users"""
        score = 50.0  # Base score
        
        # Adjust based on shared goals
        if "goals" in profile and "preferred_goals" in preferences:
            shared_goals = set(profile["goals"]) & set(preferences["preferred_goals"])
            score += len(shared_goals) * 10
        
        # Adjust based on availability
        if profile.get("timezone") == preferences.get("preferred_timezone"):
            score += 15
        
        # Adjust based on wellness stage
        if abs(profile.get("wellness_score", 50) - preferences.get("similar_level", 50)) < 20:
            score += 10
        
        return min(score, 100)
    
    def create_check_in(
        self,
        match_id: int,
        user_id: int,
        message: str,
        mood_rating: int,
        goals_progress: Dict[str, float]
    ) -> CheckIn:
        """Create a check-in with buddy"""
        check_in = CheckIn(
            match_id=match_id,
            user_id=user_id,
            message=message,
            mood_rating=mood_rating,
            goals_progress=goals_progress
        )
        
        self.check_ins.append(check_in)
        
        # Notify buddy
        self._notify_buddy(match_id, user_id, check_in)
        
        return check_in
    
    def _notify_buddy(self, match_id: int, sender_id: int, check_in: CheckIn):
        """Send notification to accountability buddy"""
        # In production, send push notification or email
        print(f"Notifying buddy about check-in from user {sender_id}")
    
    def get_buddy_stats(self, match_id: int) -> Dict:
        """Get statistics for buddy pair"""
        match_check_ins = [c for c in self.check_ins if c.match_id == match_id]
        
        if not match_check_ins:
            return {
                "total_check_ins": 0,
                "average_mood": 0,
                "streak_days": 0,
                "goals_achieved": 0
            }
        
        avg_mood = sum(c.mood_rating for c in match_check_ins) / len(match_check_ins)
        
        return {
            "total_check_ins": len(match_check_ins),
            "average_mood": round(avg_mood, 1),
            "streak_days": self._calculate_streak(match_check_ins),
            "goals_achieved": self._count_achieved_goals(match_check_ins)
        }
    
    def _calculate_streak(self, check_ins: List[CheckIn]) -> int:
        """Calculate current check-in streak"""
        if not check_ins:
            return 0
        
        # Sort by timestamp
        sorted_check_ins = sorted(check_ins, key=lambda x: x.timestamp, reverse=True)
        
        streak = 1
        for i in range(len(sorted_check_ins) - 1):
            days_diff = (sorted_check_ins[i].timestamp - sorted_check_ins[i+1].timestamp).days
            if days_diff <= 7:  # Weekly check-ins
                streak += 1
            else:
                break
        
        return streak
    
    def _count_achieved_goals(self, check_ins: List[CheckIn]) -> int:
        """Count goals achieved by buddy pair"""
        achieved = 0
        for check_in in check_ins:
            achieved += sum(1 for progress in check_in.goals_progress.values() if progress >= 100)
        return achieved
    
    def send_encouragement(self, match_id: int, from_user_id: int, to_user_id: int, message: str):
        """Send encouragement message to buddy"""
        # In production, save to database and notify
        print(f"Encouragement from {from_user_id} to {to_user_id}: {message}")


# Predefined encouragement messages
ENCOURAGEMENT_MESSAGES = [
    "You're doing great! Keep it up! 💪",
    "I'm proud of your progress! 🌟",
    "Every small step counts! 🎯",
    "You've got this! I believe in you! ✨",
    "Your consistency is inspiring! 🔥",
    "Great job on your goals this week! 🎉",
]


# Global buddy system
buddy_system = BuddySystem()
