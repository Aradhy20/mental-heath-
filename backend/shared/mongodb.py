import os
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

# Connection with pooling and timeout configuration
client = AsyncIOMotorClient(
    MONGO_DETAILS,
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
)

database = client[DB_NAME]

# Collections
user_collection = database.get_collection("users")
chat_collection = database.get_collection("chat_logs")
face_collection = database.get_collection("face_analysis")
text_collection = database.get_collection("text_analysis")
voice_collection = database.get_collection("voice_analysis")
mood_collection = database.get_collection("mood_tracking")
journal_collection = database.get_collection("journal_entries")
meditation_collection = database.get_collection("meditation_sessions")
emotion_history_collection = database.get_collection("emotion_history")
reports_collection = database.get_collection("reports")

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
    """Check MongoDB connection health"""
    try:
        await client.admin.command('ping')
        logger.info("MongoDB connection successful")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False

async def create_indexes():
    """Create indexes for better query performance"""
    try:
        # User indexes
        await user_collection.create_index("username", unique=True)
        await user_collection.create_index("email", unique=True)
        
        # Analysis indexes
        await text_collection.create_index([("user_id", 1), ("created_at", -1)])
        await voice_collection.create_index([("user_id", 1), ("created_at", -1)])
        await face_collection.create_index([("user_id", 1), ("created_at", -1)])
        
        # Mood tracking indexes
        await mood_collection.create_index([("user_id", 1), ("timestamp", -1)])
        
        # Journal indexes
        await journal_collection.create_index([("user_id", 1), ("created_at", -1)])
        
        # Chat logs indexes
        await chat_collection.create_index([("user_id", 1), ("created_at", -1)])
        
        logger.info("Database indexes created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False

# Export collections and utilities
__all__ = [
    'database', 'client',
    'user_collection', 'chat_collection', 'face_collection', 
    'text_collection', 'voice_collection', 'mood_collection',
    'journal_collection', 'meditation_collection', 'emotion_history_collection',
    'reports_collection',
    'fix_id', 'fix_ids', 'check_connection', 'create_indexes'
]
