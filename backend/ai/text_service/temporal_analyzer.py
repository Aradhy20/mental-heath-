"""
Temporal Emotion Analyzer for Pattern Recognition
Analyzes emotion patterns over time, detects triggers, and predicts future states
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict
import statistics

class TemporalEmotionAnalyzer:
    def __init__(self, db_session):
        """
        Initialize the temporal analyzer with database session
        """
        self.db = db_session
        self.emotion_weights = {
            'joy': 1.0,
            'neutral': 0.5,
            'surprise': 0.6,
            'sadness': -0.5,
            'anger': -0.8,
            'fear': -0.7,
            'disgust': -0.6
        }
    
    def get_emotion_history(self, user_id: int, days: int = 30) -> List[Dict]:
        """
        Get emotion history for a user over specified days
        Returns list of emotion records with timestamps
        """
        from shared.models import TextAnalysis
        from sqlalchemy import and_
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        results = self.db.query(TextAnalysis).filter(
            and_(
                TextAnalysis.user_id == user_id,
                TextAnalysis.created_at >= cutoff_date
            )
        ).order_by(TextAnalysis.created_at.asc()).all()
        
        history = []
        for record in results:
            history.append({
                'timestamp': record.created_at.isoformat(),
                'emotion': record.emotion_label,
                'score': float(record.emotion_score),
                'confidence': float(record.confidence),
                'text': record.input_text
            })
        
        return history
    
    def analyze_patterns(self, user_id: int) -> Dict:
        """
        Analyze emotion patterns for a user
        Returns temporal patterns, triggers, and predictions
        """
        history = self.get_emotion_history(user_id, days=30)
        
        if len(history) < 5:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 5 emotion records for pattern analysis'
            }
        
        # Temporal mapping (heatmap data)
        heatmap = self._create_temporal_heatmap(history)
        
        # Detect triggers
        triggers = self._detect_triggers(history)
        
        # Predict future state (48h forecast)
        forecast = self._predict_emotion_trend(history)
        
        # Anomaly detection
        anomalies = self._detect_anomalies(history)
        
        return {
            'status': 'success',
            'temporal_heatmap': heatmap,
            'detected_triggers': triggers,
            'forecast_48h': forecast,
            'anomalies': anomalies,
            'total_records': len(history),
            'analysis_period_days': 30
        }
    
    def _create_temporal_heatmap(self, history: List[Dict]) -> Dict:
        """
        Create temporal heatmap showing emotion distribution by time
        """
        # Group by day and hour
        daily_emotions = defaultdict(list)
        hourly_emotions = defaultdict(list)
        
        for record in history:
            dt = datetime.fromisoformat(record['timestamp'])
            day_key = dt.strftime('%Y-%m-%d')
            hour_key = dt.hour
            
            emotion_value = self.emotion_weights.get(record['emotion'], 0) * record['score']
            
            daily_emotions[day_key].append(emotion_value)
            hourly_emotions[hour_key].append(emotion_value)
        
        # Calculate daily averages
        daily_heatmap = {}
        for day, values in daily_emotions.items():
            daily_heatmap[day] = {
                'average_mood': round(statistics.mean(values), 2),
                'count': len(values),
                'variance': round(statistics.variance(values) if len(values) > 1 else 0, 2)
            }
        
        # Calculate hourly patterns
        hourly_pattern = {}
        for hour, values in hourly_emotions.items():
            hourly_pattern[hour] = {
                'average_mood': round(statistics.mean(values), 2),
                'count': len(values)
            }
        
        return {
            'daily': daily_heatmap,
            'hourly': hourly_pattern
        }
    
    def _detect_triggers(self, history: List[Dict]) -> List[Dict]:
        """
        Detect potential emotional triggers from text patterns
        """
        triggers = []
        
        # Common trigger keywords
        trigger_keywords = {
            'work': ['work', 'job', 'boss', 'deadline', 'meeting', 'project'],
            'relationships': ['relationship', 'partner', 'family', 'friend', 'alone', 'lonely'],
            'health': ['sick', 'pain', 'tired', 'exhausted', 'sleep', 'insomnia'],
            'financial': ['money', 'debt', 'bills', 'financial', 'broke', 'expensive'],
            'time': ['late', 'night', 'morning', 'evening', 'weekend']
        }
        
        trigger_counts = defaultdict(lambda: {'count': 0, 'negative_emotions': 0, 'contexts': []})
        
        for record in history:
            text_lower = record['text'].lower()
            emotion = record['emotion']
            is_negative = emotion in ['sadness', 'anger', 'fear', 'disgust']
            
            for category, keywords in trigger_keywords.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        trigger_counts[category]['count'] += 1
                        if is_negative:
                            trigger_counts[category]['negative_emotions'] += 1
                        if len(trigger_counts[category]['contexts']) < 3:
                            trigger_counts[category]['contexts'].append({
                                'text': record['text'][:100],
                                'emotion': emotion,
                                'timestamp': record['timestamp']
                            })
        
        # Identify significant triggers (>30% negative correlation)
        for category, data in trigger_counts.items():
            if data['count'] >= 3:
                negative_ratio = data['negative_emotions'] / data['count']
                if negative_ratio > 0.3:
                    triggers.append({
                        'category': category,
                        'frequency': data['count'],
                        'negative_correlation': round(negative_ratio * 100, 1),
                        'severity': 'high' if negative_ratio > 0.7 else 'medium',
                        'sample_contexts': data['contexts']
                    })
        
        return sorted(triggers, key=lambda x: x['negative_correlation'], reverse=True)
    
    def _predict_emotion_trend(self, history: List[Dict]) -> Dict:
        """
        Predict emotion trend for next 48 hours based on patterns
        """
        if len(history) < 10:
            return {'status': 'insufficient_data'}
        
        # Get recent trend (last 7 days)
        recent_history = history[-20:]  # Last 20 records
        
        # Calculate moving average
        recent_values = [
            self.emotion_weights.get(r['emotion'], 0) * r['score']
            for r in recent_history
        ]
        
        trend_direction = 'stable'
        if len(recent_values) >= 5:
            first_half = statistics.mean(recent_values[:len(recent_values)//2])
            second_half = statistics.mean(recent_values[len(recent_values)//2:])
            
            if second_half > first_half + 0.2:
                trend_direction = 'improving'
            elif second_half < first_half - 0.2:
                trend_direction = 'declining'
        
        # Predict next 48h
        current_avg = statistics.mean(recent_values[-5:])
        
        forecast = {
            'trend_direction': trend_direction,
            'current_mood_score': round(current_avg, 2),
            'predicted_24h': round(current_avg * 0.95, 2),  # Slight regression to mean
            'predicted_48h': round(current_avg * 0.9, 2),
            'confidence': 0.7 if len(recent_values) >= 15 else 0.5
        }
        
        return forecast
    
    def _detect_anomalies(self, history: List[Dict]) -> List[Dict]:
        """
        Detect anomalous emotional states
        """
        if len(history) < 10:
            return []
        
        # Calculate baseline
        all_values = [
            self.emotion_weights.get(r['emotion'], 0) * r['score']
            for r in history
        ]
        
        mean_value = statistics.mean(all_values)
        std_dev = statistics.stdev(all_values) if len(all_values) > 1 else 0.5
        
        anomalies = []
        for record in history[-20:]:  # Check last 20 records
            value = self.emotion_weights.get(record['emotion'], 0) * record['score']
            z_score = abs((value - mean_value) / std_dev) if std_dev > 0 else 0
            
            if z_score > 2:  # More than 2 standard deviations
                anomalies.append({
                    'timestamp': record['timestamp'],
                    'emotion': record['emotion'],
                    'severity': 'high' if z_score > 3 else 'medium',
                    'deviation': round(z_score, 2),
                    'text_preview': record['text'][:100]
                })
        
        return anomalies

# Global instance (will be initialized with db session)
temporal_analyzer = None

def initialize_temporal_analyzer(db_session):
    """Initialize the global temporal analyzer"""
    global temporal_analyzer
    temporal_analyzer = TemporalEmotionAnalyzer(db_session)
    return temporal_analyzer
