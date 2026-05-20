import os
import asyncio
from langchain_core.messages import HumanMessage, SystemMessage
from core.logging import log

try:
    from langchain_groq import ChatGroq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

try:
    from langsmith import traceable
except ImportError:
    def traceable(*args, **kwargs):
        return lambda f: f

from ml.engines.chatbot.chatbot_engine import MentalHealthChatbot



class LLMManager:
    def __init__(self):
        self.groq_key  = os.getenv("GROQ_API_KEY")
        self.local_llm = None
        self.llm       = None
        self._initialized = False

    def _lazy_init(self):
        if self._initialized:
            return

        # Model priority: 70B for quality, 8B as fallback
        GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

        if self.groq_key and HAS_GROQ:
            for model_name in GROQ_MODELS:
                try:
                    from langchain_groq import ChatGroq
                    self.llm = ChatGroq(
                        temperature=0.65,
                        model_name=model_name,
                        groq_api_key=self.groq_key,
                        max_tokens=300,
                    )
                    log.info(f"LLM: ChatGroq ({model_name}) ✅")
                    self._initialized = True
                    return
                except Exception as e:
                    log.warning(f"Groq model {model_name} failed: {e} — trying next.")
            self.groq_key = None  # All Groq models failed

        if not self.groq_key or not HAS_GROQ:
            try:
                from ml.engines.chatbot.chatbot_engine import MentalHealthChatbot
                self.local_llm = MentalHealthChatbot()
                log.info("LLM: Local SmolLM2-135M ✅")
                self._initialized = True
            except Exception as e:
                log.critical(f"FATAL: Local LLM failed to load: {e}")

    # ── Streaming (primary path for the chat endpoint) ─────────────────────────
    @traceable(name="LLM Stream Generation", run_type="llm")
    async def generate_response_stream(self, system_prompt: str, user_input: str):
        self._lazy_init()
        """
        Async generator: yields tokens as they are produced.
        Groq: uses LangChain stream() in a thread (sync → async bridge).
        Local: uses TextIteratorStreamer in a daemon thread.
        """
        try:
            if self.groq_key and HAS_GROQ and self.llm:
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_input),
                ]
                async for chunk in self.llm.astream(messages):
                    yield chunk.content
                return

            if self.local_llm:
                # ── Clear session to avoid doubling the history ────────────────
                sess = "llm_manager_session"
                if sess in self.local_llm.contexts:
                    self.local_llm.contexts[sess].history = []
                self.local_llm.set_system_prompt(system_prompt, user_id=sess)

                # chat_stream is a sync generator — bridge to async with run_in_executor
                loop = asyncio.get_running_loop()
                queue: asyncio.Queue = asyncio.Queue()

                def _run_stream():
                    """Runs in a thread; pushes tokens into the asyncio queue."""
                    try:
                        for token in self.local_llm.chat_stream(user_input, user_id=sess):
                            asyncio.run_coroutine_threadsafe(queue.put(token), loop)
                    finally:
                        asyncio.run_coroutine_threadsafe(queue.put(None), loop)  # sentinel

                import threading
                t = threading.Thread(target=_run_stream, daemon=True)
                t.start()

                while True:
                    token = await queue.get()
                    if token is None:
                        break
                    yield token
                return

            yield "Service temporarily unavailable."

        except Exception as e:
            log.error(f"[LLMManager] Stream error: {e}")
            yield "Connection interrupted. Please try again."

    # ── Non-streaming fallback (kept for internal use) ─────────────────────────
    async def generate_response(self, system_prompt: str, user_input: str) -> str:
        self._lazy_init()
        try:
            if self.groq_key and HAS_GROQ and self.llm:
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_input),
                ]
                response = self.llm.invoke(messages)
                return response.content

            if self.local_llm:
                sess = "llm_manager_session"
                if sess in self.local_llm.contexts:
                    self.local_llm.contexts[sess].history = []
                self.local_llm.set_system_prompt(system_prompt, user_id=sess)
                return self.local_llm.chat(user_input, user_id=sess)

            return "Service temporarily unavailable."
        except Exception as e:
            log.error(f"[LLMManager] Generation error: {e}")
            return "I'm having trouble connecting right now. Please try again."


llm_manager = LLMManager()
