import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const API_BASE_URL = 'http://192.168.99.216:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth-token')
    }
    return Promise.reject(error)
  },
)

export default api
