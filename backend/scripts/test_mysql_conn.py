import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text

async def test_conn():
    mysql_url = "mysql+aiomysql://root:12345678@127.0.0.1:3306/mindful_ai"
    print(f"Connecting to: {mysql_url}")
    engine = create_async_engine(mysql_url, echo=True)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            print(f"✅ Connection successful! Result of SELECT 1: {val}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
