import os
from elevenlabs.client import ElevenLabs

api_key = "f11fb8720420eaa141e2cc35ea5ce826a367842895c48b1eed70d954795bc87c"
voice_id = "EXAVITQu4vr4xnSDxMaL" # Sarah (premade)

client = ElevenLabs(api_key=api_key)
try:
    print("Testing new API key with Sarah premade voice ID...")
    audio_gen = client.text_to_speech.convert(
        voice_id=voice_id,
        text="नमस्ते, मैं आपकी वॉइस थेरेपिस्ट हूँ। I am here to help you feel better.",
        model_id="eleven_multilingual_v2"
    )
    audio_data = b"".join(list(audio_gen))
    print(f"SUCCESS! Generated {len(audio_data)} bytes using new API key and premade voice Sarah!")
except Exception as e:
    print("FAILED:", e)
