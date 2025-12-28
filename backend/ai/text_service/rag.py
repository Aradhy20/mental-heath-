from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.llms import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from transformers import pipeline
import torch
from typing import List, Dict
import os

class MentalHealthRAG:
    def __init__(self, vector_db_path: str = "./chroma_db"):
        """
        Initialize the RAG system for mental health analysis
        """
        # Initialize embedding model
        self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Initialize vector store
        self.vector_store = Chroma(
            persist_directory=vector_db_path,
            embedding_function=self.embedding_function,
            collection_name="mental_health_knowledge"
        )
        
        # Create a simple prompt template for mental health analysis
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""
            You are a mental health assistant. Based on the following mental health knowledge and the user's question, 
            provide a helpful and empathetic response. Always encourage users to seek professional help when needed.
            
            Mental Health Knowledge:
            {context}
            
            User Question:
            {question}
            
            Response:
            """
        )
        
        # For this implementation, we'll use a rule-based approach instead of a full LLM
        # to keep it lightweight and avoid requiring large model downloads
        self.rule_based_responses = {
            "depression": "It sounds like you might be experiencing symptoms of depression. Depression can include persistent sadness, loss of interest in activities, and changes in sleep or appetite. Please consider speaking with a mental health professional for proper evaluation and support.",
            "anxiety": "Your description suggests anxiety symptoms. Anxiety can manifest as excessive worry, restlessness, and physical tension. Deep breathing exercises and mindfulness techniques may help, but professional guidance is recommended.",
            "stress": "You seem to be dealing with stress. Healthy coping strategies include regular exercise, adequate sleep, and connecting with supportive friends or family. If stress becomes overwhelming, professional support can be very beneficial.",
            "suicide": "I'm concerned about what you've shared. If you're having thoughts of self-harm, please reach out to a crisis helpline or emergency services immediately. You deserve support and care.",
            "coping": "It's great that you're looking for coping strategies. Regular self-care practices like exercise, proper nutrition, and mindfulness can significantly improve mental wellness.",
            "general": "Thank you for sharing your feelings. Mental health is important, and seeking support is a positive step. Consider speaking with a mental health professional for personalized guidance."
        }
    
    def retrieve_relevant_context(self, query: str, k: int = 3) -> List[Dict]:
        """
        Retrieve relevant context from the vector database
        """
        # Search for similar documents
        results = self.vector_store.similarity_search_with_score(query, k=k)
        
        # Format results
        context = []
        for doc, score in results:
            context.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "similarity_score": float(score)
            })
        
        return context
    
    def generate_response(self, user_input: str, emotion_label: str = None) -> str:
        """
        Generate a response using RAG approach
        """
        # Retrieve relevant context
        context_docs = self.retrieve_relevant_context(user_input, k=3)
        
        # Extract context content
        context_content = "\n".join([doc["content"] for doc in context_docs])
        
        # Use rule-based approach for response generation
        if emotion_label and emotion_label.lower() in self.rule_based_responses:
            base_response = self.rule_based_responses[emotion_label.lower()]
        else:
            # Determine response based on keywords in user input
            input_lower = user_input.lower()
            if any(word in input_lower for word in ["depress", "sad", "hopeless"]):
                base_response = self.rule_based_responses["depression"]
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.llms import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from transformers import pipeline
import torch
from typing import List, Dict
import os

class MentalHealthRAG:
    def __init__(self, vector_db_path: str = "./chroma_db"):
        """
        Initialize the RAG system for mental health analysis
        """
        # Initialize embedding model
        self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Initialize vector store
        self.vector_store = Chroma(
            persist_directory=vector_db_path,
            embedding_function=self.embedding_function,
            collection_name="mental_health_knowledge"
        )
        
        # Create a simple prompt template for mental health analysis
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""
            You are a mental health assistant. Based on the following mental health knowledge and the user's question, 
            provide a helpful and empathetic response. Always encourage users to seek professional help when needed.
            
            Mental Health Knowledge:
            {context}
            
            User Question:
            {question}
            
            Response:
            """
        )
        
        # For this implementation, we'll use a rule-based approach instead of a full LLM
        # to keep it lightweight and avoid requiring large model downloads
        self.rule_based_responses = {
            "depression": "It sounds like you might be experiencing symptoms of depression. Depression can include persistent sadness, loss of interest in activities, and changes in sleep or appetite. Please consider speaking with a mental health professional for proper evaluation and support.",
            "anxiety": "Your description suggests anxiety symptoms. Anxiety can manifest as excessive worry, restlessness, and physical tension. Deep breathing exercises and mindfulness techniques may help, but professional guidance is recommended.",
            "stress": "You seem to be dealing with stress. Healthy coping strategies include regular exercise, adequate sleep, and connecting with supportive friends or family. If stress becomes overwhelming, professional support can be very beneficial.",
            "suicide": "I'm concerned about what you've shared. If you're having thoughts of self-harm, please reach out to a crisis helpline or emergency services immediately. You deserve support and care.",
            "coping": "It's great that you're looking for coping strategies. Regular self-care practices like exercise, proper nutrition, and mindfulness can significantly improve mental wellness.",
            "general": "Thank you for sharing your feelings. Mental health is important, and seeking support is a positive step. Consider speaking with a mental health professional for personalized guidance."
        }
    
    def retrieve_relevant_context(self, query: str, k: int = 3) -> List[Dict]:
        """
        Retrieve relevant context from the vector database
        """
        # Search for similar documents
        results = self.vector_store.similarity_search_with_score(query, k=k)
        
        # Format results
        context = []
        for doc, score in results:
            context.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "similarity_score": float(score)
            })
        
        return context
    
    def generate_response(self, user_input: str, emotion_label: str = None) -> str:
        """
        Generate a response using RAG approach
        """
        # Retrieve relevant context
        context_docs = self.retrieve_relevant_context(user_input, k=3)
        
        # Extract context content
        context_content = "\n".join([doc["content"] for doc in context_docs])
        
        # Use rule-based approach for response generation
        if emotion_label and emotion_label.lower() in self.rule_based_responses:
            base_response = self.rule_based_responses[emotion_label.lower()]
        else:
            # Determine response based on keywords in user input
            input_lower = user_input.lower()
            if any(word in input_lower for word in ["depress", "sad", "hopeless"]):
                base_response = self.rule_based_responses["depression"]
            elif any(word in input_lower for word in ["anxious", "worry", "nervous", "panic"]):
                base_response = self.rule_based_responses["anxiety"]
            elif any(word in input_lower for word in ["stress", "overwhelm", "pressure"]):
                base_response = self.rule_based_responses["stress"]
            elif any(word in input_lower for word in ["suicid", "kill myself", "end my life"]):
                base_response = self.rule_based_responses["suicide"]
            elif any(word in input_lower for word in ["cope", "manage", "handle"]):
                base_response = self.rule_based_responses["coping"]
            else:
                base_response = self.rule_based_responses["general"]
        
        # Enhance response with context
        if context_content:
            enhanced_response = f"{base_response}\n\nBased on mental health knowledge:\n{context_content[:300]}..."
        else:
            enhanced_response = base_response
        
        return enhanced_response
    
    def analyze_with_rag(self, text: str, emotion_label: str = None, user_id: int = None) -> Dict:
        """
        Perform comprehensive analysis using RAG
        """
        # Retrieve context
        context = self.retrieve_relevant_context(text)
        
        # Retrieve user memory if user_id is provided
        if user_id:
            from .vector_db import vector_db
            user_memory = vector_db.get_user_memory(user_id, query=text, n_results=2)
            
            # Add memory to context
            for mem in user_memory:
                context.append({
                    "content": f"Previous memory: {mem['content']}",
                    "metadata": mem['metadata'],
                    "similarity_score": mem['distance']
                })
        
        # Generate response
        response = self.generate_response(text, emotion_label)
        
        # Determine risk level based on context
        risk_level = "low"
        if context:
            severities = [doc["metadata"].get("severity", "low") for doc in context]
            if "critical" in severities:
                risk_level = "high"
            elif "high" in severities:
                risk_level = "medium"
        
        return {
            "response": response,
            "context": context[:2],  # Return top 2 context items
            "risk_level": risk_level,
            "emotion_label": emotion_label
        }

# Global instance
rag_system = MentalHealthRAG()