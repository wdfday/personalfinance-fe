// Debt Types - matches server/internal/module/cashflow/debt/dto

export interface Debt {
  id: string
  user_id: string
  name: string
  description?: string
  type: DebtType
  status: DebtStatus
  principal_amount: number
  current_balance: number
  interest_rate: number
  minimum_payment: number
  payment_amount: number
  currency: string
  payment_frequency?: PaymentFrequency
  next_payment_date?: string
  last_payment_date?: string
  last_payment_amount?: number
  start_date: string
  due_date?: string
  paid_off_date?: string
  total_paid: number
  remaining_amount: number
  percentage_paid: number
  total_interest_paid: number
  creditor_name?: string
  account_number?: string
  linked_account_id?: string
  enable_reminders: boolean
  reminder_frequency?: string
  last_reminder_sent_at?: string
  notes?: string
  tags?: string
  days_until_next_payment: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export type DebtType = 'credit_card' | 'personal_loan' | 'mortgage' | 'student_loan' | 'auto_loan' | 'medical' | 'business' | 'other'
export type DebtStatus = 'active' | 'paid_off' | 'defaulted' | 'in_collection' | 'paused'
export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'

export interface CreateDebtRequest {
  name: string
  description?: string
  type: DebtType
  principal_amount: number
  current_balance?: number
  interest_rate?: number
  minimum_payment?: number
  currency?: string
  payment_frequency?: PaymentFrequency
  start_date?: string
  due_date?: string
  creditor_name?: string
  linked_account_id?: string
  notes?: string
}

export interface UpdateDebtRequest extends Partial<CreateDebtRequest> {
  status?: DebtStatus
}

export interface AddDebtPaymentRequest {
  amount: number
  payment_date?: string
  note?: string
}

export interface DebtSummary {
  total_debts: number
  active_debts: number
  paid_off_debts: number
  overdue_debts: number
  total_principal_amount: number
  total_current_balance: number
  total_paid: number
  total_remaining: number
  total_interest_paid: number
  average_progress: number
  debts_by_type: Record<string, { count: number; total_balance: number; total_paid: number }>
  debts_by_status: Record<string, number>
}
