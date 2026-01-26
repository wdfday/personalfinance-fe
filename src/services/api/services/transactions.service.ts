// Transaction Service
import { apiClient } from '../client'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionFilters,
} from '../types/transactions'

export const transactionsService = {
  async getAll(filters?: TransactionFilters): Promise<TransactionListResponse> {
    // Map start_date -> startBookingDate, end_date -> endBookingDate để match với API
    const mappedFilters: Record<string, unknown> = {}
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'start_date') {
          mappedFilters['startBookingDate'] = value
        } else if (key === 'end_date') {
          mappedFilters['endBookingDate'] = value
        } else {
          mappedFilters[key] = value
        }
      })
    }
    const queryString = filters ? apiClient.buildQueryString(mappedFilters) : ''
    return apiClient.get<TransactionListResponse>(`/transactions${queryString}`)
  },

  async getById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`)
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/transactions', data)
  },

  async update(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`/transactions/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/transactions/${id}`)
  },

  async getSummary(params?: {
    period?: string
    start_date?: string
    end_date?: string
  }): Promise<{
    total_income: number
    total_expense: number
    net_amount: number
    transaction_count: number
    category_breakdown: Record<string, number>
    currency_breakdown: Record<string, number>
    last_updated: string
  }> {
    const queryString = params ? apiClient.buildQueryString(params) : ''
    return apiClient.get(`/transactions/summary${queryString}`)
  },
}

export default transactionsService
