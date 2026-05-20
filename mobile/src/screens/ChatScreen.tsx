import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Avatar, IconButton, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MessageBubble = ({ role, content, time }: any) => {
  const isAI = role === 'ai';
  return (
    <View style={[styles.messageContainer, isAI ? styles.aiAlign : styles.userAlign]}>
      <View style={[styles.bubbleWrapper, isAI ? styles.aiWrapper : styles.userWrapper]}>
        {isAI && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot" size={16} color="#fff" />
          </View>
        )}
        <View style={[
          styles.bubble, 
          isAI ? styles.aiBubble : styles.userBubble
        ]}>
          <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
            {content}
          </Text>
          <Text style={[styles.timeText, isAI ? styles.aiTime : styles.userTime]}>
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const [messages] = useState([
    { role: 'ai', content: "Hi! I'm MindfulAI. I'm here to listen. How are you feeling right now?", time: '10:00 AM' },
    { role: 'user', content: "A bit stressed about my upcoming project deadline.", time: '10:01 AM' },
    { role: 'ai', content: "I understand. Deadlines can be tough. Your voice sounds a bit tense. Would you like to try a quick grounding exercise?", time: '10:02 AM' },
  ]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Surface style={styles.header} elevation={0}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.headerTitle}>MindfulAI Companion</Text>
            </View>
            <IconButton icon="dots-horizontal" iconColor="#64748b" />
          </View>
        </Surface>

        {/* Chat List */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} {...msg} />
          ))}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={20}
        >
          <View style={styles.inputWrapper}>
            <Surface style={styles.inputContainer} elevation={2}>
              <TouchableOpacity style={styles.inputAction}>
                <MaterialCommunityIcons name="microphone" size={24} color="#6366F1" />
              </TouchableOpacity>
              <TextInput 
                placeholder="Type your message..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
                multiline
              />
              <TouchableOpacity style={styles.sendButton}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </Surface>
            <Text style={styles.encryptionText}>SECURE & END-TO-END ENCRYPTED</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: 20,
    width: '100%',
  },
  aiAlign: {
    alignItems: 'flex-start',
  },
  userAlign: {
    alignItems: 'flex-end',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    gap: 10,
    maxWidth: '85%',
  },
  aiWrapper: {
    alignItems: 'flex-start',
  },
  userWrapper: {
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiText: {
    color: '#334155',
  },
  userText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  aiTime: {
    color: '#94a3b8',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrapper: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#F8FAFC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  encryptionText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
  },
});
