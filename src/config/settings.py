
"""
Configuration settings for the Paper Marking System.
"""
import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

@dataclass
class DatabaseConfig:
    """Database configuration settings."""
    connection_string: str
    collection_name: str = "rag_documents"
    
    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        connection_string = os.getenv("PGVECTOR_CONNECTION_STRING")
        if not connection_string:
            raise ValueError("PGVECTOR_CONNECTION_STRING not found in environment variables")
        return cls(connection_string=connection_string)

@dataclass
class OpenAIConfig:
    """OpenAI configuration settings."""
    api_key: str
    model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    temperature: float = 0.1
    max_tokens: Optional[int] = None
    
    @classmethod
    def from_env(cls) -> 'OpenAIConfig':
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        return cls(
            api_key=api_key,
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
            temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.1")),
        )

@dataclass
class GradingConfig:
    """Grading system configuration."""
    similarity_threshold: float = 0.6
    context_relevance_threshold: float = 0.7
    chunk_size: int = 1000
    chunk_overlap: int = 100
    max_context_chunks: int = 3
    annotation_font_size: int = 10
    
    @classmethod
    def from_env(cls) -> 'GradingConfig':
        return cls(
            similarity_threshold=float(os.getenv("SIMILARITY_THRESHOLD", "0.6")),
            context_relevance_threshold=float(os.getenv("CONTEXT_RELEVANCE_THRESHOLD", "0.7")),
            chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
            chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "100")),
            max_context_chunks=int(os.getenv("MAX_CONTEXT_CHUNKS", "3")),
        )

@dataclass
class AppConfig:
    """Main application configuration."""
    database: DatabaseConfig
    openai: OpenAIConfig
    grading: GradingConfig
    debug: bool = False
    log_level: str = "INFO"
    
    @classmethod
    def from_env(cls) -> 'AppConfig':
        return cls(
            database=DatabaseConfig.from_env(),
            openai=OpenAIConfig.from_env(),
            grading=GradingConfig.from_env(),
            debug=os.getenv("DEBUG", "false").lower() == "true",
            log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
        )

# Global configuration instance
config = AppConfig.from_env()