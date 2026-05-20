import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/store/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as PaperProvider } from 'react-native-paper'
import { materialTheme } from './src/theme/material'

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={materialTheme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
