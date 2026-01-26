// Debt Service
import { apiClient } from '../client'
import type { Debt, CreateDebtRequest, UpdateDebtRequest, DebtSummary } from '../types/debts'

export const debtsService = {
  async getAll(): Promise<{ debts: Debt[]; total: number }> {
    // API trả về dạng { status, message, data: Debt[] }
    const data = await apiClient.get<Debt[]>('/debts')
    const debts = Array.isArray(data) ? data : (data as any)?.debts || []
    return {
      debts,
      total: debts.length,
    }
  },

  async getById(id: string): Promise<Debt> {
    return apiClient.get<Debt>(`/debts/${id}`)
  },

  async create(data: CreateDebtRequest): Promise<Debt> {
    return apiClient.post<Debt>('/debts', data)
  },

  async update(id: string, data: UpdateDebtRequest): Promise<Debt> {
    return apiClient.put<Debt>(`/debts/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/debts/${id}`)
  },

  async getSummary(): Promise<DebtSummary> {
    return apiClient.get<DebtSummary>('/debts/summary')
  },

  async makePayment(id: string, amount: number): Promise<Debt> {
    return apiClient.post<Debt>(`/debts/${id}/payment`, { amount })
  },

  async markAsPaidOff(id: string): Promise<Debt> {
    return apiClient.post<Debt>(`/debts/${id}/paid-off`)
  },
}

export default debtsService
