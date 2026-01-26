// Budget Constraint Service
import { apiClient } from '../client'
import type {
  BudgetConstraint,
  CreateBudgetConstraintRequest,
  UpdateBudgetConstraintRequest,
  BudgetConstraintListResponse,
  BudgetConstraintSummary,
  BudgetConstraintWithHistoryResponse,
} from '../types/budget-constraints'

export const budgetConstraintsService = {
  async getAll(): Promise<BudgetConstraintListResponse> {
    return apiClient.get<BudgetConstraintListResponse>('/budget-constraints')
  },

  async getById(id: string): Promise<BudgetConstraint> {
    return apiClient.get<BudgetConstraint>(`/budget-constraints/${id}`)
  },

  async getHistory(id: string): Promise<BudgetConstraintWithHistoryResponse> {
    return apiClient.get<BudgetConstraintWithHistoryResponse>(`/budget-constraints/${id}/history`)
  },

  async getByCategory(categoryId: string): Promise<BudgetConstraint> {
    return apiClient.get<BudgetConstraint>(`/budget-constraints/category/${categoryId}`)
  },

  async create(data: CreateBudgetConstraintRequest): Promise<BudgetConstraint> {
    return apiClient.post<BudgetConstraint>('/budget-constraints', data)
  },

  async update(id: string, data: UpdateBudgetConstraintRequest): Promise<BudgetConstraint> {
    return apiClient.put<BudgetConstraint>(`/budget-constraints/${id}`, data)
  },

  async archive(id: string): Promise<void> {
    return apiClient.post(`/budget-constraints/${id}/archive`)
  },

  async end(id: string): Promise<BudgetConstraint> {
    return apiClient.post<BudgetConstraint>(`/budget-constraints/${id}/end`)
  },

  async getSummary(): Promise<BudgetConstraintSummary> {
    return apiClient.get<BudgetConstraintSummary>('/budget-constraints/summary')
  },
}

export default budgetConstraintsService
