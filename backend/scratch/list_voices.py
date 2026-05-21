import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

# Load env variables
load_dotenv("/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project/backend/.env")

api_key = os.getenv("ELEVENLABS_API_KEY")
print(f"API Key: {api_key[:10]}...")

try:
    client = ElevenLabs(api_key=api_key)
    voices = client.voices.get_all()
    print("Available voices:")
    found = False
    for v in voices.voices:
        print(f"- Name: {v.name} | ID: {v.voice_id} | Category: {v.category}")
        if v.voice_id == "jUjRbhZWoMK4aDciW36V":
            print(f"  --> FOUND voice {v.name}!")
            found = True
    if not found:
        print("  --> Voice ID jUjRbhZWoMK4aDciW36V NOT found in the account voices list!")
except Exception as e:
    print(f"Error fetching voices: {e}")
