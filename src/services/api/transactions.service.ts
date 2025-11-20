/**
 * Transactions Service
 * Quản lý giao dịch thu chi
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export interface Transaction {
  id: string
  user_id: string
  account_id: string
  from_account_id?: string
  to_account_id?: string
  transaction_type: string
  amount: number
  currency: string
  category_id?: string
  description: string
  notes?: string
  transaction_date: string
  status: string
  payment_method?: string
  receipt_url?: string
  attachment_count: number
  location?: string
  latitude?: number
  longitude?: number
  tags?: string[]
  is_recurring: boolean
  recurring_id?: string
  recurring_frequency?: string
  balance_before?: number
  balance_after?: number
  external_id?: string
  external_source?: string
  merchant_name?: string
  merchant_category?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateTransactionRequest {
  account_id: string
  from_account_id?: string
  to_account_id?: string
  transaction_type: string
  amount: number
  currency: string
  category_id?: string
  description: string
  notes?: string
  transaction_date: string
  status?: string
  payment_method?: string
  receipt_url?: string
  location?: string
  latitude?: number
  longitude?: number
  tags?: string[]
  recurring_frequency?: string
  external_id?: string
  merchant_name?: string
  merchant_category?: string
}

export interface UpdateTransactionRequest {
  account_id?: string
  from_account_id?: string
  to_account_id?: string
  transaction_type?: string
  amount?: number
  currency?: string
  category_id?: string
  description?: string
  notes?: string
  transaction_date?: string
  status?: string
  payment_method?: string
  receipt_url?: string
  location?: string
  latitude?: number
  longitude?: number
  tags?: string[]
  recurring_frequency?: string
  external_id?: string
  merchant_name?: string
  merchant_category?: string
}

export interface PaginationInfo {
  page: number
  page_size: number
  total_pages: number
  total_count: number
}

export interface TransactionSummary {
  total_income: number
  total_expense: number
  total_transfer: number
  net_amount: number
  count: number
}

export interface TransactionListResponse {
  transactions: Transaction[]
  pagination: PaginationInfo
  summary?: TransactionSummary
}

export interface TransactionQueryParams {
  account_id?: string
  category_id?: string
  transaction_type?: string
  status?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

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
  async getTransactionsByDateRange(startDate: string, endDate: string, params?: Omit<TransactionQueryParams, 'start_date' | 'end_date'>): Promise<Transaction[]> {
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
    
    // Backend already returns summary
    if (response.summary) {
      return response.summary
    }

    // Fallback: calculate locally if backend doesn't return summary
    const transactions = response.transactions
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalExpense = transactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalTransfer = transactions
      .filter(t => t.transaction_type === 'transfer' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      total_transfer: totalTransfer,
      net_amount: totalIncome - totalExpense,
      count: transactions.length,
    }
  }
}

// Export singleton instance
export const transactionsService = new TransactionsService()
export default transactionsService
