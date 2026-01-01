/**
 * Transactions Service
 * Quản lý giao dịch - Direction-based model
 * Synced with backend API - 2026-01-13
 */

import { baseApiClient } from './base'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryFilters,
  TransactionListResponse,
  TransactionSummary,
  ImportJSONRequest,
  ImportJSONResponse,
} from '@/types/api'

// Re-export types for convenience
export type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryFilters,
  TransactionListResponse,
  TransactionSummary,
}

class TransactionsService {
  /**
   * Lấy danh sách transactions với filters và pagination
   */
  async getTransactions(params?: TransactionQueryFilters): Promise<TransactionListResponse> {
    return baseApiClient.get<TransactionListResponse>('/transactions', params)
  }

  /**
   * Lấy thông tin một transaction
   */
  async getTransaction(id: string): Promise<Transaction> {
    return baseApiClient.get<Transaction>(`/transactions/${id}`)
  }

  /**
   * Tạo transaction mới
   */
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    return baseApiClient.post<Transaction>('/transactions', data)
  }

  /**
   * Cập nhật transaction
   */
  async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    return baseApiClient.put<Transaction>(`/transactions/${id}`, data)
  }

  /**
   * Xóa transaction (soft delete)
   */
  async deleteTransaction(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/transactions/${id}`)
  }

  /**
   * Lấy transaction summary với filters
   */
  async getSummary(params?: TransactionQueryFilters): Promise<TransactionSummary> {
    return baseApiClient.get<TransactionSummary>('/transactions/summary', params)
  }

  /**
   * Import transactions từ bank JSON
   */
  async importJSON(data: ImportJSONRequest): Promise<ImportJSONResponse> {
    return baseApiClient.post<ImportJSONResponse>('/transactions/import/json', data)
  }

  // Helper methods

  /**
   * Lấy transactions theo account
   */
  async getTransactionsByAccount(accountId: string, params?: TransactionQueryFilters): Promise<TransactionListResponse> {
    return this.getTransactions({ ...params, accountId })
  }

  /**
   * Lấy transactions theo date range
   */
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    params?: TransactionQueryFilters
  ): Promise<TransactionListResponse> {
    return this.getTransactions({
      ...params,
      startBookingDate: startDate,
      endBookingDate: endDate,
    })
  }

  /**
   * Lấy income transactions (CREDIT)
   */
  async getIncomeTransactions(params?: TransactionQueryFilters): Promise<TransactionListResponse> {
    return this.getTransactions({ ...params, direction: 'CREDIT' })
  }

  /**
   * Lấy expense transactions (DEBIT)
   */
  async getExpenseTransactions(params?: TransactionQueryFilters): Promise<TransactionListResponse> {
    return this.getTransactions({ ...params, direction: 'DEBIT' })
  }
}

// Export singleton instance
export const transactionsService = new TransactionsService()
export default transactionsService
