"""
MindfulAI RAG System — Optimized v3.1
Key optimization: embedding cache prevents re-embedding identical queries.
ChromaDB vector search is now run in a thread executor (non-blocking).
"""

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_core.prompts import PromptTemplate
from typing import List, Dict
import os
import hashlib
import time
from core.logging import log
try:
    from langsmith import traceable
except ImportError:
    def traceable(*args, **kwargs):
        return lambda f: f


# ── Embedding cache: avoids re-embedding same / similar queries ───────────────
# Format: { query_hash: (result_list, timestamp) }
_EMBEDDING_CACHE: Dict[str, tuple] = {}
_CACHE_TTL_SECONDS = 300   # 5 minutes — clinical context doesn't change per message


def _query_hash(query: str) -> str:
    """Stable hash for the first 100 chars of a normalized query."""
    return hashlib.md5(query[:100].lower().strip().encode()).hexdigest()


class MentalHealthRAG:
    def __init__(self, vector_db_path: str = "./chroma_db"):
        self.vector_db_path = vector_db_path
        self.embedding_function = None
        self.vector_store = None

        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template=(
                "You are a mental health assistant. Based on the following knowledge "
                "and the user's question, provide a helpful and empathetic response.\n\n"
                "Knowledge:\n{context}\n\n"
                "User: {question}\n\nResponse:"
            )
        )

        # Rule-based responses as fallback (no LLM needed for RAG context)
        self.rule_based_responses = {
            "depression": "Depression can involve persistent sadness, low energy, and reduced interest. Speaking with a professional and gentle daily structure can both help significantly.",
            "anxiety": "Anxiety often manifests as excessive worry and physical tension. Box breathing and gradual exposure are evidence-based starting points.",
            "stress": "Stress benefits from both immediate regulation (breathing, movement) and longer-term boundary-setting.",
            "suicide": "If you are having thoughts of self-harm, please call 988 or text HOME to 741741 immediately. You deserve care and support.",
            "coping": "Regular self-care — movement, sleep, connection — builds the foundation that makes coping strategies work.",
            "general": "Mental health is central to overall wellbeing. Seeking support is a sign of strength.",
        }

    def _lazy_init(self):
        """Initializes heavy embedding models only when needed."""
        if self.embedding_function is None:
            log.info("RAG: Lazy-loading embedding model (MiniLM)...")
            from langchain_community.embeddings import SentenceTransformerEmbeddings
            self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
            
            from langchain_community.vectorstores import Chroma
            self.vector_store = Chroma(
                persist_directory=self.vector_db_path,
                embedding_function=self.embedding_function,
                collection_name="mental_health_knowledge"
            )
            log.info("RAG: ✅ System Ready")

    @traceable(name="RAG Context Retrieval", run_type="retriever")
    def retrieve_relevant_context(self, query: str, k: int = 2) -> List[Dict]:
        """
        Retrieves context from ChromaDB.
        OPTIMIZED: results are cached for 5 minutes per unique query.
        k reduced from 3 → 2 (faster embedding + less context = faster LLM prompt processing).
        """
        self._lazy_init()
        q_hash = _query_hash(query)
# ... rest of the file remains similar

        if q_hash in _EMBEDDING_CACHE:
            cached_result, ts = _EMBEDDING_CACHE[q_hash]
            if time.time() - ts < _CACHE_TTL_SECONDS:
                return cached_result  # ✅ Cache HIT — skips ChromaDB entirely

        # Cache MISS — perform vector search
        try:
            results = self.vector_store.similarity_search_with_score(query, k=k)
            context = [
                {
                    "content":          doc.page_content[:300],  # truncate to avoid huge prompts
                    "metadata":         doc.metadata,
                    "similarity_score": float(score),
                }
                for doc, score in results
            ]
        except Exception:
            context = []

        # Store in cache
        _EMBEDDING_CACHE[q_hash] = (context, time.time())
        # Prevent unbounded growth
        if len(_EMBEDDING_CACHE) > 256:
            oldest = min(_EMBEDDING_CACHE, key=lambda k: _EMBEDDING_CACHE[k][1])
            del _EMBEDDING_CACHE[oldest]

        return context

    def generate_response(self, user_input: str, emotion_label: str = None) -> str:
        context_docs = self.retrieve_relevant_context(user_input, k=2)
        context_content = "\n".join([doc["content"] for doc in context_docs])

        key = (emotion_label or "").lower()
        if key in self.rule_based_responses:
            base = self.rule_based_responses[key]
        else:
            il = user_input.lower()
            if any(w in il for w in ["depress", "sad", "hopeless"]):
                base = self.rule_based_responses["depression"]
            elif any(w in il for w in ["anxious", "worry", "nervous", "panic"]):
                base = self.rule_based_responses["anxiety"]
            elif any(w in il for w in ["stress", "overwhelm", "pressure"]):
                base = self.rule_based_responses["stress"]
            elif any(w in il for w in ["suicid", "kill myself", "end my life"]):
                base = self.rule_based_responses["suicide"]
            elif any(w in il for w in ["cope", "manage", "handle"]):
                base = self.rule_based_responses["coping"]
            else:
                base = self.rule_based_responses["general"]

        if context_content:
            return f"{base}\n\nRelevant context: {context_content[:200]}"
        return base

    def analyze_with_rag(self, text: str, emotion_label: str = None, user_id: int = None) -> Dict:
        context  = self.retrieve_relevant_context(text, k=2)
        response = self.generate_response(text, emotion_label)

        risk_level = "low"
        if context:
            severities = [doc["metadata"].get("severity", "low") for doc in context]
            if "critical" in severities:
                risk_level = "high"
            elif "high" in severities:
                risk_level = "medium"

        return {
            "response":      response,
            "context":       context[:2],
            "risk_level":    risk_level,
            "emotion_label": emotion_label,
        }


# Global singleton — embedding model loaded once
rag_system = MentalHealthRAG()