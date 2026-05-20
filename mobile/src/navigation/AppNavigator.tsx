import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../store/AuthContext'

// Screens
import HomeScreen from '../screens/HomeScreen'
import ChatScreen from '../screens/ChatScreen'
import JournalScreen from '../screens/JournalScreen'
import InsightsScreen from '../screens/InsightsScreen'
import UsersDashboardScreen from '../screens/UsersDashboardScreen'
import AuthScreen from '../screens/AuthScreen'
import MoodScreen from '../screens/MoodScreen'
import NearbyScreen from '../screens/NearbyScreen'
import MultimodalScreen from '../screens/MultimodalScreen'
import ResilienceScreen from '../screens/ResilienceScreen'
import GamesScreen from '../screens/GamesScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1B1F', // M3 Surface
          borderTopWidth: 0,
          height: 80,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#EADDFF',
        tabBarInactiveTintColor: '#938F99',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 12,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline'
          else if (route.name === 'Journal') iconName = focused ? 'book-open-variant' : 'book-outline'
          else if (route.name === 'Insights') iconName = focused ? 'lightbulb' : 'lightbulb-outline'
          else if (route.name === 'Community') iconName = focused ? 'account-group' : 'account-group-outline'
          else if (route.name === 'Multimodal') iconName = focused ? 'camera-iris' : 'camera-iris'
          
          return (
            <View style={{
              backgroundColor: focused ? '#4F378B' : 'transparent',
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 4,
              marginBottom: 4,
            }}>
              <MaterialCommunityIcons name={iconName} size={24} color={color} />
            </View>
          )
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Community" component={UsersDashboardScreen} />
      <Tab.Screen name="Multimodal" component={MultimodalScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { isAuthed, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1B1F' }}>
        <ActivityIndicator size="large" color="#D0BCFF" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthed ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuth={() => {}} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Mood" component={MoodScreen} />
            <Stack.Screen name="Nearby" component={NearbyScreen} />
            <Stack.Screen name="Resilience" component={ResilienceScreen} />
            <Stack.Screen name="Games" component={GamesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
