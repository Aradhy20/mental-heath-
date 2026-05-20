"""
MindfulAI Risk Detector — v3.1 Optimized
Uses high-precision keyword matching for immediate crisis detection.
ML-based risk prediction is handled by risk_model.py (DistilBERT fine-tuned).
"""

from core.logging import log


class RiskDetector:
    def __init__(self):
        # Critical crisis trigger keywords — immediate override
        self.critical_keywords = [
            "suicide", "kill myself", "end my life", "die", "end it all",
            "hurt myself", "better off dead", "no reason to live", "want to die",
            "harm myself", "overdose", "self-harm"
        ]

        # Moderate risk signals — elevated but not crisis
        self.concerning_keywords = [
            "scared", "panicking", "can't breathe", "hopeless", "worthless",
            "trapped", "no way out", "can't do this anymore"
        ]

    def check_risk(self, text: str):
        """
        Returns (is_crisis: bool, risk_level: str).
        Pure keyword matching — fast, deterministic, no model loading.
        ML risk prediction is delegated to risk_model.py.
        """
        text_lower = text.lower()

        # 1. CRITICAL — immediate crisis override
        for kw in self.critical_keywords:
            if kw in text_lower:
                log.warning(f"[RiskDetector] CRITICAL keyword detected: '{kw}'")
                return True, "HIGH"

        # 2. MODERATE — concerning but not crisis
        for kw in self.concerning_keywords:
            if kw in text_lower:
                log.info(f"[RiskDetector] Concerning signal: '{kw}'")
                return False, "MODERATE"

        return False, "LOW"


risk_detector = RiskDetector()
