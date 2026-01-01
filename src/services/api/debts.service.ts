/**
 * Debts Service
 * Quản lý nợ và thanh toán
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'
import type {
  Debt,
  CreateDebtRequest,
  UpdateDebtRequest,
  DebtSummary,
  AddDebtPaymentRequest,
} from '@/types/api'

export interface DebtListResponse {
  items: Debt[]
  total: number
}

// Re-export types for backward compatibility
export type { Debt, CreateDebtRequest, UpdateDebtRequest, DebtSummary, AddDebtPaymentRequest }

class DebtsService {
  /**
   * Lấy danh sách debts
   */
  async getDebts(): Promise<DebtListResponse> {
    return baseApiClient.get<DebtListResponse>('/debts')
  }

  /**
   * Lấy thông tin một debt
   */
  async getDebt(id: string): Promise<Debt> {
    return baseApiClient.get<Debt>(`/debts/${id}`)
  }

  /**
   * Tạo debt mới
   */
  async createDebt(data: CreateDebtRequest): Promise<Debt> {
    return baseApiClient.post<Debt>('/debts', data)
  }

  /**
   * Cập nhật debt
   */
  async updateDebt(id: string, data: UpdateDebtRequest): Promise<Debt> {
    return baseApiClient.put<Debt>(`/debts/${id}`, data)
  }

  /**
   * Xóa debt (soft delete)
   */
  async deleteDebt(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/debts/${id}`)
  }

  /**
   * Thêm payment cho debt
   */
  async addPayment(id: string, data: AddDebtPaymentRequest): Promise<Debt> {
    return baseApiClient.post<Debt>(`/debts/${id}/payment`, data)
  }

  /**
   * Lấy debt summary
   */
  async getDebtSummary(): Promise<DebtSummary> {
    return baseApiClient.get<DebtSummary>('/debts/summary')
  }

  /**
   * Đánh dấu debt đã trả hết
   */
  async markAsPaidOff(id: string): Promise<Debt> {
    return baseApiClient.post<Debt>(`/debts/${id}/paid-off`)
  }
}

// Export singleton instance
export const debtsService = new DebtsService()
export default debtsService
