import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os
from dotenv import load_dotenv

async def check_mysql():
    load_dotenv()
    mysql_url = os.getenv("MYSQL_URL", "mysql+aiomysql://root:12345678@127.0.0.1:3306/mindful_ai")
    print(f"Attempting to connect to: {mysql_url}")
    
    engine = create_async_engine(mysql_url)
    try:
        async with engine.connect() as conn:
            print("✅ MySQL Connection Successful!")
            return True
    except Exception as e:
        print(f"❌ MySQL Connection Failed: {e}")
        return False
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_mysql())
