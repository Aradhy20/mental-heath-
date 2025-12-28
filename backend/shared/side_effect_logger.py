"""
Medication Side Effect Logging Service (Phase 5)
Tracks medication side effects and patterns
"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum


class SeverityLevel(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"


class SideEffectLog(BaseModel):
    log_id: Optional[int] = None
    user_id: int
    medication_name: str
    dosage: str
    side_effect: str
    severity: SeverityLevel
    description: Optional[str] = None
    timestamp: datetime = datetime.utcnow()
    reported_by: str = "patient"  # patient, doctor, system
    
    class Config:
        use_enum_values = True


class SideEffectAnalysis(BaseModel):
    medication_name: str
    total_reports: int
    common_side_effects: List[dict]
    severity_distribution: dict
    recommendations: List[str]


def analyze_side_effects(user_id: int, medication_name: str, logs: List[SideEffectLog]) -> SideEffectAnalysis:
    """
    Analyze side effect patterns for a medication
    """
    # Count side effects
    side_effect_counts = {}
    severity_counts = {"mild": 0, "moderate": 0, "severe": 0, "critical": 0}
    
    for log in logs:
        # Count side effects
        if log.side_effect in side_effect_counts:
            side_effect_counts[log.side_effect] += 1
        else:
            side_effect_counts[log.side_effect] = 1
        
        # Count severity
        severity_counts[log.severity] += 1
    
    # Get common side effects
    common_side_effects = [
        {"effect": effect, "count": count, "percentage": round(count / len(logs) * 100, 1)}
        for effect, count in sorted(side_effect_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Generate recommendations
    recommendations = []
    if severity_counts["severe"] > 0 or severity_counts["critical"] > 0:
        recommendations.append("Consult your doctor immediately about severe side effects")
    if severity_counts["moderate"] > len(logs) * 0.3:
        recommendations.append("Consider discussing dosage adjustment with your healthcare provider")
    if len(side_effect_counts) > 5:
        recommendations.append("Multiple side effects detected - schedule a medication review")
    
    return SideEffectAnalysis(
        medication_name=medication_name,
        total_reports=len(logs),
        common_side_effects=common_side_effects,
        severity_distribution=severity_counts,
        recommendations=recommendations
    )


# Placeholder for database integration
class SideEffectService:
    """Service for managing medication side effects"""
    
    def __init__(self):
        self.logs = []  # In production, use database
    
    def log_side_effect(self, log: SideEffectLog) -> SideEffectLog:
        """Log a new side effect"""
        log.log_id = len(self.logs) + 1
        self.logs.append(log)
        return log
    
    def get_user_logs(self, user_id: int) -> List[SideEffectLog]:
        """Get all side effect logs for a user"""
        return [log for log in self.logs if log.user_id == user_id]
    
    def get_medication_logs(self, user_id: int, medication_name: str) -> List[SideEffectLog]:
        """Get side effect logs for a specific medication"""
        return [
            log for log in self.logs 
            if log.user_id == user_id and log.medication_name.lower() == medication_name.lower()
        ]
    
    def analyze_medication(self, user_id: int, medication_name: str) -> SideEffectAnalysis:
        """Analyze side effects for a medication"""
        logs = self.get_medication_logs(user_id, medication_name)
        if not logs:
            return SideEffectAnalysis(
                medication_name=medication_name,
                total_reports=0,
                common_side_effects=[],
                severity_distribution={"mild": 0, "moderate": 0, "severe": 0, "critical": 0},
                recommendations=["No side effects reported yet"]
            )
        return analyze_side_effects(user_id, medication_name, logs)


# Global service instance
side_effect_service = SideEffectService()
