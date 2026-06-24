import api, { API_BASE_URL } from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Company } from './types'

export async function getCompany() {
  const response = await api.get<Company>('/company')
  return response.data
}

export async function createCompany(data: Partial<Company>) {
  const response = await api.post<Company>('/company', data)
  return response.data
}

export async function updateCompany(data: Partial<Company>) {
  const response = await api.put<Company>('/company', data)
  return response.data
}

export async function uploadCompanyFile(uri: string, type: 'logo' | 'signature' | 'stamp'): Promise<string> {
  const token = await AsyncStorage.getItem('auth-token')
  const ext = uri.split('.').pop() || 'jpg'
  const formData = new FormData()
  formData.append('file', { uri, name: `${type}.${ext}`, type: `image/${ext}` } as any)
  formData.append('type', type)

  const serverBase = API_BASE_URL.replace('/api/v1', '')
  const response = await fetch(`${API_BASE_URL}/company/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Erreur upload')
  }

  const data = await response.json()
  return `${serverBase}${data.url}`
}

export async function deleteCompanyFile(type: 'logo' | 'signature' | 'stamp'): Promise<void> {
  await api.delete(`/company/upload/${type}`)
}
