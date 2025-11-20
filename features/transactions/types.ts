/**
 * Transactions Types
 * Export tất cả types liên quan đến Transactions
 */

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
