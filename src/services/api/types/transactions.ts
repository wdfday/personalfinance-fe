// Transaction Types - matches server/internal/module/cashflow/transaction/dto

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id?: string
  
  // Direction-based classification (New Model)
  direction?: 'DEBIT' | 'CREDIT'
  instrument?: string
  source?: string

  type: TransactionType // Keeping for backward compatibility or dual support
  sub_type: string
  amount: number
  currency: string
  exchange_rate: number
  base_amount: number
  description: string
  note?: string
  date: string
  booking_date?: string // Alias for date or specific booking date
  value_date?: string
  status: TransactionStatus
  reference?: string
  tags?: string[]
  location?: string
  merchant?: string
  is_recurring: boolean
  recurring_id?: string
  is_tax_deductible: boolean
  tax_amount?: number
  fee?: number
  income_profile_id?: string // For income linking
  links?: TransactionLink[]
  created_at: string
  updated_at: string
  
  // Bank specific
  bank_code?: string
  external_id?: string
  channel?: string
  running_balance?: number
  counterparty_name?: string
  counterparty_account_number?: string
  counterparty_bank_name?: string
  counterparty_type?: string
}

export interface TransactionLink {
  type: 'GOAL' | 'BUDGET' | 'DEBT' | 'INCOME_PROFILE'
  id: string
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment'
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'failed'

export interface CreateTransactionRequest {
  account_id: string
  category_id?: string
  type: TransactionType
  sub_type: string
  amount: number
  currency: string
  description: string
  note?: string
  date: string
  tags?: string[]
  location?: string
  merchant?: string
  is_tax_deductible?: boolean
  tax_amount?: number
  fee?: number
  income_profile_id?: string
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  status?: TransactionStatus
}

export interface TransactionListResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
  }
  summary?: TransactionSummary
}

export interface TransactionSummary {
  totalDebit: number
  totalCredit: number
  netAmount: number
  count: number
  byInstrument?: Record<string, InstrumentSummary>
  bySource?: Record<string, SourceSummary>
}

export interface InstrumentSummary {
  debit: number
  credit: number
  count: number
}

export interface SourceSummary {
  debit: number
  credit: number
  count: number
}

export interface TransactionFilters {
  account_id?: string
  category_id?: string
  type?: TransactionType
  status?: TransactionStatus
  instrument?: string
  direction?: 'DEBIT' | 'CREDIT'
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
