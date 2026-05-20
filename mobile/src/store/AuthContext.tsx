/**
 * MindfulAI Mobile — Auth Context
 * Context API state management for authentication (mirrors web Zustand store)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, setToken, removeToken, getToken, type AuthResponse } from '../services/api'

interface User {
  user_id: string
  username: string
  email: string
}

interface AuthContextType {
  user:     User | null
  isAuthed: boolean
  loading:  boolean
  login:    (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout:   () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    getToken().then(async (t) => {
      if (t) {
        try {
          const userData = await authAPI.me()
          setUser({ user_id: userData.user_id, username: userData.username, email: userData.email })
        } catch (e) {
          console.warn("Session restore failed:", e)
          await removeToken()
        }
      }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authAPI.login({ email, password })
    const tok  = data.access_token || data.token
    await setToken(tok)
    setUser({ user_id: data.user_id, username: data.user.username, email: data.user.email })
  }

  const register = async (username: string, email: string, password: string) => {
    const data = await authAPI.register({ username, email, password })
    const tok  = data.access_token || data.token
    await setToken(tok)
    setUser({ user_id: data.user_id, username: data.user.username, email: data.user.email })
  }

  const logout = async () => {
    await removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
