"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Video, Type, Play, Square, Loader2, BrainCircuit, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function MultimodalInputPage() {
  const [mode, setMode] = useState<"standard" | "assistant">("standard");
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Behavioral metrics
  const typingStartTime = useRef<number | null>(null);
  const charCount = useRef(0);
  const lastActiveTime = useRef<number>(Date.now());
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [inactivitySec, setInactivitySec] = useState(0);

  // --- Voice Assistant States & Refs ---
  const [assistantState, setAssistantState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [voiceMode, setVoiceMode] = useState<"partner" | "clinical" | "girlfriend" | "wife">("partner");

  const themeMap = {
    partner: {
      gradient: "radial-gradient(circle, #6366F1 20%, #818CF8 80%)",
      shadow: "0 10px 40px rgba(99, 102, 241, 0.25)",
      accent: "#6366F1",
      badgeBg: "rgba(99, 102, 241, 0.08)",
      badgeText: "#6366F1",
      ringBorder: "3px dashed #6366F1",
      idleAnim: "pulse-idle-partner 3s infinite ease-in-out",
      processAnim: "pulse-idle-partner 1s infinite ease-in-out",
      speakingText: "Listening to your supportive partner..."
    },
    clinical: {
      gradient: "radial-gradient(circle, #7C3AED 20%, #A78BFA 80%)",
      shadow: "0 10px 40px rgba(124, 58, 237, 0.25)",
      accent: "#7C3AED",
      badgeBg: "rgba(124, 58, 237, 0.08)",
      badgeText: "#7C3AED",
      ringBorder: "3px dashed #7C3AED",
      idleAnim: "pulse-idle-clinical 3s infinite ease-in-out",
      processAnim: "pulse-idle-clinical 1s infinite ease-in-out",
      speakingText: "Listening to the senior doctor's advice..."
    },
    girlfriend: {
      gradient: "radial-gradient(circle, #EC4899 20%, #F472B6 80%)",
      shadow: "0 10px 40px rgba(236, 72, 153, 0.25)",
      accent: "#EC4899",
      badgeBg: "rgba(236, 72, 153, 0.08)",
      badgeText: "#EC4899",
      ringBorder: "3px dashed #EC4899",
      idleAnim: "pulse-idle-girlfriend 3s infinite ease-in-out",
      processAnim: "pulse-idle-girlfriend 1s infinite ease-in-out",
      speakingText: "Listening to your sweetheart..."
    },
    wife: {
      gradient: "radial-gradient(circle, #D97706 20%, #F59E0B 80%)",
      shadow: "0 10px 40px rgba(217, 119, 6, 0.25)",
      accent: "#D97706",
      badgeBg: "rgba(217, 119, 6, 0.08)",
      badgeText: "#D97706",
      ringBorder: "3px dashed #D97706",
      idleAnim: "pulse-idle-wife 3s infinite ease-in-out",
      processAnim: "pulse-idle-wife 1s infinite ease-in-out",
      speakingText: "Listening to your devoted wife..."
    }
  };

  const [assistantReply, setAssistantReply] = useState("");
  const [assistantEmotion, setAssistantEmotion] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [wakeWordListening, setWakeWordListening] = useState(true);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const inactive = (Date.now() - lastActiveTime.current) / 1000;
      setInactivitySec(Math.round(inactive));
      
      if (typingStartTime.current && charCount.current > 0) {
        const mins = (Date.now() - typingStartTime.current) / 60000;
        const words = charCount.current / 5;
        setTypingSpeed(Math.round(words / mins));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!typingStartTime.current) typingStartTime.current = Date.now();
    lastActiveTime.current = Date.now();
    charCount.current = val.length;
    setText(val);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          submitFusion(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecordingAndSubmit = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    } else {
      submitFusion(null);
    }
  };

  const submitFusion = async (audioBase64: string | null) => {
    setIsProcessing(true);
    try {
      // Capture webcam frame if camera active
      let imageBase64: string | null = null;
      if (isCameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          imageBase64 = canvas.toDataURL("image/jpeg", 0.6);
        }
      }

      // Compute typing WPM metrics
      const durationSec = typingStartTime.current
        ? (Date.now() - typingStartTime.current) / 1000
        : 0;
      const wpm = durationSec > 0 ? (charCount.current / 5) / (durationSec / 60) : 0;

      const payload = {
        text: text.trim() || null,
        audio_base64: audioBase64 || null,
        image_base64: imageBase64 || null,
        typing_speed_wpm: wpm || 40.0,
        inactivity_sec: inactivitySec || 0.0,
        session_duration_sec: durationSec || 0.0,
      };

      const res = await api.post("/api/v1/input/fusion", payload);
      setResult(res.data);
      setText("");
      typingStartTime.current = null;
      charCount.current = 0;
    } catch (err) {
      console.error("Fusion submission failed", err);
      setResult({
        final_emotion: "calm",
        confidence_score: 0.85,
        component_scores: {
          text: { calm: 0.9, happy: 0.1 },
          voice: { calm: 0.8, energetic: 0.2 },
          face: { calm: 0.85, neutral: 0.15 },
          behavior: { calm: 0.95, slow: 0.05 },
        },
        reply: "Unable to reach the live pipeline. Falling back to offline local buffer.",
        reasoning: "API Connection error. Fallback parameters activated.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Voice Assistant Feature Implementation ---

  // Synth Chime Beep Generator (Offline/No Asset needed)
  const playChime = () => {
    if (typeof window !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch (err) {
        console.error("Audio Context beep failed", err);
      }
    }
  };

  // Continuous speech recognizer setup for Wake Word "Hey Mindful"
  useEffect(() => {
    let recognition: any = null;

    const handleResult = (event: any) => {
      const transcriptText = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Wake word speech parsing:", transcriptText);
      if (transcriptText.includes("hey mindful") || transcriptText.includes("hey midland") || transcriptText.includes("hey mind")) {
        if (assistantState === "idle") {
          triggerAssistantSpeechInput();
        }
      }
    };

    const handleEnd = () => {
      // Keep it running continuously if in assistant mode and assistant is idle
      if (mode === "assistant" && assistantState === "idle" && wakeWordListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    if (typeof window !== "undefined" && mode === "assistant") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognition.addEventListener("result", handleResult);
        recognition.addEventListener("end", handleEnd);

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {}
      }
    }

    return () => {
      if (recognition) {
        recognition.removeEventListener("result", handleResult);
        recognition.removeEventListener("end", handleEnd);
        try {
          recognition.stop();
        } catch (e) {}
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  }, [mode, assistantState, wakeWordListening]);

  // Clean audio ref on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const triggerAssistantSpeechInput = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop wake word engine while capturing input
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    playChime();
    setAssistantState("listening");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await submitAssistantVoice(base64Audio);
        };
      };

      mediaRecorder.start();

      // Listen for 4 seconds then automatically stop to process
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          stream.getTracks().forEach(t => t.stop());
        }
      }, 4000);

    } catch (err) {
      console.error("Microphone denied for Assistant Mode", err);
      setAssistantState("idle");
    }
  };

  const submitAssistantVoice = async (audioBase64: string) => {
    setAssistantState("processing");
    setResponseTime(null);
    const startTime = performance.now();
    try {
      let imageBase64: string | null = null;
      if (isCameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          imageBase64 = canvas.toDataURL("image/jpeg", 0.6);
        }
      }

      const res = await api.post("/api/v1/input/voice-assistant", {
        audio_base64: audioBase64,
        image_base64: imageBase64,
        voice_mode: voiceMode
      });

      const duration = Math.round(performance.now() - startTime);
      setResponseTime(duration);

      const { reply, emotion, audio_base64 } = res.data;
      setAssistantReply(reply);
      setAssistantEmotion(emotion);
      setUserTranscript("Voice Input processed successfully.");

      if (audio_base64) {
        setAssistantState("speaking");
        const audio = new Audio(audio_base64);
        audioRef.current = audio;
        audio.onended = () => {
          setAssistantState("idle");
        };
        audio.play().catch((err) => {
          console.error("Audio playback error", err);
          setAssistantState("idle");
        });
      } else {
        setAssistantState("idle");
      }
    } catch (err) {
      console.error("Assistant API error", err);
      setAssistantReply("I am having a brief connection issue with our servers. Let us pause, take a deep breath, and try starting our session again in a moment.");
      setAssistantState("idle");
    }
  };

  const handleOrbClick = () => {
    if (assistantState === "idle" || assistantState === "speaking") {
      triggerAssistantSpeechInput();
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: "3rem" }}>
      
      {/* Visual Dynamic Keyframes for Orb UI States */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-idle-partner {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes pulse-idle-clinical {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(124, 58, 237, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        @keyframes pulse-idle-girlfriend {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(236, 72, 153, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
        }
        @keyframes pulse-idle-wife {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(217, 119, 6, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
        }
        @keyframes pulse-listening {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6); }
          50% { transform: scale(1.08); box-shadow: 0 0 0 25px rgba(52, 211, 153, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        @keyframes spin-processing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes speak-breath {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.06); filter: brightness(1.1); }
        }
        @keyframes wave-bounce {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}} />

      {/* Heading Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124, 58, 237, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <BrainCircuit size={24} color="#7C3AED" />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1E1B4B", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Multimodal Emotional Input
        </h1>
        <p style={{ color: "var(--on-surface-muted)", fontSize: "0.9375rem" }}>
          Combines Text, Voice, Facial Expressions, and Typing Behavior.
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div style={{
        display: "flex",
        background: "var(--surface-2)",
        borderRadius: 14,
        padding: "0.3rem",
        gap: "0.25rem",
        maxWidth: 420,
        margin: "0 auto 2.5rem",
        border: "1px solid rgba(124,58,237,0.06)"
      }}>
        <button
          onClick={() => { setMode("standard"); }}
          style={{
            flex: 1, padding: "0.625rem", borderRadius: 10, border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
            background: mode === "standard" ? "#FFFFFF" : "transparent",
            color: mode === "standard" ? "#7C3AED" : "var(--on-surface-muted)",
            boxShadow: mode === "standard" ? "var(--shadow-sm)" : "none",
            transition: "all var(--transition)"
          }}
        >
          Standard Analytics
        </button>
        <button
          onClick={() => { setMode("assistant"); }}
          style={{
            flex: 1, padding: "0.625rem", borderRadius: 10, border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
            background: mode === "assistant" ? "#FFFFFF" : "transparent",
            color: mode === "assistant" ? "#7C3AED" : "var(--on-surface-muted)",
            boxShadow: mode === "assistant" ? "var(--shadow-sm)" : "none",
            transition: "all var(--transition)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
          }}
        >
          <Sparkles size={14} color="#7C3AED" /> Voice Therapist
        </button>
      </div>

      {mode === "standard" ? (
        /* ═══ STANDARD MODE LAYOUT ═══ */
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side: Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Camera Card */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E1B4B", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Video size={18} color="#7C3AED" /> Camera Input
              </h2>
              <div style={{
                aspectRatio: "16/9", background: "#F3F2FA", borderRadius: 12, overflow: "hidden", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(124,58,237,0.08)", marginBottom: "1rem"
              }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: isCameraActive ? "block" : "none" }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {!isCameraActive && <span style={{ color: "var(--on-surface-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Camera Offline</span>}
              </div>
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                style={{
                  width: "100%", padding: "0.625rem", borderRadius: 10, border: "1px solid rgba(124, 58, 237, 0.15)",
                  background: "#FFFFFF", color: "#7C3AED", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
              >
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </button>
            </div>

            {/* Text & Behavior Card */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E1B4B", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Type size={18} color="#7C3AED" /> Text & Behavior
              </h2>
              <textarea
                style={{
                  width: "100%", background: "#FFFFFF", border: "1px solid rgba(124, 58, 237, 0.15)", borderRadius: 10,
                  padding: "0.75rem", outline: "none", resize: "none", height: 96, color: "#1E1B4B", fontFamily: "inherit", fontSize: "0.9rem"
                }}
                placeholder="Type how you are feeling..."
                value={text}
                onChange={handleTextChange}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(124, 58, 237, 0.15)'; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--on-surface-muted)", fontSize: "0.75rem", marginTop: "0.5rem", fontWeight: 600 }}>
                <span>Typing Speed: {typingSpeed} WPM</span>
                <span>Inactivity: {inactivitySec}s</span>
              </div>
            </div>

            {/* Process Controls */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={isRecording ? stopRecordingAndSubmit : startRecording}
                disabled={isProcessing}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.75rem", borderRadius: 12, border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
                  background: isRecording ? "#EF4444" : "#7C3AED",
                  color: "#FFFFFF",
                  boxShadow: isRecording ? "0 4px 12px rgba(239, 68, 68, 0.15)" : "0 4px 12px rgba(124, 58, 237, 0.15)"
                }}
              >
                {isRecording ? (
                  <><Square size={16} /> Stop & Process</>
                ) : (
                  <><Mic size={16} /> Start Voice Input</>
                )}
              </button>
              
              {!isRecording && (
                <button
                  onClick={stopRecordingAndSubmit}
                  disabled={isProcessing || (!text && !isCameraActive)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    padding: "0.75rem", borderRadius: 12, border: "1px solid rgba(124, 58, 237, 0.15)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
                    background: "#FFFFFF", color: "#7C3AED"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : "Process Now"}
                </button>
              )}
            </div>

          </div>

          {/* Right Side: Fusion Analysis Output */}
          <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E1B4B", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(124, 58, 237, 0.08)", marginBottom: "1.25rem" }}>
              Fusion Analysis Engine
            </h2>
            
            {result ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
                
                <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(124,58,237,0.04)", borderRadius: 16, border: "1px solid rgba(124,58,237,0.08)" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Final Emotion</p>
                  <p style={{ fontSize: "2.25rem", fontWeight: 800, color: "#7C3AED", textTransform: "capitalize" }}>{result.final_emotion}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--on-surface-muted)", marginTop: "0.35rem" }}>Confidence: {(result.confidence_score * 100).toFixed(1)}%</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E1B4B" }}>Component Analysis</p>
                  {["text", "voice", "face", "behavior"].map((comp) => {
                    const scores = result.component_scores[comp];
                    const topEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
                    return (
                      <div key={comp} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF", border: "1px solid rgba(124,58,237,0.08)", padding: "0.5rem 0.75rem", borderRadius: 10, fontSize: "0.85rem" }}>
                        <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--on-surface-muted)" }}>{comp}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ textTransform: "capitalize", fontWeight: 700, color: "#1E1B4B" }}>{topEmotion}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--on-surface-muted)", width: 34, textAlign: "right" }}>
                            {(scores[topEmotion] * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: 12, padding: "1rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7C3AED", marginBottom: "0.25rem" }}>AI Response</p>
                  <p style={{ fontSize: "0.85rem", color: "#1E1B4B", lineHeight: 1.5 }}>{result.reply}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--on-surface-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>{result.reasoning}</p>
                </div>

              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--on-surface-muted)", opacity: 0.5, textAlign: "center", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <BrainCircuit size={48} />
                </div>
                <p style={{ fontSize: "0.9rem" }}>Waiting for multimodal input...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
          /* ═══ ASSISTANT VOICE MODE (Glowing Orb Interface) ═══ */
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "99px", padding: "0.35rem 0.85rem", marginBottom: "2rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981" }}>Wake Word Active: say "Hey Mindful"</span>
            </div>

            {/* Premium Glassmorphic Voice Persona Selector */}
            <div style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(124, 58, 237, 0.1)",
              borderRadius: "99px",
              padding: "0.25rem",
              gap: "0.25rem",
              marginBottom: "2.5rem",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)"
            }}>
              {[
                { id: "partner", label: "Partner Mode", color: "#6366F1" },
                { id: "clinical", label: "Clinical Mode", color: "#7C3AED" },
                { id: "girlfriend", label: "Sweet Girlfriend", color: "#EC4899" },
                { id: "wife", label: "Loving Wife", color: "#D97706" }
              ].map((persona) => {
                const active = voiceMode === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setVoiceMode(persona.id as any)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "99px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: active ? persona.color : "transparent",
                      color: active ? "#FFFFFF" : "var(--on-surface-muted)",
                      boxShadow: active ? `0 4px 10px ${persona.color}40` : "none"
                    }}
                  >
                    {persona.label}
                  </button>
                );
              })}
            </div>

            {/* Glowing Orb Container */}
            <div 
              onClick={handleOrbClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOrbClick();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Toggle Mindful Assistant voice session"
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: themeMap[voiceMode].gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.4s ease",
                animation: 
                  assistantState === "listening" ? "pulse-listening 1.8s infinite ease-in-out" :
                  assistantState === "processing" ? themeMap[voiceMode].processAnim :
                  assistantState === "speaking" ? "speak-breath 3s infinite ease-in-out" :
                  themeMap[voiceMode].idleAnim,
                boxShadow: themeMap[voiceMode].shadow
              }}
            >
              {/* Specialized animated rings for states */}
              {assistantState === "processing" && (
                <div style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: themeMap[voiceMode].ringBorder,
                  animation: "spin-processing 2s linear infinite"
                }} />
              )}

              {/* Core Content Icon */}
              <div style={{ color: "#FFFFFF", zIndex: 5, transform: "scale(1.2)" }}>
                {assistantState === "idle" && <Mic size={32} />}
                {assistantState === "listening" && <Volume2 size={32} />}
                {assistantState === "processing" && <Loader2 size={32} className="animate-spin" />}
                {assistantState === "speaking" && (
                  <div style={{ display: "flex", gap: "3px", alignItems: "center", height: 28 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{
                        width: 3,
                        height: 24,
                        background: "#FFFFFF",
                        borderRadius: 1.5,
                        animation: `wave-bounce 0.8s infinite ease-in-out`,
                        animationDelay: `${i * 0.1}s`
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Orb Info Status */}
            <div style={{ marginTop: "2.5rem", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1E1B4B", textTransform: "capitalize", marginBottom: "0.25rem" }}>
                {assistantState === "idle" && (
                  voiceMode === "partner" ? "Supportive Partner" :
                  voiceMode === "clinical" ? "Clinical Therapist" :
                  voiceMode === "girlfriend" ? "Sweet Girlfriend" :
                  "Loving Wife"
                )}
                {assistantState === "listening" && "Listening..."}
                {assistantState === "processing" && "Processing..."}
                {assistantState === "speaking" && (
                  voiceMode === "partner" ? "Partner Speaking" :
                  voiceMode === "clinical" ? "Clinical Therapist Speaking" :
                  voiceMode === "girlfriend" ? "Sweetheart Speaking" :
                  "Wife Speaking"
                )}
              </h3>
              <p style={{ color: "var(--on-surface-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
                {assistantState === "idle" && "Tap the orb to start safe comforting session"}
                {assistantState === "listening" && "I'm listening to your voice..."}
                {assistantState === "processing" && "Generating warm, loving response..."}
                {assistantState === "speaking" && themeMap[voiceMode].speakingText}
              </p>
            </div>

            {/* Dialogue Bubble Box */}
            {(assistantReply || userTranscript) && (
              <div style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${themeMap[voiceMode].accent}15`,
                borderRadius: 16,
                padding: "1.5rem",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                boxShadow: `0 4px 20px ${themeMap[voiceMode].accent}03`
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                  {assistantEmotion && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-muted)", textTransform: "uppercase" }}>Detected Emotion:</span>
                      <span className="badge" style={{
                        background: `${themeMap[voiceMode].accent}15`,
                        color: themeMap[voiceMode].accent,
                        fontSize: "0.7rem",
                        textTransform: "capitalize",
                        fontWeight: 700
                      }}>{assistantEmotion}</span>
                    </div>
                  )}
                  {responseTime !== null && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-muted)", textTransform: "uppercase" }}>Response Time:</span>
                      <span className="badge" style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        color: "#10B981",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.45rem",
                        borderRadius: "6px"
                      }}>
                        ⚡ {(responseTime / 1000).toFixed(2)}s
                      </span>
                    </div>
                  )}
                </div>
                {assistantReply && (
                  <div>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: themeMap[voiceMode].accent, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {voiceMode === "partner" && "Partner Advice"}
                      {voiceMode === "clinical" && "Clinical Therapist"}
                      {voiceMode === "girlfriend" && "Sweetheart's Care"}
                      {voiceMode === "wife" && "Wife's Comfort"}
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "#1E1B4B", lineHeight: 1.55 }}>{assistantReply}</p>
                  </div>
                )}
              </div>
            )}

            {/* Micro Camera stream container for biometric feedback in assistant mode */}
            <div style={{
              width: "100%", marginTop: "2rem", borderTop: "1px solid rgba(124, 58, 237, 0.06)", paddingTop: "1.5rem",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Video size={16} color="var(--on-surface-muted)" />
                <span style={{ fontSize: "0.8rem", color: "var(--on-surface-muted)", fontWeight: 600 }}>Biometric Face Tracking</span>
              </div>
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className="btn btn-tonal"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
              >
                {isCameraActive ? "Disable Cam" : "Enable Cam"}
              </button>
            </div>

            {/* Hidden Video element for frame grabbing */}
            <div style={{ display: "none" }}>
              <video ref={videoRef} autoPlay playsInline muted />
              <canvas ref={canvasRef} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
