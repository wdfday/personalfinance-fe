/**
 * Budgets Service
 * Quản lý ngân sách theo danh mục và thời gian
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'
import type {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetSummary,
  BudgetFilters,
} from '@/types/api'

export interface BudgetListResponse {
  items: Budget[]
  total: number
}

// Re-export types for backward compatibility
export type { Budget, CreateBudgetRequest, UpdateBudgetRequest, BudgetSummary }

class BudgetsService {
  /**
   * Lấy danh sách budgets với filters
   */
  async getBudgets(filters?: BudgetFilters): Promise<BudgetListResponse> {
    return baseApiClient.get<BudgetListResponse>('/budgets', filters)
  }

  /**
   * Lấy thông tin một budget
   */
  async getBudget(id: string): Promise<Budget> {
    return baseApiClient.get<Budget>(`/budgets/${id}`)
  }

  /**
   * Tạo budget mới
   */
  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    return baseApiClient.post<Budget>('/budgets', data)
  }

  /**
   * Cập nhật budget
   */
  async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    return baseApiClient.put<Budget>(`/budgets/${id}`, data)
  }

  /**
   * Xóa budget (soft delete)
   */
  async deleteBudget(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/budgets/${id}`)
  }

  /**
   * Lấy budget summary
   */
  async getBudgetSummary(): Promise<BudgetSummary> {
    return baseApiClient.get<BudgetSummary>('/budgets/summary')
  }

  /**
   * Tính toán lại spent amount cho budget
   */
  async recalculateBudget(id: string): Promise<Budget> {
    return baseApiClient.post<Budget>(`/budgets/${id}/recalculate`)
  }
}

// Export singleton instance
export const budgetsService = new BudgetsService()
export default budgetsService
