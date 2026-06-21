import api from './api'
import type { Document, PaginatedResponse } from './types'

export async function getDocuments(params?: { search?: string; page?: number; type?: string }) {
  const response = await api.get<PaginatedResponse<Document>>('/documents', { params })
  return response.data
}

export async function getDocument(id: number) {
  const response = await api.get<Document>(`/documents/${id}`)
  return response.data
}

export async function createDocument(data: Partial<Document>) {
  const response = await api.post<Document>('/documents', data)
  return response.data
}

export async function updateDocument(id: number, data: Partial<Document>) {
  const response = await api.put<Document>(`/documents/${id}`, data)
  return response.data
}

export async function deleteDocument(id: number) {
  await api.delete(`/documents/${id}`)
}

export async function downloadDocumentPdf(id: number) {
  const response = await api.get<{ filename: string; content: string; content_type: string }>(
    `/documents/${id}/download`
  )
  return response.data
}

export async function sendDocumentEmail(id: number, email: string) {
  await api.post(`/documents/${id}/email`, { email })
}
