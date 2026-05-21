import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def check_mongo():
    load_dotenv()
    mongo_url = os.getenv("MONGO_DETAILS")
    if not mongo_url:
        print("❌ MONGO_DETAILS not found in .env")
        return
        
    print(f"Attempting to connect to MongoDB Atlas...")
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    try:
        await client.admin.command('ping')
        print("✅ MongoDB Connection Successful!")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_mongo())
