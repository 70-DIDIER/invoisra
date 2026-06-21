import api from './api'
import type { Client, PaginatedResponse } from './types'

export async function getClients(search?: string, page = 1) {
  const params: Record<string, string | number> = { page }
  if (search) params.search = search
  const response = await api.get<PaginatedResponse<Client>>('/clients', { params })
  return response.data
}

export async function getClient(id: number) {
  const response = await api.get<Client>(`/clients/${id}`)
  return response.data
}

export async function createClient(data: Partial<Client>) {
  const response = await api.post<Client>('/clients', data)
  return response.data
}

export async function updateClient(id: number, data: Partial<Client>) {
  const response = await api.put<Client>(`/clients/${id}`, data)
  return response.data
}

export async function deleteClient(id: number) {
  await api.delete(`/clients/${id}`)
}
