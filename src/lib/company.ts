import api from './api'
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
