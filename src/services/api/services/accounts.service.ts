// Account Service
import { apiClient } from '../client'
import type { Account, CreateAccountRequest, UpdateAccountRequest, AccountsListResponse } from '../types/accounts'

export interface AccountFilters {
  account_type?: string
  is_active?: boolean
  is_primary?: boolean
  include_deleted?: boolean
}

export const accountsService = {
  async getAll(filters?: AccountFilters): Promise<AccountsListResponse> {
    const queryString = filters ? `?${apiClient.buildQueryString(filters as unknown as Record<string, unknown>)}` : ''
    return apiClient.get<AccountsListResponse>(`/accounts${queryString}`)
  },

  async getById(id: string): Promise<Account> {
    return apiClient.get<Account>(`/accounts/${id}`)
  },

  async create(data: CreateAccountRequest): Promise<Account> {
    return apiClient.post<Account>('/accounts', data)
  },

  async update(id: string, data: UpdateAccountRequest): Promise<Account> {
    return apiClient.put<Account>(`/accounts/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/accounts/${id}`)
  },
}

export default accountsService
