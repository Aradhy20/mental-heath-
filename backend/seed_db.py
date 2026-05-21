import asyncio
import sys
import os
import datetime as dt
import uuid

# Add the current directory to path so we can import database and models
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, AsyncSessionLocal
from models import DBUser, MoodLog
from sqlalchemy import select
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

async def seed_db():
    print("[*] Re-seeding database with consistent user IDs...")
    async with AsyncSessionLocal() as session:
        # Create tanishk2001 user if not exists
        res_tanishk = await session.execute(select(DBUser).where(DBUser.email == "jainaradhy01@gmail.com"))
        tanishk_user = res_tanishk.scalars().first()
        if not tanishk_user:
            tanishk_user = DBUser(
                user_id="tanishk2001",
                username="tanishk2001",
                email="jainaradhy01@gmail.com",
                password_hash=get_password_hash("password123"),
                full_name="Tanishk Jain",
                subscription_tier="premium",
                is_active=True
            )
            session.add(tanishk_user)
            print(f"[+] Created user: {tanishk_user.username} (Premium)")
        else:
            print("[.] User jainaradhy01@gmail.com already exists.")

        # Create demo_user if not exists
        res_demo = await session.execute(select(DBUser).where(DBUser.email == "demo@mindfulai.com"))
        demo_user = res_demo.scalars().first()
        if not demo_user:
            demo_user = DBUser(
                user_id="demo_user",
                username="demo_user",
                email="demo@mindfulai.com",
                password_hash=get_password_hash("mindful_demo_2026"),
                full_name="Demo User",
                subscription_tier="premium",
                is_active=True
            )
            session.add(demo_user)
            print(f"[+] Created user: {demo_user.username} (Premium Demo)")
        else:
            # Update password hash just in case it was modified
            demo_user.password_hash = get_password_hash("mindful_demo_2026")
            session.add(demo_user)
            print("[.] Updated demo_user password to mindful_demo_2026.")

        # Add mood logs for both users if not already populated
        for uid in ["tanishk2001", "demo_user"]:
            res_moods = await session.execute(select(MoodLog).where(MoodLog.user_id == uid))
            existing_logs = res_moods.scalars().all()
            if len(existing_logs) < 10:
                for i in range(15):
                    log_date = dt.datetime.utcnow() - dt.timedelta(days=i)
                    score = float(4 if i % 2 == 0 else 5)
                    mood_log = MoodLog(
                        id=str(uuid.uuid4())[:8],
                        user_id=uid,
                        score=score,
                        feelings="Healthy" if i % 2 == 0 else "Balanced",
                        activities="Meditation" if i % 2 == 0 else "Exercise",
                        note=f"Automatic entry for trend testing.",
                        sleep_hours=float(7 + (i % 2)),
                        energy_level=int(8 - (i % 2)),
                        created_at=log_date
                    )
                    session.add(mood_log)
                print(f"[+] Seeded 15 mood logs for {uid}")
            else:
                print(f"[.] Mood logs for {uid} already exist.")
        
        await session.commit()

    print("[✅] Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
