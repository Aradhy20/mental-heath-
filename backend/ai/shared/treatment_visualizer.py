"""
Treatment Efficacy Visualization Data Generator
Generates data for visualizing treatment effectiveness over time
"""

from datetime import datetime, timedelta
from typing import List, Dict
from pydantic import BaseModel


class TreatmentDataPoint(BaseModel):
    date: datetime
    mood_score: float  # 0-100
    anxiety_level: float  # 0-100
    medication_adherence: float  # 0-100
    therapy_sessions: int
    wellness_score: float  # 0-100


class TreatmentEfficacyData(BaseModel):
    patient_id: int
    treatment_start_date: datetime
    data_points: List[TreatmentDataPoint]
    overall_improvement: float  # Percentage
    key_metrics: Dict[str, float]
    recommendations: List[str]


class TreatmentVisualizer:
    """Generate treatment efficacy visualization data"""
    
    def generate_efficacy_data(
        self,
        patient_id: int,
        start_date: datetime,
        end_date: datetime,
        data_points: List[TreatmentDataPoint]
    ) -> TreatmentEfficacyData:
        """Generate comprehensive treatment efficacy data"""
        
        if not data_points:
            return TreatmentEfficacyData(
                patient_id=patient_id,
                treatment_start_date=start_date,
                data_points=[],
                overall_improvement=0.0,
                key_metrics={},
                recommendations=["Insufficient data for analysis"]
            )
        
        # Calculate overall improvement
        first_point = data_points[0]
        last_point = data_points[-1]
        
        mood_improvement = ((last_point.mood_score - first_point.mood_score) / 100) * 100
        anxiety_reduction = ((first_point.anxiety_level - last_point.anxiety_level) / 100) * 100
        wellness_improvement = ((last_point.wellness_score - first_point.wellness_score) / 100) * 100
        
        overall_improvement = (mood_improvement + anxiety_reduction + wellness_improvement) / 3
        
        # Calculate key metrics
        avg_mood = sum(p.mood_score for p in data_points) / len(data_points)
        avg_anxiety = sum(p.anxiety_level for p in data_points) / len(data_points)
        avg_adherence = sum(p.medication_adherence for p in data_points) / len(data_points)
        total_sessions = sum(p.therapy_sessions for p in data_points)
        
        key_metrics = {
            "average_mood": round(avg_mood, 1),
            "average_anxiety": round(avg_anxiety, 1),
            "medication_adherence": round(avg_adherence, 1),
            "total_therapy_sessions": total_sessions,
            "mood_improvement_percent": round(mood_improvement, 1),
            "anxiety_reduction_percent": round(anxiety_reduction, 1),
        }
        
        # Generate recommendations
        recommendations = self._generate_recommendations(key_metrics, overall_improvement)
        
        return TreatmentEfficacyData(
            patient_id=patient_id,
            treatment_start_date=start_date,
            data_points=data_points,
            overall_improvement=round(overall_improvement, 1),
            key_metrics=key_metrics,
            recommendations=recommendations
        )
    
    def _generate_recommendations(self, metrics: Dict, improvement: float) -> List[str]:
        """Generate treatment recommendations based on data"""
        recommendations = []
        
        if improvement > 20:
            recommendations.append("Treatment showing excellent results - continue current plan")
        elif improvement > 10:
            recommendations.append("Treatment showing positive results - maintain consistency")
        elif improvement > 0:
            recommendations.append("Modest improvement - consider treatment adjustment")
        else:
            recommendations.append("Limited improvement - recommend treatment review with provider")
        
        if metrics["medication_adherence"] < 80:
            recommendations.append("Improve medication adherence for better outcomes")
        
        if metrics["total_therapy_sessions"] < 4:
            recommendations.append("Increase therapy session frequency")
        
        if metrics["average_anxiety"] > 70:
            recommendations.append("Consider additional anxiety management techniques")
        
        return recommendations


# Chart configuration for frontend
CHART_CONFIG = {
    "mood_chart": {
        "type": "line",
        "title": "Mood Trends Over Time",
        "y_axis": "Mood Score (0-100)",
        "color": "#00d9ff",
    },
    "anxiety_chart": {
        "type": "line",
        "title": "Anxiety Levels Over Time",
        "y_axis": "Anxiety Level (0-100)",
        "color": "#ff6b9d",
    },
    "wellness_chart": {
        "type": "line",
        "title": "Overall Wellness Score",
        "y_axis": "Wellness Score (0-100)",
        "color": "#c084fc",
    },
    "comparison_chart": {
        "type": "multi-line",
        "title": "Treatment Efficacy Comparison",
        "lines": ["mood", "anxiety_inverted", "wellness"],
        "colors": ["#00d9ff", "#ff6b9d", "#c084fc"],
    },
}


# Global visualizer instance
treatment_visualizer = TreatmentVisualizer()
