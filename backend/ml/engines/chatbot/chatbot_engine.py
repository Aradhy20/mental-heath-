"""
Mental Health Chatbot Engine - MindfulAI 3.0
OPTIMIZED: max_new_tokens reduced, use_cache=True, MPS/GPU generation, thread-streamer.
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from typing import Dict, List, Optional, Generator
from threading import Thread
import json

# ── Performance globals — set once at module load ─────────────────────────────
_MAX_NEW_TOKENS = 45        # Strict limit to prevent list generation / long comments
_TEMPERATURE    = 0.2       # High coherence, low temperature for SmolLM2 stability
_TOP_P          = 0.9
_REPETITION_PENALTY = 1.2   # Prevents repetitive loops and robotic phrases


class ChatContext:
    """Manages conversation memory for the LLM"""
    def __init__(self, max_history: int = 4):   # ↓ from 5 — smaller context window = faster tokenization
        self.history: List[Dict[str, str]] = []
        self.max_history = max_history

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        if len(self.history) > self.max_history * 2:
            # Always keep system prompt (index 0)
            system = [m for m in self.history if m["role"] == "system"]
            rest   = [m for m in self.history if m["role"] != "system"]
            self.history = system + rest[-(self.max_history * 2):]

    def get_messages(self) -> List[Dict[str, str]]:
        return self.history


class MentalHealthChatbot:
    """Intelligent mental health assistant using SmolLM2-135M"""
    
    def __init__(self, model_id: str = "HuggingFaceTB/SmolLM2-135M-Instruct", device: str = "cpu"):
        # Force CPU as per low-resource optimization requirements
        self.device = "cpu"
            
        print(f"[MindfulAI] Loading {model_id} on {self.device} (Low RAM Mode)...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, local_files_only=True)
        # Load with standard float32 for CPU stability and memory predictability
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float32,
            device_map=None,
            local_files_only=True,
        )
        
        # ── torch.compile disabled for 8GB RAM machines (compilation is RAM-heavy) ──
        self.model.eval()

        self.system_prompt = (
            "You are MindfulAI, a compassionate mental health companion. "
            "Respond with warmth and clinical insight. "
            "Be concise — 2 to 3 sentences maximum unless the user needs more."
        )
        self.contexts: Dict[str, ChatContext] = {}

        # ─ Warmup removed to save memory at startup ──────

    def _run_warmup(self):
        """Dummy 1-token generation to flush JIT/compile overhead at startup."""
        try:
            dummy = self.tokenizer("hello", return_tensors="pt")["input_ids"].to(self.device)
            mask  = torch.ones_like(dummy)
            with torch.no_grad():
                self.model.generate(
                    input_ids=dummy,
                    attention_mask=mask,
                    max_new_tokens=1,
                    do_sample=False,
                    use_cache=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            print("[MindfulAI] ✅ Warmup complete — model ready for first request.")
        except Exception as e:
            print(f"[MindfulAI] Warmup skipped ({e})")

    def set_system_prompt(self, system_prompt: str, user_id: str = "default"):
        """Overrides the system prompt for a session without rebuilding context."""
        if user_id not in self.contexts:
            self.contexts[user_id] = ChatContext()
        ctx = self.contexts[user_id]
        if ctx.history and ctx.history[0]["role"] == "system":
            ctx.history[0]["content"] = system_prompt
        else:
            ctx.history.insert(0, {"role": "system", "content": system_prompt})

    def _get_or_create_context(self, user_id: str) -> ChatContext:
        if user_id not in self.contexts:
            ctx = ChatContext()
            ctx.add_message("system", self.system_prompt)
            self.contexts[user_id] = ctx
        return self.contexts[user_id]

    def _prepare_inputs(self, messages):
        """Tokenise messages and always return input_ids + attention_mask."""
        raw = self.tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        )
        if isinstance(raw, torch.Tensor):
            input_ids = raw.to(self.device)
        else:
            input_ids = raw["input_ids"].to(self.device)
        # Always build attention_mask — required on MPS, safe on all devices
        attention_mask = torch.ones_like(input_ids)
        return input_ids, attention_mask

    def chat(self, user_input: str, user_id: str = "default") -> str:
        """Blocking generation — use chat_stream for production."""
        context = self._get_or_create_context(user_id)
        context.add_message("user", user_input)
        input_ids, attention_mask = self._prepare_inputs(context.get_messages())

        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=_MAX_NEW_TOKENS,
                temperature=_TEMPERATURE,
                top_p=_TOP_P,
                repetition_penalty=_REPETITION_PENALTY,
                do_sample=True,
                use_cache=True,
                pad_token_id=self.tokenizer.eos_token_id
            )

        response_text = self.tokenizer.decode(
            outputs[0][input_ids.shape[1]:], skip_special_tokens=True
        ).strip()
        context.add_message("assistant", response_text)
        return response_text

    def chat_stream(self, user_input: str, user_id: str = "default") -> Generator[str, None, None]:
        """Non-blocking threaded streamer — yields tokens as generated."""
        context = self._get_or_create_context(user_id)
        context.add_message("user", user_input)
        input_ids, attention_mask = self._prepare_inputs(context.get_messages())

        streamer = TextIteratorStreamer(
            self.tokenizer, skip_prompt=True, skip_special_tokens=True
        )

        generation_kwargs = dict(
            input_ids=input_ids,
            attention_mask=attention_mask,
            streamer=streamer,
            max_new_tokens=_MAX_NEW_TOKENS,
            temperature=_TEMPERATURE,
            top_p=_TOP_P,
            repetition_penalty=_REPETITION_PENALTY,
            do_sample=True,
            use_cache=True,
            pad_token_id=self.tokenizer.eos_token_id,
        )

        thread = Thread(target=self.model.generate, kwargs=generation_kwargs, daemon=True)
        thread.start()

        full_response = ""
        for new_text in streamer:
            full_response += new_text
            yield new_text

        context.add_message("assistant", full_response.strip())


class LegacyMoodSupport:
    @staticmethod
    def get_resources():
        return (
            "**Crisis Support:**\n"
            "- Suicide & Crisis Lifeline: **988**\n"
            "- Crisis Text Line: Text **HOME** to **741741**\n"
        )
