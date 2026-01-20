// Budget Constraint Service
import { apiClient } from '../client'
import type {
  BudgetConstraint,
  CreateBudgetConstraintRequest,
  UpdateBudgetConstraintRequest,
  BudgetConstraintListResponse,
  BudgetConstraintSummary,
} from '../types/budget-constraints'

export const budgetConstraintsService = {
  async getAll(): Promise<BudgetConstraintListResponse> {
    return apiClient.get<BudgetConstraintListResponse>('/budget-constraints')
  },

  async getById(id: string): Promise<BudgetConstraint> {
    return apiClient.get<BudgetConstraint>(`/budget-constraints/${id}`)
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

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/budget-constraints/${id}`)
  },

  async getSummary(): Promise<BudgetConstraintSummary> {
    return apiClient.get<BudgetConstraintSummary>('/budget-constraints/summary')
  },
}

export default budgetConstraintsService
