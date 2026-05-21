'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { 
  Camera, 
  VideoOff, 
  Activity, 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Heart, 
  Compass, 
  ShieldAlert,
  Play,
  Square,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

// Emotion mapping for UI colors and styling
const EMOTIONS = {
  happy: {
    label: 'Happy',
    color: '#FBBF24', // Gold
    bg: 'rgba(251, 191, 36, 0.15)',
    glow: 'rgba(251, 191, 36, 0.4)',
    icon: Smile,
    tip: 'Your spirits are high! Keep spreading the positive energy.',
  },
  sad: {
    label: 'Sad',
    color: '#60A5FA', // Soft Blue
    bg: 'rgba(96, 165, 250, 0.15)',
    glow: 'rgba(96, 165, 250, 0.4)',
    icon: Frown,
    tip: 'It is okay to feel down. Take a slow deep breath, we are here.',
  },
  angry: {
    label: 'Angry',
    color: '#F87171', // Coral Red
    bg: 'rgba(248, 113, 113, 0.15)',
    glow: 'rgba(248, 113, 113, 0.4)',
    icon: Zap,
    tip: 'Take a moment. Exhale slowly, let the heat dissipate gently.',
  },
  surprised: {
    label: 'Surprised',
    color: '#A78BFA', // Indigo / Purple
    bg: 'rgba(167, 139, 250, 0.15)',
    glow: 'rgba(167, 139, 250, 0.4)',
    icon: Sparkles,
    tip: 'Something caught your attention! Take it in with curious interest.',
  },
  neutral: {
    label: 'Neutral',
    color: '#34D399', // Sage Green
    bg: 'rgba(52, 211, 153, 0.15)',
    glow: 'rgba(52, 211, 153, 0.4)',
    icon: Meh,
    tip: 'Calm and steady. A great state for productive focus.',
  },
  uncertain: {
    label: 'Scanning...',
    color: '#9CA3AF', // Gray
    bg: 'rgba(156, 163, 175, 0.1)',
    glow: 'rgba(156, 163, 175, 0.2)',
    icon: RefreshCw,
    tip: 'Position your face clearly in the camera frame with good lighting.',
  }
};

type EmotionKey = keyof typeof EMOTIONS;

export default function FaceTrackerPage() {
  const { user } = useStore();
  const [isTracking, setIsTracking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionKey>('uncertain');
  const [confidence, setConfidence] = useState(0.0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Analytics State
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({
    happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0
  });
  const [logs, setLogs] = useState<Array<{ time: string, emotion: string, conf: number }>>([]);

  const [isSimulated, setIsSimulated] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // API base URL computation (supporting localhost:8000 and custom ports)
  const getWsUrl = () => {
    let rawUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!rawUrl && typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
      const hostname = window.location.hostname;
      rawUrl = `${protocol}://${hostname}:8000`;
    }
    rawUrl = rawUrl || 'http://localhost:8000';
    return rawUrl.replace(/^http/, 'ws') + '/ws/face';
  };

  // Session duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTracking && sessionStartTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isTracking, sessionStartTime]);

  const startSimulator = () => {
    setIsTracking(true);
    setIsSimulated(true);
    setCameraError(null);
    setSessionStartTime(Date.now());
    setCurrentEmotion('neutral');
    setConfidence(0.85);
    
    // Simulate periodic emotional updates
    const emotionsList: EmotionKey[] = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
    
    intervalRef.current = setInterval(() => {
      const randomEmotion = emotionsList[Math.floor(Math.random() * emotionsList.length)];
      const randomConfidence = Number((0.65 + Math.random() * 0.32).toFixed(4));
      
      setCurrentEmotion(randomEmotion);
      setConfidence(randomConfidence);

      setEmotionCounts(prev => ({
        ...prev,
        [randomEmotion]: prev[randomEmotion] + 1
      }));

      setLogs(prev => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return [{ time: nowStr, emotion: EMOTIONS[randomEmotion].label, conf: randomConfidence }, ...prev].slice(0, 5);
      });
    }, 1500);
  };

  const startTracking = async (forceSimulator: boolean = false) => {
    setCameraError(null);
    setCurrentEmotion('uncertain');
    setConfidence(0.0);
    setLogs([]);
    setEmotionCounts({ happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0 });

    if (forceSimulator) {
      startSimulator();
      return;
    }

    try {
      // 1. Get webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, frameRate: { ideal: 15 } },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Establish WebSocket connection
      const wsUrl = getWsUrl();
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsTracking(true);
        setIsSimulated(false);
        setSessionStartTime(Date.now());
        
        // Start periodic frame captures (10 FPS = 100ms interval)
        intervalRef.current = setInterval(() => {
          if (videoRef.current && canvasRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
              // Draw video frame to hidden canvas
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Compress to JPEG to save bandwidth and send as base64 data url
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              socketRef.current.send(dataUrl);
            }
          }
        }, 100);
      };

      socket.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (res.emotion && res.emotion in EMOTIONS) {
            const emo = res.emotion as EmotionKey;
            const conf = res.confidence;
            
            setCurrentEmotion(emo);
            setConfidence(conf);

            if (emo !== 'uncertain') {
              // Update Analytics
              setEmotionCounts(prev => ({
                ...prev,
                [emo]: prev[emo] + 1
              }));

              // Add to event logs (keep last 5 logs)
              setLogs(prev => {
                const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return [{ time: nowStr, emotion: EMOTIONS[emo].label, conf }, ...prev].slice(0, 5);
              });
            }
          }
        } catch (e) {
          console.error("Error parsing socket message", e);
        }
      };

      socket.onerror = (e) => {
        console.error("WebSocket error:", e);
        setCameraError("Unable to establish low-latency model server connection. Launching simulator fallback...");
        // Auto fallback to simulator on socket error
        stopTracking();
        startSimulator();
      };

      socket.onclose = () => {
        stopTracking();
      };

    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? "Camera permission denied. Please grant camera access or try simulator mode." 
          : "Webcam initialization failed. Launching simulator fallback..."
      );
      stopTracking();
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    setIsSimulated(false);
    setSessionStartTime(null);
    setCurrentEmotion('uncertain');
    setConfidence(0.0);

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear capture / simulation interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Compute dominant emotion
  const getDominantEmotion = () => {
    let maxCount = 0;
    let dominant = 'neutral';
    Object.entries(emotionCounts).forEach(([emo, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = emo;
      }
    });
    return maxCount > 0 ? dominant : 'neutral';
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const currentTheme = EMOTIONS[currentEmotion];
  const CurrentIcon = currentTheme.icon;
  const domEmo = getDominantEmotion();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        border: '1px solid var(--outline)',
        padding: '1.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(10px)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} color="var(--primary-dim)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Biometric Intelligence</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>Real-Time Face Analyzer</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Privacy-first facial expression analysis mapping to high-resolution emotional markers.
          </p>
        </div>
        
        {/* Connection status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: isTracking ? 'rgba(52, 211, 153, 0.1)' : 'rgba(156, 163, 175, 0.1)',
          border: `1px solid ${isTracking ? 'var(--success)' : 'var(--outline)'}`,
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: isTracking ? 'var(--success)' : 'var(--on-surface-muted)',
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            width: 8, height: 8,
            borderRadius: '50%',
            backgroundColor: isTracking ? 'var(--success)' : 'var(--on-surface-muted)',
            display: 'inline-block',
            boxShadow: isTracking ? '0 0 8px var(--success)' : 'none',
            animation: isTracking ? 'pulse 2s infinite' : 'none'
          }} />
          {isTracking ? 'Low Latency Engine Connected' : 'Offline'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Left Column: Webcam Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.3), rgba(15, 23, 42, 0.5))',
            border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(20px)',
            transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
            borderColor: isTracking ? currentTheme.color : 'var(--outline)',
            boxShadow: isTracking ? `0 0 30px ${currentTheme.glow}` : 'none',
          }}>
            
            {/* Hidden canvas for capturing video frames */}
            <canvas ref={canvasRef} width={480} height={360} style={{ display: 'none' }} />
            
            {/* Video Viewfinder Container */}
            <div style={{
              width: '100%',
              maxWidth: '560px',
              aspectRatio: '4/3',
              backgroundColor: '#090d16',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--outline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Actual Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isTracking ? 'block' : 'none',
                  transform: 'scaleX(-1)' // Mirror effect
                }}
              />

              {/* Offline Overlay */}
              {!isTracking && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-muted)', zIndex: 2 }}>
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--outline)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}>
                    <Camera size={32} color="var(--on-surface-muted)" />
                  </div>
                  <h3 style={{ color: 'var(--on-surface)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Camera Ready</h3>
                  <p style={{ fontSize: '0.875rem', maxWidth: '300px', margin: '0 auto' }}>
                    Press start to activate your camera stream and begin emotional profiling.
                  </p>
                </div>
              )}

              {/* Camera Error Display */}
              {cameraError && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center',
                  zIndex: 10,
                }}>
                  <VideoOff size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: 'var(--on-surface)', fontWeight: 700, marginBottom: '0.5rem' }}>Webcam Blocked</h4>
                  <p style={{ color: 'var(--error)', fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                    {cameraError}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => startTracking(false)}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <RefreshCw size={16} /> Try Again
                    </button>
                    <button 
                      onClick={() => startTracking(true)}
                      className="btn"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary-dim)', color: 'var(--primary-dim)' }}
                    >
                      <Sparkles size={16} /> Try Sandbox Mode
                    </button>
                  </div>
                </div>
              )}

              {/* Simulated scan placeholder when in simulator mode */}
              {isTracking && isSimulated && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15), rgba(9, 13, 22, 0.95))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  overflow: 'hidden'
                }}>
                  {/* Glowing grid */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                  
                  {/* Moving scanning line */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, var(--primary-dim), transparent)',
                      boxShadow: '0 0 10px var(--primary-dim)',
                      animation: 'scanUpDown 3s infinite ease-in-out'
                    }}
                  />

                  {/* Wireframe target mesh */}
                  <div style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    border: '1px dashed rgba(99,102,241,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'spinSlow 20s linear infinite',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: '1.5px solid var(--primary-dim)',
                      opacity: 0.6
                    }} />
                    {/* Reticle marks */}
                    <div style={{ position: 'absolute', top: 0, width: 6, height: 12, backgroundColor: 'var(--primary-dim)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', bottom: 0, width: 6, height: 12, backgroundColor: 'var(--primary-dim)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', left: 0, height: 6, width: 12, backgroundColor: 'var(--primary-dim)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', right: 0, height: 6, width: 12, backgroundColor: 'var(--primary-dim)', borderRadius: 2 }} />
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', zIndex: 2 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary-dim)', animation: 'pulse 1.5s infinite' }}>
                      Simulated Sandbox Mode
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)', marginTop: 4 }}>
                      Facial metrics synthetically generated
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking HUD Overlay */}
              {isTracking && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  right: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}>
                  <div style={{
                    backgroundColor: 'rgba(9, 13, 22, 0.75)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid var(--outline)'
                  }}>
                    <Clock size={12} color="var(--primary-dim)" />
                    {formatTime(elapsedTime)}
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(9, 13, 22, 0.75)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: currentTheme.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: `1px solid ${currentTheme.color}`
                  }}>
                    <CurrentIcon size={12} />
                    {isSimulated ? 'Simulated' : `${Math.round(confidence * 100)}% Conf`}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', maxWidth: '400px' }}>
              {!isTracking ? (
                <>
                  <button
                    onClick={() => startTracking(false)}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Camera size={18} /> Webcam Mode
                  </button>
                  <button
                    onClick={() => startTracking(true)}
                    className="btn"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid var(--primary-dim)',
                      color: 'var(--primary-dim)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Sparkles size={18} /> Sandbox Mode
                  </button>
                </>
              ) : (
                <button
                  onClick={stopTracking}
                  className="btn"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Square size={18} fill="currentColor" /> Stop Analyzer
                </button>
              )}
            </div>
          </div>

          {/* AI Helper Tip */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(9, 13, 22, 0.9))',
            border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            position: 'relative',
          }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              backgroundColor: currentTheme.bg,
              border: `1px solid ${currentTheme.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              color: currentTheme.color,
              transition: 'all 0.5s ease',
            }}>
              <Compass size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--on-surface)' }}>Mindful Copilot Insight</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-muted)', lineHeight: 1.5, transition: 'color 0.5s ease' }}>
                {currentTheme.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics & Analytics Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Real-time metrics card */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary-dim)" /> Emotional Reading
            </h3>

            {/* Huge Emotion Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1.5rem 1rem',
              backgroundColor: 'rgba(9, 13, 22, 0.4)',
              border: '1px solid var(--outline)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                backgroundColor: currentTheme.bg,
                border: `1px solid ${currentTheme.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentTheme.color,
                marginBottom: '0.75rem',
                boxShadow: `0 0 15px ${currentTheme.glow}`,
                transition: 'all 0.5s ease',
              }}>
                <CurrentIcon size={32} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', transition: 'color 0.5s ease' }}>
                {currentTheme.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>
                {isTracking ? `Confidence Index: ${Math.round(confidence * 100)}%` : 'No reading detected'}
              </div>
            </div>

            {/* Confidence Slider Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-muted)', marginBottom: '0.5rem' }}>
                <span>Inference Confidence</span>
                <span style={{ color: currentTheme.color }}>{Math.round(confidence * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(156, 163, 175, 0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${confidence * 100}%`,
                  backgroundColor: currentTheme.color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease',
                  boxShadow: `0 0 8px ${currentTheme.color}`
                }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(9, 13, 22, 0.3)', border: '1px solid var(--outline)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', fontWeight: 600 }}>Dominant Mood</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)', marginTop: '0.25rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {isTracking && domEmo in EMOTIONS ? (
                    <>
                      {(() => {
                        const DomIcon = EMOTIONS[domEmo as EmotionKey].icon;
                        return <DomIcon size={16} color={EMOTIONS[domEmo as EmotionKey].color} />;
                      })()}
                      {EMOTIONS[domEmo as EmotionKey].label}
                    </>
                  ) : 'None'}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(9, 13, 22, 0.3)', border: '1px solid var(--outline)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', fontWeight: 600 }}>Privacy Protection</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Heart size={14} fill="var(--success)" /> Local Dev
                </div>
              </div>
            </div>
          </div>

          {/* Session Log / History Card */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary-dim)" /> Tracker Session Logs
            </h3>

            {logs.length === 0 ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-muted)', fontSize: '0.85rem', minHeight: '120px' }}>
                No active records. Start tracking to generate timeline.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {logs.map((logItem, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(9, 13, 22, 0.4)',
                    border: '1px solid var(--outline)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    animation: 'slideIn 0.3s ease-out',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--on-surface-muted)', fontWeight: 500 }}>{logItem.time}</span>
                      <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{logItem.emotion}</span>
                    </div>
                    <span style={{
                      fontWeight: 600,
                      color: logItem.conf > 0.7 ? 'var(--success)' : 'var(--on-surface-muted)',
                      backgroundColor: logItem.conf > 0.7 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(156, 163, 175, 0.05)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                    }}>
                      {Math.round(logItem.conf * 100)}% Match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Embedded keyframe animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scanUpDown {
          0%, 100% { top: 5%; }
          50% { top: 90%; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
