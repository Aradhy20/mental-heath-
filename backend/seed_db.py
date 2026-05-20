import asyncio
import sys
import os
import datetime as dt
import uuid

# Add the current directory to path so we can import database and models
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, AsyncSessionLocal
from models import DBUser, MoodLog
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

async def seed_db():
    print("[*] Re-seeding database with consistent user IDs...")
    async with AsyncSessionLocal() as session:
        # 1. Create a test premium user
        # We use 'tanishk2001' as the ID itself to ensure consistency in this demo
        test_user = DBUser(
            user_id="tanishk2001",
            username="tanishk2001",
            email="jainaradhy01@gmail.com",
            password_hash=get_password_hash("password123"),
            full_name="Tanishk Jain",
            subscription_tier="premium",
            is_active=True
        )
        
        session.add(test_user)
        print(f"[+] Created user: {test_user.username} (Premium)")

        # 2. Add mood logs
        for i in range(15):
            log_date = dt.datetime.utcnow() - dt.timedelta(days=i)
            score = float(4 if i % 2 == 0 else 5)
            mood_log = MoodLog(
                id=str(uuid.uuid4())[:8],
                user_id="tanishk2001", # Matches test_user.user_id
                score=score,
                feelings="Healthy" if i % 2 == 0 else "Balanced",
                activities="Meditation" if i % 2 == 0 else "Exercise",
                note=f"Automatic entry for trend testing.",
                sleep_hours=float(7 + (i % 2)),
                energy_level=int(8 - (i % 2)),
                created_at=log_date
            )
            session.add(mood_log)
        
        await session.commit()
        print(f"[+] Seeded 15 mood logs for tanishk2001")

    print("[✅] Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
