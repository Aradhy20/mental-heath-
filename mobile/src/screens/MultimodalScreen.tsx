import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MultimodalScreen() {
  const [text, setText] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const cameraRef = useRef<any>(null);
  const typingStartTime = useRef<number | null>(null);
  const charCount = useRef(0);
  const lastActiveTime = useRef<number>(Date.now());
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [inactivitySec, setInactivitySec] = useState(0);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasMicPermission(audioStatus.status === 'granted');
    })();

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

  const handleTextChange = (val: string) => {
    if (!typingStartTime.current) typingStartTime.current = Date.now();
    lastActiveTime.current = Date.now();
    charCount.current = val.length;
    setText(val);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecordingAndProcess = async () => {
    setIsProcessing(true);
    let base64Audio = null;
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const reader = new FileReader();
          base64Audio = await new Promise((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error(e);
        }
      }
      setRecording(null);
    }

    let base64Image = null;
    if (isCameraActive && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        base64Image = photo.base64;
      } catch (e) {
        console.error(e);
      }
    }

    // Submit Fusion
    try {
      const payload = {
        text,
        audio_base64: base64Audio,
        image_base64: base64Image,
        typing_speed_wpm: typingSpeed,
        inactivity_sec: inactivitySec,
      };

      // Ensure this URL is reachable from emulator (10.0.2.2 for Android)
      const res = await fetch("http://10.0.2.2:8000/api/v1/input/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      setResult(data);
      setText('');
      typingStartTime.current = null;
      charCount.current = 0;
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasCameraPermission === null) return <View />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Multimodal AI Input</Text>
        <Text style={styles.headerSub}>Fuse text, voice, face, and behavior</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="camera" size={20} color="#3b82f6" />
            <Text style={styles.cardTitle}>Camera</Text>
          </View>
          {isCameraActive ? (
            <View style={styles.cameraContainer}>
              <CameraView ref={cameraRef} style={styles.camera} facing="front" />
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderText}>Camera Off</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.toggleBtn} 
            onPress={() => setIsCameraActive(!isCameraActive)}
          >
            <Text style={styles.toggleBtnText}>{isCameraActive ? "Stop Camera" : "Start Camera"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="text" size={20} color="#10b981" />
            <Text style={styles.cardTitle}>Text & Behavior</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="How are you feeling?"
            multiline
            value={text}
            onChangeText={handleTextChange}
            placeholderTextColor="#888"
          />
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorText}>Speed: {typingSpeed} WPM</Text>
            <Text style={styles.behaviorText}>Inactivity: {inactivitySec}s</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.primaryBtn, recording ? styles.recordingBtn : null]} 
            onPress={recording ? stopRecordingAndProcess : startRecording}
            disabled={isProcessing}
          >
            <Icon name={recording ? "stop" : "microphone"} size={20} color={recording ? "#ef4444" : "#fff"} />
            <Text style={[styles.primaryBtnText, recording ? {color: '#ef4444'} : null]}>
              {recording ? "Stop & Process" : "Start Voice"}
            </Text>
          </TouchableOpacity>

          {!recording && (
            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={stopRecordingAndProcess}
              disabled={isProcessing || (!text && !isCameraActive)}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="brain" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Process All</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultHeader}>Fusion Analysis Engine</Text>
            <View style={styles.emotionBox}>
              <Text style={styles.emotionLabel}>Final Emotion</Text>
              <Text style={styles.emotionValue}>{result.final_emotion}</Text>
              <Text style={styles.confidenceText}>Confidence: {(result.confidence_score * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.responseBox}>
              <Text style={styles.responseLabel}>AI Copilot</Text>
              <Text style={styles.responseText}>{result.reply}</Text>
              <Text style={styles.reasoningText}>{result.reasoning}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  headerSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#374151' },
  cameraContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  camera: { flex: 1 },
  cameraPlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  placeholderText: { color: '#9ca3af' },
  toggleBtn: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 10, alignItems: 'center' },
  toggleBtnText: { color: '#4b5563', fontWeight: '600' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top', color: '#1f2937' },
  behaviorRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  behaviorText: { fontSize: 12, color: '#6b7280' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  primaryBtn: { flex: 1, backgroundColor: '#3b82f6', flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  recordingBtn: { backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1 },
  secondaryBtn: { flex: 1, backgroundColor: '#10b981', flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  resultHeader: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8 },
  emotionBox: { alignItems: 'center', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16 },
  emotionLabel: { fontSize: 12, textTransform: 'uppercase', color: '#6b7280', letterSpacing: 1 },
  emotionValue: { fontSize: 32, fontWeight: 'bold', color: '#3b82f6', textTransform: 'capitalize', marginVertical: 4 },
  confidenceText: { fontSize: 12, color: '#6b7280' },
  responseBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  responseLabel: { fontSize: 14, fontWeight: 'bold', color: '#10b981', marginBottom: 8 },
  responseText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  reasoningText: { fontSize: 12, color: '#94a3b8', marginTop: 12, fontStyle: 'italic' }
});
