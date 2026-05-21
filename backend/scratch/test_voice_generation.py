import os
import base64
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings

# Load env
load_dotenv("/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project/backend/.env")

api_key = os.getenv("ELEVENLABS_API_KEY")
voice_id = os.getenv("ELEVENLABS_VOICE_ID")
print("API Key:", api_key[:10] if api_key else "None")
print("Voice ID:", voice_id)

client = ElevenLabs(api_key=api_key)
try:
    print("Generating voice with ElevenLabs...")
    audio_gen = client.text_to_speech.convert(
        voice_id=voice_id,
        text="Hello! This is Anika. I am your voice therapist, speaking in a warm and gentle female voice to communicate in Hindi and English.",
        model_id="eleven_multilingual_v2"
    )
    audio_data = b"".join(list(audio_gen))
    out_path = "/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project/backend/scratch/test_anika.mp3"
    with open(out_path, "wb") as f:
        f.write(audio_data)
    print("SUCCESS: Wrote audio file to", out_path)
    print("Audio size:", len(audio_data), "bytes")
except Exception as e:
    print("Error:", e)
