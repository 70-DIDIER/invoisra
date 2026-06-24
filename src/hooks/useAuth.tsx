import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '@/lib/api'
import type { User, LoginResponse } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<string>
  handleGoogleCallbackUrl: (url: string) => Promise<void>
  saveAuth: (token: string, userData: User) => Promise<void>
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
      const storedUser = await AsyncStorage.getItem('auth-user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        try {
          const response = await api.get('/me')
          const freshUser = response.data.data ?? response.data
          setUser(freshUser)
          await AsyncStorage.setItem('auth-user', JSON.stringify(freshUser))
        } catch (error: any) {
          if (error?.response?.status === 401) {
            await AsyncStorage.removeItem('auth-token')
            await AsyncStorage.removeItem('auth-user')
            setToken(null)
            setUser(null)
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/login', { email, password })
    const data = response.data
    await AsyncStorage.setItem('auth-token', data.token)
    await AsyncStorage.setItem('auth-user', JSON.stringify(data.user))
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
    await AsyncStorage.setItem('auth-user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      await AsyncStorage.removeItem('auth-token')
      await AsyncStorage.removeItem('auth-user')
      setToken(null)
      setUser(null)
    }
  }

  async function saveAuth(token: string, userData: User) {
    await AsyncStorage.setItem('auth-token', token)
    await AsyncStorage.setItem('auth-user', JSON.stringify(userData))
    setToken(token)
    setUser(userData)
  }

  async function googleLogin() {
    console.log('[GoogleAuth] Fetching OAuth URL...')
    const response = await api.get<{ url: string }>('/auth/google/redirect')
    console.log('[GoogleAuth] URL received:', response.data.url?.substring(0, 80) + '...')
    return response.data.url
  }

  async function handleGoogleCallbackUrl(url: string) {
    console.log('[GoogleAuth] Processing callback URL:', url.substring(0, 120))
    const token = url.match(/[?&]token=([^&]+)/)?.[1]
    const userJson = url.match(/[?&]user=([^&]+)/)?.[1]
    if (token && userJson) {
      console.log('[GoogleAuth] Token+user from URL, saving...')
      const user = JSON.parse(decodeURIComponent(userJson))
      await AsyncStorage.setItem('auth-token', token)
      await AsyncStorage.setItem('auth-user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      return
    }
    const code = url.match(/[?&]code=([^&]+)/)?.[1]
    if (code) {
      console.log('[GoogleAuth] Code from URL, exchanging...')
      try {
        const response = await api.get<LoginResponse>('/auth/google/callback', { params: { code } })
        console.log('[GoogleAuth] Exchange success, token:', response.data.token?.substring(0, 20) + '...')
        const data = response.data
        await AsyncStorage.setItem('auth-token', data.token)
        await AsyncStorage.setItem('auth-user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      } catch (err: any) {
        console.log('[GoogleAuth] Exchange failed:', err.response?.status, err.response?.data?.message || err.message)
        throw err
      }
      return
    }
    console.log('[GoogleAuth] No token or code found in URL')
    throw new Error('Aucun token ou code trouvé')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, googleLogin, handleGoogleCallbackUrl, saveAuth }}
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
