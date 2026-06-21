import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as WebBrowser from 'expo-web-browser'
import api from '@/lib/api'
import type { User, LoginResponse } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
  handleGoogleCallback: (code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('auth-token')
      if (storedToken) {
        setToken(storedToken)
        const response = await api.get('/me')
        setUser(response.data.data ?? response.data)
      }
    } catch {
      await AsyncStorage.removeItem('auth-token')
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/login', { email, password })
    const data = response.data
    await AsyncStorage.setItem('auth-token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const response = await api.post<LoginResponse>('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    const data = response.data
    await AsyncStorage.setItem('auth-token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      await AsyncStorage.removeItem('auth-token')
      setToken(null)
      setUser(null)
    }
  }

  async function googleLogin() {
    const response = await api.get<{ url: string }>('/auth/google/redirect')
    const googleUrl = response.data.url

    const result = await WebBrowser.openAuthSessionAsync(googleUrl, 'invoica://auth/callback')

    if (result.type === 'success' && result.url) {
      const token = result.url.match(/[?&]token=([^&]+)/)?.[1]
      const userJson = result.url.match(/[?&]user=([^&]+)/)?.[1]

      if (token && userJson) {
        await AsyncStorage.setItem('auth-token', token)
        setToken(token)
        const parsedUser: User = JSON.parse(decodeURIComponent(userJson))
        setUser(parsedUser)
        return
      }
    }

    throw new Error('Authentification Google annulée ou échouée')
  }

  async function handleGoogleCallback(code: string) {
    const response = await api.get<LoginResponse>(`/auth/google/callback`, {
      params: { code },
    })
    const data = response.data
    await AsyncStorage.setItem('auth-token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, googleLogin, handleGoogleCallback }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
