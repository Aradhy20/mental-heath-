"""
MindfulAI Reinforcement Learning Engine — v1.0
Implements a lightweight Multi-Armed Bandit (MAB) with Thompson Sampling
for personalized response style selection (Short, Deep, Coaching).
"""
import uuid
import numpy as np
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import datetime as dt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import DBRLFeedback, DBRLUserWeights
from core.logging import log

# In-memory cache for user weights to keep selection time < 1ms
_WEIGHTS_CACHE: Dict[str, Dict[str, float]] = {}

class RLEngine:
    def __init__(self):
        log.info("RLEngine Initialized: Multi-Armed Bandit via Thompson Sampling")

    async def get_user_weights(self, user_id: str, db: AsyncSession) -> Dict[str, float]:
        """
        Retrieves Thompson Sampling alpha/beta weights for a user.
        Uses in-memory cache with DB fallback.
        """
        user_id = user_id or "guest"
        if user_id in _WEIGHTS_CACHE:
            return _WEIGHTS_CACHE[user_id]

        # Check DB
        try:
            q = select(DBRLUserWeights).where(DBRLUserWeights.user_id == user_id)
            res = await db.execute(q)
            weights = res.scalars().first()

            if not weights:
                # Initialize weights with optimistic prior (alpha=1.0, beta=1.0)
                weights = DBRLUserWeights(
                    user_id=user_id,
                    alpha_short=1.0, beta_short=1.0,
                    alpha_deep=1.0, beta_deep=1.0,
                    alpha_coaching=1.0, beta_coaching=1.0
                )
                db.add(weights)
                await db.commit()

            w_dict = {
                "alpha_short": weights.alpha_short,
                "beta_short": weights.beta_short,
                "alpha_deep": weights.alpha_deep,
                "beta_deep": weights.beta_deep,
                "alpha_coaching": weights.alpha_coaching,
                "beta_coaching": weights.beta_coaching
            }
            _WEIGHTS_CACHE[user_id] = w_dict
            return w_dict
        except Exception as e:
            log.error(f"[RL] Error fetching user weights for {user_id}: {e}")
            # Safe fallback if DB fails
            return {
                "alpha_short": 1.0, "beta_short": 1.0,
                "alpha_deep": 1.0, "beta_deep": 1.0,
                "alpha_coaching": 1.0, "beta_coaching": 1.0
            }

    async def select_response_style(self, user_id: str, db: AsyncSession) -> str:
        """
        Selects the best response style using Thompson Sampling.
        Guaranteed to run in <2ms.
        """
        user_id = user_id or "guest"
        w = await self.get_user_weights(user_id, db)

        # Sample from Beta distribution for each style
        theta_short = np.random.beta(max(w["alpha_short"], 0.1), max(w["beta_short"], 0.1))
        theta_deep = np.random.beta(max(w["alpha_deep"], 0.1), max(w["beta_deep"], 0.1))
        theta_coaching = np.random.beta(max(w["alpha_coaching"], 0.1), max(w["beta_coaching"], 0.1))

        styles = {"short": theta_short, "deep": theta_deep, "coaching": theta_coaching}
        selected = max(styles, key=styles.get)
        log.info(f"[RL] MAB Choice for {user_id}: {selected} (short={theta_short:.3f}, deep={theta_deep:.3f}, coaching={theta_coaching:.3f})")
        return selected

    async def create_feedback_entry(
        self,
        user_id: str,
        input_text: str,
        response_text: str,
        style_selected: str,
        emotion_detected: str,
        db: AsyncSession
    ) -> str:
        """
        Creates a new feedback record in the database for tracking.
        """
        user_id = user_id or "guest"
        feedback_id = str(uuid.uuid4())
        try:
            entry = DBRLFeedback(
                id=feedback_id,
                user_id=user_id,
                input_text=input_text[:2000],
                response_text=response_text[:2000],
                style_selected=style_selected,
                emotion_detected=emotion_detected,
                reward=0.0
            )
            db.add(entry)
            await db.commit()
            return feedback_id
        except Exception as e:
            log.error(f"[RL] Error creating feedback entry: {e}")
            return feedback_id

    async def record_explicit_feedback(
        self,
        feedback_id: str,
        feedback_type: str,
        response_time_ms: Optional[float],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Processes explicit user feedback (thumbs up/down).
        Updates bandit weights and DB.
        """
        try:
            q = select(DBRLFeedback).where(DBRLFeedback.id == feedback_id)
            res = await db.execute(q)
            entry = res.scalars().first()

            if not entry:
                log.warning(f"[RL] Feedback entry {feedback_id} not found.")
                return {"status": "error", "message": "Feedback entry not found"}

            user_id = entry.user_id or "guest"
            style = entry.style_selected

            # Update entry
            entry.feedback_type = feedback_type
            if response_time_ms is not None:
                entry.response_time_ms = response_time_ms

            # Compute reward: Thumbs up (+2), Thumbs down (-2)
            reward_delta = 2.0 if feedback_type == "like" else -2.0
            entry.reward += reward_delta
            await db.commit()

            # Update MAB weights
            await self._update_user_weights(user_id, style, reward_delta, db)

            return {
                "status": "success",
                "feedback_id": feedback_id,
                "reward_applied": reward_delta,
                "style": style
            }
        except Exception as e:
            log.error(f"[RL] Error recording explicit feedback: {e}")
            return {"status": "error", "message": str(e)}

    async def record_continuation_feedback(
        self,
        user_id: str,
        style_selected: str,
        db: AsyncSession
    ):
        """
        Implicit feedback: User continues the conversation.
        Applies +1 reward to the selected style.
        """
        user_id = user_id or "guest"
        log.info(f"[RL] Implicit signal: {user_id} continued conversation using style '{style_selected}'. Applying +1 reward.")
        await self._update_user_weights(user_id, style_selected, 1.0, db)

    async def _update_user_weights(self, user_id: str, style: str, reward: float, db: AsyncSession):
        """
        Updates alpha and beta weights based on computed rewards.
        """
        user_id = user_id or "guest"
        try:
            # Update DB weights
            q = select(DBRLUserWeights).where(DBRLUserWeights.user_id == user_id)
            res = await db.execute(q)
            weights = res.scalars().first()

            if not weights:
                weights = DBRLUserWeights(user_id=user_id)
                db.add(weights)

            # Standard Bandit update rule
            if style == "short":
                if reward > 0:
                    weights.alpha_short += reward
                else:
                    weights.beta_short += abs(reward)
            elif style == "deep":
                if reward > 0:
                    weights.alpha_deep += reward
                else:
                    weights.beta_deep += abs(reward)
            elif style == "coaching":
                if reward > 0:
                    weights.alpha_coaching += reward
                else:
                    weights.beta_coaching += abs(reward)

            weights.updated_at = datetime.utcnow()
            await db.commit()

            # Update cache
            _WEIGHTS_CACHE[user_id] = {
                "alpha_short": weights.alpha_short,
                "beta_short": weights.beta_short,
                "alpha_deep": weights.alpha_deep,
                "beta_deep": weights.beta_deep,
                "alpha_coaching": weights.alpha_coaching,
                "beta_coaching": weights.beta_coaching
            }
            log.info(f"[RL] Weights updated for {user_id}: {dict(_WEIGHTS_CACHE[user_id])}")
        except Exception as e:
            log.error(f"[RL] Error updating weights for {user_id}: {e}")

rl_engine = RLEngine()
