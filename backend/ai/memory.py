from typing import List, Dict
import datetime
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import DBChatHistory
from core.logging import log

class MemorySystem:
    def __init__(self):
        log.info("MemorySystem Initialized (SQL Persistent)")

    async def get_history(self, user_id: str, db: AsyncSession) -> List[Dict]:
        """
        Retrieves the last 10 messages for context from the database.
        """
        if user_id == "guest":
            return []
            
        try:
            query = select(DBChatHistory).where(DBChatHistory.user_id == user_id).order_by(DBChatHistory.created_at.desc()).limit(5)
            result = await db.execute(query)
            rows = result.scalars().all()
            # Reverse to get chronological order for the LLM
            return [{"role": r.role, "content": r.content, "timestamp": r.created_at.isoformat()} for r in reversed(rows)]
        except Exception as e:
            log.error(f"MemorySystem: Error fetching history: {e}")
            return []

    async def add_entry(self, user_id: str, role: str, content: str, db: AsyncSession):
        """
        Adds a message to the user's conversation history in the database.
        """
        if user_id == "guest":
            return
            
        try:
            new_entry = DBChatHistory(
                id=str(uuid.uuid4()),
                user_id=user_id,
                role=role,
                content=content[:2000] # Cap content length
            )
            db.add(new_entry)
            await db.commit()
        except Exception as e:
            log.error(f"MemorySystem: Error adding entry: {e}")

    async def clear(self, user_id: str, db: AsyncSession):
        """Removes chat history for a user."""
        try:
            from sqlalchemy import delete
            query = delete(DBChatHistory).where(DBChatHistory.user_id == user_id)
            await db.execute(query)
            await db.commit()
        except Exception as e:
            log.error(f"MemorySystem: Error clearing history: {e}")

memory = MemorySystem()
