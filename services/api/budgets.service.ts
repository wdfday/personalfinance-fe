/**
 * Budgets Service
 * Quản lý ngân sách theo danh mục và thời gian
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export interface AlertThreshold {
  percentage: number
  message?: string
}

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  amount: number
  currency: string
  period: string
  start_date: string
  end_date?: string
  category_id?: string
  account_id?: string
  spent_amount: number
  remaining_amount: number
  percentage_spent: number
  status: string
  last_calculated_at?: string
  enable_alerts: boolean
  alert_thresholds: AlertThreshold[]
  notification_sent: boolean
  allow_rollover: boolean
  rollover_amount: number
  carry_over_percent?: number
  auto_adjust: boolean
  auto_adjust_percentage?: number
  auto_adjust_based_on?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateBudgetRequest {
  name: string
  description?: string
  amount: number
  currency: string
  period: string
  start_date: string
  end_date?: string
  category_id?: string
  account_id?: string
  enable_alerts?: boolean
  alert_thresholds?: AlertThreshold[]
  allow_rollover?: boolean
  carry_over_percent?: number
  auto_adjust?: boolean
  auto_adjust_percentage?: number
  auto_adjust_based_on?: string
}

export interface UpdateBudgetRequest {
  name?: string
  description?: string
  amount?: number
  currency?: string
  period?: string
  start_date?: string
  end_date?: string
  category_id?: string
  account_id?: string
  enable_alerts?: boolean
  alert_thresholds?: AlertThreshold[]
  allow_rollover?: boolean
  carry_over_percent?: number
  auto_adjust?: boolean
  auto_adjust_percentage?: number
  auto_adjust_based_on?: string
}

export interface BudgetListResponse {
  items: Budget[]
  total: number
}

export interface BudgetSummary {
  total_budgets: number
  active_budgets: number
  exceeded_budgets: number
  warning_budgets: number
  total_amount: number
  total_spent: number
  total_remaining: number
  average_percentage: number
  budgets_by_category: Record<string, any>
}

class BudgetsService {
  /**
   * Lấy danh sách budgets
   */
  async getBudgets(): Promise<BudgetListResponse> {
    return baseApiClient.get<BudgetListResponse>('/budgets')
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
   * Xóa budget
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
}

// Export singleton instance
export const budgetsService = new BudgetsService()
export default budgetsService
