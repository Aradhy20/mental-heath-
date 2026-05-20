import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text

async def verify_data():
    mysql_url = "mysql+aiomysql://root:12345678@127.0.0.1:3306/mindful_ai"
    engine = create_async_engine(mysql_url)
    try:
        async with engine.connect() as conn:
            # Check users
            users_res = await conn.execute(text("SELECT user_id, username, email, subscription_tier FROM users"))
            users = users_res.all()
            print(f"👥 Users in DB ({len(users)}):")
            for u in users:
                print(f" - {u.username} ({u.email}), Tier: {u.subscription_tier}")
                
            # Check mood logs count
            logs_res = await conn.execute(text("SELECT COUNT(*) FROM mood_logs"))
            count = logs_res.scalar()
            print(f"📊 Mood logs count: {count}")
    except Exception as e:
        print(f"❌ Error verifying data: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_data())
