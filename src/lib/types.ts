export interface User {
  id: number
  name: string
  email: string
  google_id: string | null
  avatar: string | null
  auth_provider: string
  created_at: string
}

export interface Company {
  id: number
  user_id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  manager_name: string | null
  logo: string | null
  signature: string | null
  stamp: string | null
  created_at: string
}

export interface Client {
  id: number
  user_id: number
  company_id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  company_name: string | null
  created_at: string
}

export interface DocumentItem {
  id: number
  document_id: number
  designation: string
  quantity: string
  unit_price: string
  total_price: string
}

export interface Document {
  id: number
  user_id: number
  company_id: number
  client_id: number
  type: 'quote' | 'invoice'
  number: string
  project_name: string | null
  issue_date: string
  valid_until: string | null
  notes: string | null
  subtotal: string
  labor_cost: string
  transport_cost: string
  other_cost: string
  total: string
  total_in_words: string | null
  pdf_template: string | null
  client: Client
  items: DocumentItem[]
  company: Company
  created_at: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface GoogleRedirectResponse {
  url: string
}
