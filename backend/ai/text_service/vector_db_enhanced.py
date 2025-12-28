"""
Enhanced Vector Database with User-Specific Memory
Supports conversational memory and session continuity
"""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from datetime import datetime
import json

class EnhancedVectorDatabase:
    def __init__(self, persist_directory="./chroma_db"):
        """
        Initialize ChromaDB with user-specific collections
        """
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=persist_directory
        ))
        
        # Main knowledge collection
        try:
            self.knowledge_collection = self.client.get_collection("mental_health_knowledge")
        except:
            self.knowledge_collection = self.client.create_collection(
                name="mental_health_knowledge",
                metadata={"description": "General mental health knowledge base"}
            )
        
        # User memory collections (created on-demand)
        self.user_collections = {}
    
    def get_user_collection(self, user_id: int):
        """
        Get or create user-specific memory collection
        """
        collection_name = f"user_{user_id}_memory"
        
        if collection_name not in self.user_collections:
            try:
                collection = self.client.get_collection(collection_name)
            except:
                collection = self.client.create_collection(
                    name=collection_name,
                    metadata={
                        "description": f"Conversational memory for user {user_id}",
                        "user_id": str(user_id)
                    }
                )
            self.user_collections[collection_name] = collection
        
        return self.user_collections[collection_name]
    
    def add_user_memory(self, user_id: int, text: str, emotion: str, metadata: Optional[Dict] = None):
        """
        Add a conversation to user's memory
        """
        collection = self.get_user_collection(user_id)
        
        memory_id = f"mem_{user_id}_{datetime.now().timestamp()}"
        
        memory_metadata = {
            "user_id": str(user_id),
            "emotion": emotion,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {})
        }
        
        collection.add(
            documents=[text],
            metadatas=[memory_metadata],
            ids=[memory_id]
        )
        
        return memory_id
    
    def get_user_context(self, user_id: int, current_text: str, n_results: int = 5) -> List[Dict]:
        """
        Retrieve relevant context from user's memory
        """
        collection = self.get_user_collection(user_id)
        
        try:
            results = collection.query(
                query_texts=[current_text],
                n_results=n_results
            )
            
            contexts = []
            if results['documents'] and len(results['documents']) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    contexts.append({
                        'text': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0
                    })
            
            return contexts
        except:
            return []
    
    def get_session_continuity(self, user_id: int, session_limit: int = 10) -> List[Dict]:
        """
        Get recent session history for continuity
        """
        collection = self.get_user_collection(user_id)
        
        try:
            # Get all memories and sort by timestamp
            all_memories = collection.get()
            
            if not all_memories['documents']:
                return []
            
            # Combine and sort by timestamp
            memories = []
            for i, doc in enumerate(all_memories['documents']):
                metadata = all_memories['metadatas'][i] if all_memories['metadatas'] else {}
                memories.append({
                    'text': doc,
                    'metadata': metadata,
                    'timestamp': metadata.get('timestamp', '')
                })
            
            # Sort by timestamp descending
            memories.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return memories[:session_limit]
        except:
            return []
    
    def search_knowledge(self, query: str, n_results: int = 3) -> List[Dict]:
        """
        Search general knowledge base
        """
        try:
            results = self.knowledge_collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            knowledge = []
            if results['documents'] and len(results['documents']) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    knowledge.append({
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'relevance': 1 - (results['distances'][0][i] if results['distances'] else 0)
                    })
            
            return knowledge
        except:
            return []
    
    def add_knowledge(self, content: str, category: str, metadata: Optional[Dict] = None):
        """
        Add to general knowledge base
        """
        knowledge_id = f"knowledge_{datetime.now().timestamp()}"
        
        knowledge_metadata = {
            "category": category,
            "added_at": datetime.now().isoformat(),
            **(metadata or {})
        }
        
        self.knowledge_collection.add(
            documents=[content],
            metadatas=[knowledge_metadata],
            ids=[knowledge_id]
        )
        
        return knowledge_id
    
    def get_user_memory_stats(self, user_id: int) -> Dict:
        """
        Get statistics about user's memory
        """
        collection = self.get_user_collection(user_id)
        
        try:
            all_memories = collection.get()
            total_memories = len(all_memories['documents']) if all_memories['documents'] else 0
            
            # Count emotions
            emotion_counts = {}
            if all_memories['metadatas']:
                for metadata in all_memories['metadatas']:
                    emotion = metadata.get('emotion', 'unknown')
                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
            return {
                'total_memories': total_memories,
                'emotion_distribution': emotion_counts,
                'collection_name': collection.name
            }
        except:
            return {'total_memories': 0, 'emotion_distribution': {}}

# Global instance
vector_db = EnhancedVectorDatabase()
