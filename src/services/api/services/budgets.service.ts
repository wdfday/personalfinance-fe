// Budget Service
import { apiClient } from '../client'
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest, BudgetFilters, BudgetListResponse } from '../types/budgets'

export const budgetsService = {
  async getAll(filters?: BudgetFilters): Promise<BudgetListResponse> {
    const queryString = filters ? apiClient.buildQueryString(filters as unknown as Record<string, unknown>) : ''
    return apiClient.get(`/budgets${queryString}`)
  },

  async getById(id: string): Promise<Budget> {
    return apiClient.get<Budget>(`/budgets/${id}`)
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    return apiClient.post<Budget>('/budgets', data)
  },

  async update(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    return apiClient.put<Budget>(`/budgets/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/budgets/${id}`)
  },
}

export default budgetsService
