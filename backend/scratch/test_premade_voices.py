import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

# Load env
load_dotenv("/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project/backend/.env")
api_key = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=api_key)

test_voices = {
    "Sarah": "EXAVITQu4vr4xnSDxMaL",
    "Matilda": "XrExE9yKIg1WjnnlVkGX",
    "Jessica": "cgSgspJ2msm6clMCkdW9",
    "Bella": "hpp4J3VqNfWAUOO0d1Us",
    "Lily": "pFZP5JQG7iQjIQuC4Bku",
    "Alice": "Xb7hH8MSUJpSbSDYk0k2"
}

for name, voice_id in test_voices.items():
    print(f"Testing {name} ({voice_id})...")
    try:
        audio_gen = client.text_to_speech.convert(
            voice_id=voice_id,
            text="नमस्ते, मैं आपकी वॉइस थेरेपिस्ट हूँ। I am here to help you feel better.",
            model_id="eleven_multilingual_v2"
        )
        audio_data = b"".join(list(audio_gen))
        out_path = f"/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project/backend/scratch/test_{name}.mp3"
        with open(out_path, "wb") as f:
            f.write(audio_data)
        print(f"  --> SUCCESS: Saved {len(audio_data)} bytes to {out_path}")
    except Exception as e:
        print(f"  --> FAILED: {e}")
