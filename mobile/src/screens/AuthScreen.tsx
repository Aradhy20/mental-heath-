import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView, Image,
  Dimensions
} from 'react-native'
import { useAuth } from '../store/AuthContext'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'
import { PrimaryButton } from '../components/PrimaryButton'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

interface Props { onAuth: () => void }

export default function AuthScreen({ onAuth }: Props) {
  const { login, register } = useAuth()
  const [mode,     setMode]     = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert('Error', 'Email and password required'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!username) { Alert.alert('Error', 'Username required'); setLoading(false); return }
        await register(username, email, password)
      }
      onAuth()
    } catch (e: any) {
      Alert.alert('Authentication Failed', e?.message ?? 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Decorative Header Background */}
        <View style={styles.headerGlow} />

        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
             <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>MindfulAI</Text>
          <Text style={styles.brandTagline}>Deep Neural Support Architecture</Text>
        </View>

        <View style={styles.authCard}>
           <Text style={styles.authTitle}>{mode === 'login' ? 'Welcome Back' : 'Secure Registration'}</Text>
           <Text style={styles.authSub}>{mode === 'login' ? 'Synchronize your mental state.' : 'Initialize your neural journey.'}</Text>

           {/* Tab Switcher */}
           <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setMode('login')} style={[styles.tab, mode === 'login' && styles.tabActive]}>
                 <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('register')} style={[styles.tab, mode === 'register' && styles.tabActive]}>
                 <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
              </TouchableOpacity>
           </View>

           {/* Input Matrix */}
           <View style={styles.inputStack}>
              {mode === 'register' && (
                 <View style={styles.inputField}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                       style={styles.textInput}
                       placeholder="Clinical Identity"
                       placeholderTextColor={COLORS.textMuted}
                       value={username}
                       onChangeText={setUsername}
                       autoCapitalize="none"
                    />
                 </View>
              )}

              <View style={styles.inputField}>
                 <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                 <TextInput
                    style={styles.textInput}
                    placeholder="Neural Registry (Email)"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                 />
              </View>

              <View style={styles.inputField}>
                 <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                 <TextInput
                    style={styles.textInput}
                    placeholder="Security Protocol (Password)"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                 />
              </View>
           </View>

           <PrimaryButton
             title={mode === 'login' ? 'INITIALIZE SYNC' : 'REGISTER NEURAL LINK'}
             loading={loading}
             onPress={handleSubmit}
             disabled={loading}
             style={{ marginTop: 24, borderRadius: 20, height: 64 }}
           />

           <View style={styles.footerInfo}>
              <MaterialCommunityIcons name="shield-check" size={12} color={COLORS.emerald} />
              <Text style={styles.footerText}>Quantum End-to-End Encryption Active</Text>
           </View>
        </View>

        <View style={styles.demoBox}>
           <Text style={styles.demoHeader}>DIAGNOSTIC ACCESS</Text>
           <Text style={styles.demoContent}>demo@mindfulai.com</Text>
           <Text style={styles.demoContent}>mindful_demo_2026</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scroll: { 
    flexGrow: 1, 
    padding: 32,
    paddingTop: 80,
  },
  headerGlow: {
     position: 'absolute',
     top: -100,
     left: -50,
     right: -50,
     height: 300,
     backgroundColor: 'rgba(126, 34, 206, 0.05)',
     borderRadius: 150,
     transform: [{ scale: 2 }],
  },
  brandContainer: {
     alignItems: 'center',
     marginBottom: 40,
  },
  logoCircle: {
     width: 100,
     height: 100,
     backgroundColor: '#fff',
     borderRadius: 36,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.05,
     shadowRadius: 20,
     elevation: 5,
     marginBottom: 20,
  },
  brandTitle: {
     fontSize: 36,
     fontWeight: '900',
     color: '#111827',
     letterSpacing: -1.5,
  },
  brandTagline: {
     fontSize: 10,
     fontWeight: '900',
     color: '#7E22CE',
     textTransform: 'uppercase',
     letterSpacing: 2,
     marginTop: 4,
     opacity: 0.8,
  },
  authCard: {
     backgroundColor: '#fff',
     borderRadius: 40,
     padding: 32,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 20 },
     shadowOpacity: 0.05,
     shadowRadius: 40,
     elevation: 10,
     borderWidth: 1,
     borderColor: '#F1F5F9',
  },
  authTitle: {
     fontSize: 24,
     fontWeight: '900',
     color: '#111827',
     letterSpacing: -0.5,
     textAlign: 'center',
  },
  authSub: {
     fontSize: 13,
     color: '#6B7280',
     fontWeight: '600',
     textAlign: 'center',
     marginTop: 6,
     marginBottom: 32,
  },
  tabRow: {
     flexDirection: 'row',
     backgroundColor: '#F1F5F9',
     borderRadius: 20,
     padding: 6,
     marginBottom: 32,
  },
  tab: {
     flex: 1,
     paddingVertical: 12,
     borderRadius: 16,
     alignItems: 'center',
  },
  tabActive: {
     backgroundColor: '#fff',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.05,
     shadowRadius: 10,
     elevation: 2,
  },
  tabText: {
     fontSize: 14,
     fontWeight: '700',
     color: '#64748b',
  },
  tabTextActive: {
     color: '#7E22CE',
     fontWeight: '900',
  },
  inputStack: {
     gap: 16,
  },
  inputField: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#F8FAFC',
     borderWidth: 1,
     borderColor: '#F1F5F9',
     borderRadius: 20,
     paddingHorizontal: 20,
     height: 64,
  },
  inputIcon: {
     marginRight: 12,
     opacity: 0.5,
  },
  textInput: {
     flex: 1,
     color: '#111827',
     fontSize: 15,
     fontWeight: '700',
  },
  footerInfo: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 6,
     marginTop: 20,
     opacity: 0.5,
  },
  footerText: {
     fontSize: 9,
     fontWeight: '900',
     color: '#64748b',
     textTransform: 'uppercase',
     letterSpacing: 1,
  },
  demoBox: {
     marginTop: 40,
     alignItems: 'center',
     backgroundColor: 'rgba(126, 34, 206, 0.03)',
     padding: 20,
     borderRadius: 24,
     borderWidth: 1,
     borderColor: 'rgba(126, 34, 206, 0.05)',
  },
  demoHeader: {
     fontSize: 9,
     fontWeight: '900',
     color: '#7E22CE',
     letterSpacing: 2,
     marginBottom: 8,
  },
  demoContent: {
     fontSize: 11,
     color: '#64748b',
     fontWeight: '700',
     opacity: 0.8,
  }
})
