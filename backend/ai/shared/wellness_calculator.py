"""
Wellness Score Calculator (Phase 5)
Calculates comprehensive wellness score from multiple factors
"""

from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class WellnessFactors(BaseModel):
    # Emotional factors (0-100)
    mood_score: float = 50.0
    anxiety_level: float = 50.0  # Inverted: lower is better
    stress_level: float = 50.0   # Inverted: lower is better
    
    # Behavioral factors (0-100)
    sleep_quality: float = 50.0
    exercise_frequency: float = 50.0
    social_interaction: float = 50.0
    
    # Treatment factors (0-100)
    medication_adherence: float = 100.0
    therapy_attendance: float = 100.0
    
    # Self-care factors (0-100)
    meditation_practice: float = 0.0
    journaling_frequency: float = 0.0
    
    # Risk factors (0-100, inverted)
    substance_use: float = 0.0  # Lower is better
    self_harm_thoughts: float = 0.0  # Lower is better


class WellnessScore(BaseModel):
    overall_score: float  # 0-100
    category_scores: Dict[str, float]
    strengths: List[str]
    areas_for_improvement: List[str]
    recommendations: List[str]
    trend: str  # improving, stable, declining
    calculated_at: datetime = datetime.utcnow()


class WellnessCalculator:
    """Calculate comprehensive wellness scores"""
    
    # Category weights (must sum to 1.0)
    WEIGHTS = {
        "emotional": 0.30,
        "behavioral": 0.25,
        "treatment": 0.20,
        "self_care": 0.15,
        "risk": 0.10
    }
    
    def calculate_score(self, factors: WellnessFactors, historical_scores: List[float] = None) -> WellnessScore:
        """
        Calculate overall wellness score
        
        Args:
            factors: Current wellness factors
            historical_scores: Previous scores for trend analysis
        """
        # Calculate category scores
        emotional_score = self._calculate_emotional_score(factors)
        behavioral_score = self._calculate_behavioral_score(factors)
        treatment_score = self._calculate_treatment_score(factors)
        self_care_score = self._calculate_self_care_score(factors)
        risk_score = self._calculate_risk_score(factors)
        
        category_scores = {
            "emotional": emotional_score,
            "behavioral": behavioral_score,
            "treatment": treatment_score,
            "self_care": self_care_score,
            "risk": risk_score
        }
        
        # Calculate weighted overall score
        overall_score = (
            emotional_score * self.WEIGHTS["emotional"] +
            behavioral_score * self.WEIGHTS["behavioral"] +
            treatment_score * self.WEIGHTS["treatment"] +
            self_care_score * self.WEIGHTS["self_care"] +
            risk_score * self.WEIGHTS["risk"]
        )
        
        # Identify strengths and areas for improvement
        strengths = self._identify_strengths(category_scores)
        areas_for_improvement = self._identify_improvements(category_scores)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(factors, category_scores)
        
        # Determine trend
        trend = self._calculate_trend(overall_score, historical_scores)
        
        return WellnessScore(
            overall_score=round(overall_score, 1),
            category_scores={k: round(v, 1) for k, v in category_scores.items()},
            strengths=strengths,
            areas_for_improvement=areas_for_improvement,
            recommendations=recommendations,
            trend=trend
        )
    
    def _calculate_emotional_score(self, factors: WellnessFactors) -> float:
        """Calculate emotional wellness score"""
        # Mood is positive, anxiety and stress are negative (inverted)
        return (
            factors.mood_score * 0.4 +
            (100 - factors.anxiety_level) * 0.3 +
            (100 - factors.stress_level) * 0.3
        )
    
    def _calculate_behavioral_score(self, factors: WellnessFactors) -> float:
        """Calculate behavioral wellness score"""
        return (
            factors.sleep_quality * 0.4 +
            factors.exercise_frequency * 0.3 +
            factors.social_interaction * 0.3
        )
    
    def _calculate_treatment_score(self, factors: WellnessFactors) -> float:
        """Calculate treatment adherence score"""
        return (
            factors.medication_adherence * 0.5 +
            factors.therapy_attendance * 0.5
        )
    
    def _calculate_self_care_score(self, factors: WellnessFactors) -> float:
        """Calculate self-care score"""
        return (
            factors.meditation_practice * 0.5 +
            factors.journaling_frequency * 0.5
        )
    
    def _calculate_risk_score(self, factors: WellnessFactors) -> float:
        """Calculate risk score (inverted - lower risk = higher score)"""
        risk_total = factors.substance_use + factors.self_harm_thoughts
        return 100 - (risk_total / 2)
    
    def _identify_strengths(self, category_scores: Dict[str, float]) -> List[str]:
        """Identify areas of strength (scores > 70)"""
        strengths = []
        if category_scores["emotional"] > 70:
            strengths.append("Strong emotional well-being")
        if category_scores["behavioral"] > 70:
            strengths.append("Healthy lifestyle habits")
        if category_scores["treatment"] > 70:
            strengths.append("Excellent treatment adherence")
        if category_scores["self_care"] > 50:
            strengths.append("Active self-care practice")
        if category_scores["risk"] > 80:
            strengths.append("Low risk factors")
        return strengths if strengths else ["Making progress in your wellness journey"]
    
    def _identify_improvements(self, category_scores: Dict[str, float]) -> List[str]:
        """Identify areas needing improvement (scores < 50)"""
        improvements = []
        if category_scores["emotional"] < 50:
            improvements.append("Emotional regulation")
        if category_scores["behavioral"] < 50:
            improvements.append("Lifestyle habits")
        if category_scores["treatment"] < 70:
            improvements.append("Treatment adherence")
        if category_scores["self_care"] < 30:
            improvements.append("Self-care practices")
        if category_scores["risk"] < 70:
            improvements.append("Risk management")
        return improvements
    
    def _generate_recommendations(self, factors: WellnessFactors, category_scores: Dict[str, float]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if factors.sleep_quality < 50:
            recommendations.append("Focus on improving sleep hygiene - aim for 7-9 hours")
        if factors.exercise_frequency < 50:
            recommendations.append("Increase physical activity - even 15 minutes daily helps")
        if factors.meditation_practice < 30:
            recommendations.append("Try daily meditation or mindfulness exercises")
        if factors.social_interaction < 50:
            recommendations.append("Engage in social activities to boost mood")
        if factors.anxiety_level > 70:
            recommendations.append("Practice anxiety management techniques")
        if factors.stress_level > 70:
            recommendations.append("Implement stress reduction strategies")
        
        if not recommendations:
            recommendations.append("Continue your current wellness practices")
        
        return recommendations[:5]  # Limit to top 5
    
    def _calculate_trend(self, current_score: float, historical_scores: List[float] = None) -> str:
        """Calculate wellness trend"""
        if not historical_scores or len(historical_scores) < 2:
            return "stable"
        
        # Compare current score to average of last 3 scores
        recent_avg = sum(historical_scores[-3:]) / min(3, len(historical_scores))
        
        if current_score > recent_avg + 5:
            return "improving"
        elif current_score < recent_avg - 5:
            return "declining"
        else:
            return "stable"


# Global calculator instance
wellness_calculator = WellnessCalculator()
