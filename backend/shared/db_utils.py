"""
Database Optimization Utilities
Connection pooling, query optimization, and performance helpers
"""

from sqlalchemy import create_engine, event, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import time
import logging

logger = logging.getLogger(__name__)

def create_optimized_engine(database_url: str, echo: bool = False):
    """
    Create database engine with optimized connection pooling
    
    Args:
        database_url: Database connection string
        echo: Enable SQL query logging
    
    Returns:
        SQLAlchemy Engine with connection pooling
    """
    engine = create_engine(
        database_url,
        echo=echo,
        poolclass=QueuePool,
        pool_size=10,          # Number of connections to maintain
        max_overflow=20,       # Allow up to 20 additional connections
        pool_timeout=30,       # Timeout for getting connection from pool
        pool_recycle=3600,     # Recycle connections after 1 hour
        pool_pre_ping=True,    # Test connections before using
    )
    
    # Add query performance logging
    @event.listens_for(Engine, "before_cursor_execute")
    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        conn.info.setdefault('query_start_time', []).append(time.time())
    
    @event.listens_for(Engine, "after_cursor_execute")
    def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        total_time = time.time() - conn.info['query_start_time'].pop(-1)
        if total_time > 0.1:  # Log slow queries (>100ms)
            logger.warning(f"Slow query ({total_time*1000:.2f}ms): {statement[:100]}...")
    
    return engine

@contextmanager
def db_session_context(session_factory: sessionmaker):
    """
    Context manager for database sessions with automatic cleanup
    
    Usage:
        with db_session_context(SessionLocal) as db:
            # use db
            pass
    """
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def bulk_insert_optimized(session: Session, model_class, data_list: list):
    """
    Optimized bulk insert for large datasets
    
    Args:
        session: Database session
        model_class: SQLAlchemy model class
        data_list: List of dictionaries with data to insert
    
    Returns:
        Number of records inserted
    """
    if not data_list:
        return 0
    
    session.bulk_insert_mappings(model_class, data_list)
    session.commit()
    return len(data_list)

def check_db_health(engine: Engine) -> dict:
    """
    Check database connection health
    
    Returns:
        Dictionary with health status
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        
        pool = engine.pool
        return {
            "status": "healthy",
            "pool_size": pool.size(),
            "checked_in_connections": pool.checkedin(),
            "checked_out_connections": pool.checkedout(),
            "overflow": pool.overflow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Example usage
if __name__ == "__main__":
    # Create optimized engine
    engine = create_optimized_engine("sqlite:///test.db")
    
    # Check health
    health = check_db_health(engine)
    print("Database Health:", health)
