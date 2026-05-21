"""
MindfulAI Voice Interface
Handles STT and TTS for audio-based interactions.
"""

from typing import Dict, Any
import io
import base64
import tempfile
import os
from elevenlabs.client import ElevenLabs
from elevenlabs import Voice, VoiceSettings
from core.logging import log

# Free + Offline Dependencies
try:
    from faster_whisper import WhisperModel
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False

try:
    import pyttsx3
    HAS_PYTTSX3 = True
except ImportError:
    HAS_PYTTSX3 = False

try:
    from gtts import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False

class VoiceInterface:
    def __init__(self):
        self.whisper_model = None
        self.tts_engine = None
        self.eleven_client = None
        self.eleven_api_key = os.getenv("ELEVENLABS_API_KEY")
        
        if self.eleven_api_key:
            try:
                self.eleven_client = ElevenLabs(api_key=self.eleven_api_key)
                log.info("ElevenLabs Client initialized")
            except Exception as e:
                log.error(f"Failed to init ElevenLabs: {e}")

        # Eager load models to optimize response times
        self._lazy_init_whisper()
        self._lazy_init_tts()
        log.info("VoiceInterface initialized and eager-loaded.")

    def _lazy_init_whisper(self):
        if self.whisper_model is None and HAS_WHISPER:
            log.info("VoiceInterface: Loading Whisper tiny model...")
            from faster_whisper import WhisperModel
            self.whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
            log.info("VoiceInterface: ✅ Whisper Ready")

    def _lazy_init_tts(self):
        global HAS_PYTTSX3
        if self.tts_engine is None and HAS_PYTTSX3:
            log.info("VoiceInterface: Initializing pyttsx3...")
            try:
                import pyttsx3
                self.tts_engine = pyttsx3.init()
                self.tts_engine.setProperty('rate', 160)
                log.info("VoiceInterface: ✅ TTS Ready")
            except (Exception, NameError) as e:
                log.warning(f"VoiceInterface: pyttsx3 init failed, disabling offline pyttsx3 fallback: {e}")
                HAS_PYTTSX3 = False


    async def speech_to_text(self, audio_bytes: bytes) -> str:
        self._lazy_init_whisper()
        """
        Converts clinical audio bytes to text using FasterWhisper (Offline STT).
        """
        if not HAS_WHISPER:
            log.warning("FasterWhisper not installed. Falling back to generic notification.")
            return "(Voice transcription unavailable offline)"
        
        try:
            import numpy as np
            import io
            
            data = None
            
            # Try PyAV first for modern browser format compatibility (webm, ogg, etc.)
            try:
                import av
                container = av.open(io.BytesIO(audio_bytes))
                stream = container.streams.audio[0]
                # Whisper expects mono float32 audio at 16000Hz
                resampler = av.AudioResampler(format='flt', layout='mono', rate=16000)
                
                all_frames = []
                for frame in container.decode(stream):
                    resampled_frames = resampler.resample(frame)
                    for rf in resampled_frames:
                        all_frames.append(rf.to_ndarray()[0])
                        
                resampled_frames = resampler.resample(None)
                for rf in resampled_frames:
                    all_frames.append(rf.to_ndarray()[0])
                    
                if all_frames:
                    data = np.concatenate(all_frames)
            except Exception as av_err:
                log.warning(f"PyAV STT decode failed: {av_err}. Falling back to soundfile...")

            # Fallback to soundfile + tempfile if PyAV decoding fails
            if data is None:
                import soundfile as sf
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                    tmp.write(audio_bytes)
                    tmp_path = tmp.name
                try:
                    data, samplerate = sf.read(tmp_path)
                    if len(data.shape) > 1:
                        data = np.mean(data, axis=1)
                    # Resample to 16000 if soundfile read wasn't 16000
                    if samplerate != 16000:
                        import librosa
                        data = librosa.resample(data, orig_sr=samplerate, target_sr=16000)
                finally:
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)

            if data is None or len(data) == 0:
                raise ValueError("Empty or un-decodable audio input.")

            # Optimized beam_size=1 for faster greedy decoding response time
            segments, info = self.whisper_model.transcribe(data, beam_size=1)
            transcript = " ".join([segment.text for segment in segments])
            return transcript.strip()
            
        except Exception as e:
            log.error(f"FasterWhisper STT Error: {e}")
            return "(System busy. Transcription failed.)"


    async def text_to_speech(self, text: str) -> str:
        self._lazy_init_tts()
        """
        Converts response text back to audio (base64) prioritizing ElevenLabs (Premium), 
        falling back to offline pyttsx3 or gTTS.
        """
        # 1. Primary: ElevenLabs (High Fidelity)
        if self.eleven_client:
            try:
                voice_id = os.getenv("ELEVENLABS_VOICE_ID") or os.getenv("ELEVEN_VOICE_ID") or "Rachel"
                try:
                    audio_gen = self.eleven_client.text_to_speech.convert(
                        voice_id=voice_id,
                        text=text,
                        model_id="eleven_multilingual_v2"
                    )
                    audio_data = b"".join(list(audio_gen))
                except Exception as primary_err:
                    log.error(f"ElevenLabs TTS Primary Voice failed: {primary_err}")
                    fallback_voice_id = "EXAVITQu4vr4xnSDxMaL" # Sarah (premade)
                    if voice_id == fallback_voice_id:
                        raise primary_err
                    log.info(f"Retrying ElevenLabs TTS with premade female fallback: Sarah ({fallback_voice_id})")
                    audio_gen = self.eleven_client.text_to_speech.convert(
                        voice_id=fallback_voice_id,
                        text=text,
                        model_id="eleven_multilingual_v2"
                    )
                    audio_data = b"".join(list(audio_gen))
                
                b64_str = base64.b64encode(audio_data).decode()
                return f"data:audio/mpeg;base64,{b64_str}"
            except Exception as e:
                log.error(f"ElevenLabs TTS Error: {e}")

        # 2. Secondary Offline TTS via pyttsx3
        if HAS_PYTTSX3:
            try:
                import soundfile as sf
                with tempfile.NamedTemporaryFile(delete=False, suffix=".aiff") as tmp_aiff:
                    aiff_path = tmp_aiff.name
                
                self.tts_engine.save_to_file(text, aiff_path)
                self.tts_engine.runAndWait()
                
                # Convert AIFF to WAV for HTML5 browser compatibility
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
                    wav_path = tmp_wav.name
                
                data, samplerate = sf.read(aiff_path)
                sf.write(wav_path, data, samplerate, format='WAV')
                
                with open(wav_path, "rb") as f:
                    audio_data = f.read()
                
                # Cleanup
                if os.path.exists(aiff_path):
                    os.remove(aiff_path)
                if os.path.exists(wav_path):
                    os.remove(wav_path)
                
                b64_str = base64.b64encode(audio_data).decode()
                return f"data:audio/wav;base64,{b64_str}"
            except Exception as e:
                log.error(f"pyttsx3 Offline TTS Error: {e}")
        
        # 2. Fallback to gTTS (Standard Quality / Requires internet but free)
        if HAS_GTTS:
            try:
                tts = gTTS(text=text, lang='en')
                fp = io.BytesIO()
                tts.write_to_fp(fp)
                fp.seek(0)
                
                b64_str = base64.b64encode(fp.read()).decode()
                return f"data:audio/mp3;base64,{b64_str}"
            except Exception as e:
                log.error(f"gTTS Error: {e}")
        
    async def text_to_speech_advanced(self, text: str, emotion: str) -> str:
        self._lazy_init_tts()
        """
        Advanced TTS that modulates voice settings dynamically depending on the client's emotional state,
        including stabilizing, calming, and pacing with pauses.
        """
        if self.eleven_client:
            try:
                # stability: medium-high, clarity: high, style: conversational
                if emotion == "sad":
                    # Slow, warm, very supportive
                    stability_val = 0.85
                    clarity_val = 0.90
                    style_val = 0.20
                    # Add therapeutic pauses for sadness
                    modified_text = "... " + text.replace(". ", "... ")
                elif emotion == "anxious":
                    # Grounding, highly stable
                    stability_val = 0.90
                    clarity_val = 0.85
                    style_val = 0.10
                    # Add breathing/calming pauses
                    modified_text = text.replace(". ", "... ")
                elif emotion == "angry":
                    # Steady, controlled, lower style variation
                    stability_val = 0.95
                    clarity_val = 0.80
                    style_val = 0.05
                    modified_text = text
                else: # neutral / happy
                    # Warm, conversational, slightly expressive
                    stability_val = 0.75
                    clarity_val = 0.85
                    style_val = 0.25
                    modified_text = text

                voice_settings = VoiceSettings(
                    stability=stability_val,
                    similarity_boost=clarity_val,
                    style=style_val,
                    use_speaker_boost=True
                )

                voice_id = os.getenv("ELEVENLABS_VOICE_ID") or os.getenv("ELEVEN_VOICE_ID") or "Rachel"
                
                try:
                    audio_gen = self.eleven_client.text_to_speech.convert(
                        voice_id=voice_id,
                        text=modified_text,
                        voice_settings=voice_settings,
                        model_id="eleven_multilingual_v2"
                    )
                    audio_data = b"".join(list(audio_gen))
                except Exception as primary_err:
                    log.error(f"ElevenLabs Advanced TTS Primary voice failed: {primary_err}. Retrying with premade female fallback: Sarah...")
                    fallback_voice_id = "EXAVITQu4vr4xnSDxMaL"
                    if voice_id == fallback_voice_id:
                        raise primary_err
                    audio_gen = self.eleven_client.text_to_speech.convert(
                        voice_id=fallback_voice_id,
                        text=modified_text,
                        voice_settings=voice_settings,
                        model_id="eleven_multilingual_v2"
                    )
                    audio_data = b"".join(list(audio_gen))
                
                b64_str = base64.b64encode(audio_data).decode()
                return f"data:audio/mpeg;base64,{b64_str}"
            except Exception as e:
                log.error(f"ElevenLabs Advanced TTS Error: {e}")

        # Fallback to standard ElevenLabs or offline TTS
        return await self.text_to_speech(text)

voice_interface = VoiceInterface()
