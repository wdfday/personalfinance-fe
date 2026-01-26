/**
 * Transactions Service
 * Quản lý giao dịch thu chi
 */

import { baseApiClient } from '@/services/api/base'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionQueryParams,
  TransactionSummary,
} from '../types'

class TransactionsService {
  /**
   * Lấy danh sách transactions với filter
   */
  async getTransactions(params?: TransactionQueryParams): Promise<TransactionListResponse> {
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
   * Lấy transactions gần đây
   */
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const response = await this.getTransactions({ page_size: limit, page: 1 })
    return response.transactions
  }

  /**
   * Lấy transactions theo khoảng thời gian
   */
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    params?: Omit<TransactionQueryParams, 'start_date' | 'end_date'>,
  ): Promise<Transaction[]> {
    const response = await this.getTransactions({
      ...params,
      start_date: startDate,
      end_date: endDate,
    })
    return response.transactions
  }

  /**
   * Lấy summary transactions theo khoảng thời gian
   */
  async getTransactionsSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
    const response = await this.getTransactions({
      start_date: startDate,
      end_date: endDate,
    })

    if (response.summary) {
      return response.summary
    }

    const transactions = response.transactions
    const totalIncome = transactions
      .filter((t) => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalExpense = transactions
      .filter((t) => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalTransfer = transactions
      .filter((t) => t.transaction_type === 'transfer' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      total_transfer: totalTransfer,
      net_amount: totalIncome - totalExpense,
      count: transactions.length,
    }
  }

  /**
   * Import transactions từ JSON
   */
  async importJSONTransactions(data: {
    accountId: string
    bankCode: string
    transactions: unknown[]
  }): Promise<{
    totalReceived: number
    successCount: number
    skippedCount: number
    failedCount: number
    importedIds: string[]
    skippedIds: string[]
    errors?: Array<{ bankTransactionId: string; error: string }>
    accountBalance?: {
      accountId: string
      previousBalance: number
      newBalance: number
      lastSyncedAt: string
    }
  }> {
    return baseApiClient.post<{
      totalReceived: number
      successCount: number
      skippedCount: number
      failedCount: number
      importedIds: string[]
      skippedIds: string[]
      errors?: Array<{ bankTransactionId: string; error: string }>
      accountBalance?: {
        accountId: string
        previousBalance: number
        newBalance: number
        lastSyncedAt: string
      }
    }>('/transactions/import/json', data)
  }
}

export const transactionsService = new TransactionsService()
export default transactionsService
