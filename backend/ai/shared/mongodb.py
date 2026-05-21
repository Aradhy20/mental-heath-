import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Configuration
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "mental_health_db")

# ── Graceful MongoDB Connection ───────────────────────────────────────────────
# MongoDB Atlas requires TLS 1.3. macOS LibreSSL 3.x does not support TLS 1.3
# so we initialise the client lazily and mark mongo as unavailable if it fails.
# The backend continues running perfectly using MySQL as the primary data store.
# MongoDB is used only for optional session audit logs.

_mongo_available = False
client = None
database = None

try:
    client = AsyncIOMotorClient(
        MONGO_DETAILS,
        maxPoolSize=10,
        minPoolSize=1,
        serverSelectionTimeoutMS=3000,
        connectTimeoutMS=5000,
        tlsCAFile=certifi.where(),
    )
    database = client[DB_NAME]
    _mongo_available = True
    logger.info("MongoDB client initialised (lazy — connection verified on first use)")
except Exception as e:
    logger.warning(f"⚠️  MongoDB client init failed (will run in MySQL-only mode): {e}")


class _NullCollection:
    """Drop-in stub for MongoDB collections when Atlas is unreachable.
    All writes are silently discarded; all reads return empty results."""
    async def insert_one(self, *a, **kw): return None
    async def find_one(self, *a, **kw): return None
    async def find(self, *a, **kw): return _NullCursor()
    async def update_one(self, *a, **kw): return None
    async def delete_one(self, *a, **kw): return None
    async def create_index(self, *a, **kw): return None
    async def count_documents(self, *a, **kw): return 0

class _NullCursor:
    def sort(self, *a, **kw): return self
    def limit(self, *a, **kw): return self
    def skip(self, *a, **kw): return self
    def __aiter__(self): return self
    async def __anext__(self): raise StopAsyncIteration
    async def to_list(self, *a, **kw): return []


def _col(name: str):
    """Return real collection if Mongo is available, else a null stub."""
    if database is not None:
        return database.get_collection(name)
    return _NullCollection()


# Collections — real or null-stub depending on connectivity
user_collection             = _col("users")
chat_collection             = _col("chat_logs")
face_collection             = _col("face_analysis")
text_collection             = _col("text_analysis")
voice_collection            = _col("voice_analysis")
mood_collection             = _col("mood_tracking")
journal_collection          = _col("journal_entries")
meditation_collection       = _col("meditation_sessions")
emotion_history_collection  = _col("emotion_history")
reports_collection          = _col("reports")


# Helper functions
def fix_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id string"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def fix_ids(docs: list) -> list:
    """Convert MongoDB _id to id string for list of documents"""
    return [fix_id(doc) for doc in docs if doc]

async def check_connection() -> bool:
    """Check MongoDB connection health — returns False gracefully if unavailable."""
    if client is None:
        logger.warning("MongoDB not initialised — running in MySQL-only mode.")
        return False
    try:
        await client.admin.command('ping')
        logger.info("✅ MongoDB Atlas connection healthy")
        return True
    except Exception as e:
        logger.warning(f"⚠️  MongoDB ping failed (MySQL-only mode active): {e}")
        return False

async def create_indexes():
    """Create indexes for better query performance — no-op when Atlas is unreachable."""
    if database is None:
        logger.info("Skipping MongoDB index creation — running in MySQL-only mode.")
        return False
    try:
        await user_collection.create_index("username", unique=True)
        await user_collection.create_index("email", unique=True)
        await text_collection.create_index([("user_id", 1), ("created_at", -1)])
        await voice_collection.create_index([("user_id", 1), ("created_at", -1)])
        await face_collection.create_index([("user_id", 1), ("created_at", -1)])
        await mood_collection.create_index([("user_id", 1), ("timestamp", -1)])
        await journal_collection.create_index([("user_id", 1), ("created_at", -1)])
        await chat_collection.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("✅ MongoDB indexes created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False

# Export collections and utilities
__all__ = [
    'database', 'client', '_mongo_available',
    'user_collection', 'chat_collection', 'face_collection',
    'text_collection', 'voice_collection', 'mood_collection',
    'journal_collection', 'meditation_collection', 'emotion_history_collection',
    'reports_collection',
    'fix_id', 'fix_ids', 'check_connection', 'create_indexes'
]
