from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import certifi
from dotenv import load_dotenv

# Load Environment
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
try:
    load_dotenv(dotenv_path=env_path)
except Exception as e:
    print(f"Warning: database.py load_dotenv failed: {e}")

# --- SQL Configuration (MySQL — High-performance secure data layer) ---
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+aiomysql://root:12345678@127.0.0.1:3306/mindful_ai")

engine = create_async_engine(
    MYSQL_URL, 
    echo=False, 
    pool_pre_ping=True,
    pool_recycle=3600
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
