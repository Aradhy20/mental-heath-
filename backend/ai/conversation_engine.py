"""
MindfulAI Conversation Engine — Optimized v3.1
- Dead unreachable code removed (was after return on L209-222)
- learning_loop cached (called once per process, not per request)
- Prompt building is pure CPU, no I/O — fast
"""

from typing import List, Dict
from core.logging import log
try:
    from langsmith import traceable
except ImportError:
    # Dummy decorator if langsmith isn't installed yet
    def traceable(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

# ── Clinical action library ────────────────────────────────────────────────────
ACTION_LIBRARY = {
    "sad": [
        "Try the '5-4-3-2-1' grounding technique: name 5 things you see, 4 you hear, 3 you can touch.",
        "Write 3 sentences in a journal — not about the problem, but about anything you noticed today.",
        "Send one message to someone you trust. It doesn't have to be about how you feel.",
        "Step outside for just 5 minutes. Natural light has a direct effect on serotonin.",
        "Listen to one song that you associate with a better time.",
    ],
    "anxious": [
        "Try box breathing right now: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.",
        "Write your worry down on paper and physically set it aside — it reduces cognitive load.",
        "Do 10 slow shoulder rolls. Physical tension is anxiety made physical.",
        "Name the anxiety: 'I am feeling anxious about ___.' Specificity reduces its power.",
        "Set a 10-minute timer. Tell yourself you only have to manage the next 10 minutes.",
    ],
    "angry": [
        "Before you respond to anything, wait 90 seconds. The neurochemical surge of anger dissolves in 90 seconds.",
        "Write the angry thoughts — but don't send them. Get them out of your system.",
        "Do 5 minutes of brisk movement — walk, jump, anything physical to discharge the energy.",
        "Ask yourself: 'What is the actual need underneath this anger?' Anger is almost always a secondary emotion.",
        "Splash cold water on your face or wrists. It activates the dive reflex and slows your heart rate.",
    ],
    "happy": [
        "This is a good moment to set one small goal for tomorrow while your energy is high.",
        "Capture this feeling — write one sentence about what's contributing to it.",
        "Use this momentum to do one thing you've been avoiding. Positive affect boosts follow-through.",
    ],
    "neutral": [
        "Check in with your body — are you hungry, thirsty, or tired? Basic needs often mask emotional ones.",
        "Take 3 slow, deliberate breaths. Even neutral moments benefit from a reset.",
        "Ask yourself: 'What would make today feel 10% better?'",
    ],
    "anhedonia": [
        "Anhedonia (not wanting to do anything) is a real symptom, not laziness. Be gentle with yourself.",
        "Start with the smallest possible version of one activity — not an hour, just 2 minutes.",
        "Try 'behavioral activation': do one small activity before the motivation arrives, not after.",
        "Tell someone close to you that you're feeling flat today. You don't need to explain it fully.",
        "If this has lasted more than 2 weeks, please consider speaking with a professional GP first.",
    ],
    "lonely": [
        "Send one message today — to absolutely anyone. Even 'hey, how are you?' counts.",
        "Join one online community around a hobby you have. You don't have to speak, just observe.",
        "Try spending 20 minutes in a public space (a café, a park). Passive social contact matters.",
        "Write a letter to yourself from the perspective of someone who loves you deeply.",
        "Call or video chat one person this week — even a brief call reshapes the isolation feeling.",
    ],
    "fatigue": [
        "Emotional fatigue is real and physical. Your first step is permission — you are allowed to rest.",
        "Cancel or postpone one non-critical obligation today. Protecting your energy is not selfish.",
        "Drink a full glass of water now and eat something small. Basic needs are the first casualty of fatigue.",
        "Try a 10-minute 'non-sleep deep rest' (NSDR): lie flat, breathe slowly, let your mind wander.",
        "Identify the one thing draining you most — and ask: can this be delegated, delayed, or dropped?",
    ],
}

ANHEDONIA_SIGNALS = [
    "don't want to do anything", "don't feel like doing", "no motivation",
    "nothing feels good", "can't enjoy", "feel empty", "feel nothing",
    "what's the point", "don't care about anything", "numb"
]

# ── Module-level cache: rank_interventions() is expensive on first call ────────
# Cache it for 60 requests before re-evaluating clinical style drift
_CACHED_RANKED_STYLES: list = []
_CACHE_CALL_COUNT: int = 0
_CACHE_REFRESH_EVERY: int = 60   # refresh every 60 requests

PERSONA_MAP = {
    "SUPPORT":  "deeply empathetic clinical companion who listens with unconditional positive regard and never sounds robotic.",
    "CBT":      "skillful cognitive-behavioural guide who helps identify thinking traps with a warm, supportive alliance.",
    "COACHING": "visionary wellness coach focused on momentum, strengths, and the user's hidden resilience.",
    "CRISIS":   "highly trained crisis counselor whose voice is calm, clear, and prioritizes absolute safety above all else.",
}


class ConversationEngine:
    def __init__(self):
        self._last_action_idx: Dict[str, int] = {}

    def _get_action(self, emotion: str, user_id: str = "guest") -> str:
        actions = ACTION_LIBRARY.get(emotion, ACTION_LIBRARY["neutral"])
        key = f"{user_id}_{emotion}"
        idx = self._last_action_idx.get(key, 0)
        action = actions[idx % len(actions)]
        self._last_action_idx[key] = idx + 1
        return action

    def _detect_anhedonia(self, text: str) -> bool:
        t = text.lower()
        return any(s in t for s in ANHEDONIA_SIGNALS)

    async def generate_response(
        self, user_input: str, mode: str, history: List[Dict],
        emotion: str, context_data: dict = None
    ) -> dict:
        prompt_pkg = await self.get_system_prompt(user_input, mode, history, emotion, context_data)
        system_prompt    = prompt_pkg["system_prompt"]
        mode             = prompt_pkg["mode"]
        emotion          = prompt_pkg["emotion"]
        suggested_action = prompt_pkg["suggested_action"]

        from ai.llm_manager import llm_manager
        history_text = "\n".join(
            [f"{m['role'].upper()}: {m['content']}" for m in history[-4:]]
        ) if history else ""
        full_input = f"{history_text}\nUSER: {user_input}" if history_text else user_input

        final_text = await llm_manager.generate_response(system_prompt, full_input)

        if mode == "CRISIS" and "988" not in final_text:
            final_text = (
                "⚠️ Your safety matters most right now.\n\n"
                + final_text
                + "\n\nPlease call **988** or text **HOME to 741741** immediately."
            )

        return {
            "message":        final_text,
            "action_suggested": suggested_action,
            "emotion_detected": emotion,
            "mode":           mode,
        }

    @traceable(name="Build Clinical Prompt", run_type="prompt")
    async def get_system_prompt(
        self, user_input: str, mode: str, history: List[Dict],
        emotion: str, context_data: dict = None
    ) -> dict:
        """
        Builds the clinical system prompt.
        Pure CPU work — no DB calls, no imports-per-request.
        """
        global _CACHED_RANKED_STYLES, _CACHE_CALL_COUNT

        # Anhedonia override
        if self._detect_anhedonia(user_input):
            emotion = "anhedonia"
            mode    = "SUPPORT"

        user_id      = (context_data or {}).get("user_id", "guest")
        recent_moods = (context_data or {}).get("recent_moods", "")
        digital_twin = (context_data or {}).get("digital_twin_memory", {})

        twin_insight    = ""
        burnout_warning = ""

        if isinstance(digital_twin, dict):
            twin_insight = digital_twin.get("weekly_insight", "")
            prediction   = digital_twin.get("prediction", {})
            if isinstance(prediction, dict):
                b_risk = prediction.get("burnout_risk", "LOW")
                b_24h  = prediction.get("prediction_24h", "")
                if b_risk in ("HIGH", "MODERATE"):
                    burnout_warning = f"⚠️ BURNOUT FORECAST: {b_24h} (Risk: {b_risk}). Weave naturally."

        memory_timestamps = digital_twin if isinstance(digital_twin, str) and "On " in digital_twin else ""

        suggested_action = self._get_action(emotion, user_id)

        # ── Cached learning_loop call (refresh every 60 requests) ────────────
        _CACHE_CALL_COUNT += 1
        if not _CACHED_RANKED_STYLES or (_CACHE_CALL_COUNT % _CACHE_REFRESH_EVERY == 0):
            from ai.learning_loop import learning_loop
            _CACHED_RANKED_STYLES = learning_loop.rank_interventions()

        top_style       = _CACHED_RANKED_STYLES[0]["intervention"] if _CACHED_RANKED_STYLES else "SUPPORT"
        learning_utility = _CACHED_RANKED_STYLES[0]["utility"]    if _CACHED_RANKED_STYLES else 0.5
        if learning_utility > 0.8 and mode == "SUPPORT":
            mode = top_style

        agent_role = PERSONA_MAP.get(mode, "senior mental wellness companion")

        # ── Lazy-import personalization (cached singleton) ─────────────────────
        from ai.personalization_engine import personalization_engine
        twin_profile = digital_twin if isinstance(digital_twin, dict) else {}
        tone = personalization_engine.get_tone_adjustment(twin_profile)

        # ── Build prompt using fast string join (avoids += overhead) ──────────
        if mode == "CRISIS":
            parts = [
                "You are a calm, highly trained crisis counselor at MindfulAI.",
                "",
                "CRITICAL CRISIS OVERRIDE: The user is in danger. Your ONLY goal is their immediate safety.",
                "You MUST generate the same calm, direct safety message in all three XML tags below. Promptly instruct them to call 988 or text HOME to 741741 immediately.",
                "",
                "XML TAGS REQUIRED:",
                "<short>Your safety is the absolute priority. Please connect with the Crisis Lifeline by calling 988 or texting HOME to 741741 immediately. I am here with you.</short>",
                "<deep>I hear you, and please know that you are not alone in this moment. Your safety is what matters most right now. Please call 988 or text HOME to 741741 to reach a crisis counselor immediately. I'm here.</deep>",
                "<coaching>Please take a gentle breath. I need you to prioritize your safety right now. Call 988 or text HOME to 741741 immediately to speak to someone who can support you. Please do this for yourself.</coaching>"
            ]
        else:
            parts = [
                f"You are {agent_role} at MindfulAI.",
                f"Linguistic Protocol: {tone}. Communicate with clinical sophistication.",
                "",
                "CRITICAL RESPONSE INSTRUCTION: You MUST generate exactly THREE distinct candidate responses, each representing a different response style. You MUST enclose each style response inside the exact XML tags specified below. DO NOT include any introductory or concluding text outside these XML tags.",
                "",
                "XML TAGS REQUIRED:",
                "<short>[A highly concise, direct, 1-2 sentence response with absolute minimal fluff]</short>",
                "<deep>[A deeply empathetic, validating response of 2-3 sentences reflecting a warm clinical alliance]</deep>",
                "<coaching>[A forward-looking, wellness-oriented response of 2-3 sentences suggesting a specific micro-action or reflection based on the intervention: \"" + suggested_action + "\"]</coaching>",
                "",
                "CORE REQUIREMENTS FOR ALL CANDIDATES:",
                "1. NEVER use clichéd openers like 'I understand', 'That sounds difficult', or 'As an AI'.",
                "2. Mirror the user's vocabulary and energy level with genuine empathy.",
                "3. STYLE: Be supportive, human, and direct."
            ]

        if recent_moods and mode != "CRISIS":
            parts += ["", f"PERSONAL HISTORY: {recent_moods}"]
        if memory_timestamps and mode != "CRISIS":
            parts += ["", f"MEMORY LOG: {memory_timestamps}"]
        if twin_insight and mode != "CRISIS":
            parts += ["", f"CLINICAL INSIGHT: {twin_insight}"]
        if burnout_warning and mode != "CRISIS":
            parts += ["", burnout_warning]


        system_prompt = "\n".join(parts)

        return {
            "system_prompt":   system_prompt,
            "mode":            mode,
            "emotion":         emotion,
            "suggested_action": suggested_action,
        }


conversation_engine = ConversationEngine()
