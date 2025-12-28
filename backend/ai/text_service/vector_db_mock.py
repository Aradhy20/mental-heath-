# Mock vector database when chromadb is not available
from typing import List, Dict

class MockVectorDatabase:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Mock vector database that doesn't require chromadb"""
        print("Warning: Using mock vector database (chromadb not installed)")
        self.knowledge_base = [
            {
                "id": "mhk_005",
                "content": "Healthy coping strategies for stress include deep breathing exercises, regular physical activity, maintaining social connections, getting adequate sleep, and practicing mindfulness or meditation.",
                "metadata": {"category": "coping", "severity": "low"},
                "distance": 0.1
            },
            {
                "id": "mhk_007",
                "content": "Self-care practices for mental wellness include maintaining a regular sleep schedule, eating a balanced diet, engaging in regular exercise, practicing relaxation techniques, and seeking social support.",
                "metadata": {"category": "self-care", "severity": "low"},
                "distance": 0.2
            }
        ]
    
    def add_documents(self, documents: List[Dict]):
        """Mock method - does nothing"""
        pass
    
    def search_similar_documents(self, query: str, n_results: int = 3) -> List[Dict]:
        """Return mock similar documents"""
        return self.knowledge_base[:n_results]
    
    def get_document_by_id(self, doc_id: str) -> Dict:
        """Mock method"""
        for doc in self.knowledge_base:
            if doc["id"] == doc_id:
                return doc
        return None
    
    def add_user_memory(self, user_id: int, text: str, metadata: Dict = None):
        """Mock method - does nothing"""
        pass
    
    def get_user_memory(self, user_id: int, query: str = None, n_results: int = 5) -> List[Dict]:
        """Mock method - returns empty list"""
        return []

# Try to import real implementation, otherwise use mock
try:
    import chromadb
    from chromadb.utils import embedding_functions
    from sentence_transformers import SentenceTransformer
    from typing import List, Dict, Tuple
    import os
    import json
    from datetime import datetime
    
    class VectorDatabase:
        def __init__(self, persist_directory: str = "./chroma_db"):
            """
            Initialize the vector database for storing and retrieving mental health related text embeddings
            """
            self.client = chromadb.PersistentClient(path=persist_directory)
            self.collection_name = "mental_health_knowledge"
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
                    model_name="all-MiniLM-L6-v2"
                )
            )
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            self._initialize_knowledge_base()
        
        def _initialize_knowledge_base(self):
            """Initialize the vector database with mental health knowledge"""
            knowledge_base = [
                {
                    "id": "mhk_001",
                    "content": "Depression symptoms include persistent sadness, loss of interest in activities, fatigue, changes in appetite or sleep patterns, feelings of worthlessness or guilt, difficulty concentrating, and thoughts of death or suicide.",
                    "category": "depression",
                    "severity": "high"
                },
                {
                    "id": "mhk_002",
                    "content": "Anxiety symptoms include excessive worry, restlessness, fatigue, difficulty concentrating, irritability, muscle tension, and sleep disturbances.",
                    "category": "anxiety",
                    "severity": "medium"
                },
                {
                    "id": "mhk_005",
                    "content": "Healthy coping strategies for stress include deep breathing exercises, regular physical activity, maintaining social connections, getting adequate sleep, and practicing mindfulness or meditation.",
                    "category": "coping",
                    "severity": "low"
                },
            ]
            self.add_documents(knowledge_base)
        
        def add_documents(self, documents: List[Dict]):
            """Add documents to the vector database"""
            ids = [doc["id"] for doc in documents]
            contents = [doc["content"] for doc in documents]
            metadatas = [{"category": doc["category"], "severity": doc["severity"]} for doc in documents]
            self.collection.add(ids=ids, documents=contents, metadatas=metadatas)
        
        def search_similar_documents(self, query: str, n_results: int = 3) -> List[Dict]:
            """Search for similar documents in the vector database"""
            results = self.collection.query(query_texts=[query], n_results=n_results)
            formatted_results = []
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i] if 'distances' in results else None
                })
            return formatted_results
        
        def get_document_by_id(self, doc_id: str) -> Dict:
            """Retrieve a specific document by ID"""
            result = self.collection.get(ids=[doc_id])
            if result['ids']:
                return {
                    "id": result['ids'][0],
                    "content": result['documents'][0],
                    "metadata": result['metadatas'][0] if result['metadatas'] else None
                }
            return None
        
        def add_user_memory(self, user_id: int, text: str, metadata: Dict = None):
            """Add a user memory to the vector database"""
            if metadata is None:
                metadata = {}
            metadata["user_id"] = user_id
            metadata["type"] = "memory"
            metadata["timestamp"] = datetime.now().isoformat()
            memory_id = f"mem_{user_id}_{int(datetime.now().timestamp())}"
            self.collection.add(ids=[memory_id], documents=[text], metadatas=[metadata])
        
        def get_user_memory(self, user_id: int, query: str = None, n_results: int = 5) -> List[Dict]:
            """Retrieve user memories"""
            where_filter = {"user_id": user_id}
            if query:
                results = self.collection.query(query_texts=[query], n_results=n_results, where=where_filter)
                formatted_results = []
                if results['ids']:
                    for i in range(len(results['ids'][0])):
                        formatted_results.append({
                            "id": results['ids'][0][i],
                            "content": results['documents'][0][i],
                            "metadata": results['metadatas'][0][i],
                            "distance": results['distances'][0][i] if 'distances' in results else None
                        })
                return formatted_results
            return []
    
    vector_db = VectorDatabase()
    print("Loaded real VectorDatabase with chromadb")
except ImportError as e:
    print(f"Chromadb not available: {e}. Using mock vector database.")
    vector_db = MockVectorDatabase()
