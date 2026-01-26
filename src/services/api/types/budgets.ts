// Budget Types - matches server/internal/module/cashflow/budget/dto

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  category_id?: string
  constraint_id?: string // FK to budget_constraint (if created from DSS)
  amount: number
  currency: string
  period: BudgetPeriod
  start_date: string
  end_date?: string
  spent_amount: number
  remaining_amount: number
  percentage_spent: number
  status: BudgetStatus
  enable_alerts: boolean
  alert_thresholds: AlertThreshold[]
  allow_rollover: boolean
  carry_over_percent?: number
  rollover_amount?: number
  auto_adjust?: boolean
  auto_adjust_based_on?: string
  auto_adjust_percentage?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom' | 'one-time'
export type BudgetStatus = 'active' | 'exceeded' | 'warning' | 'paused' | 'expired' | 'ended'
export type AlertThreshold = '50' | '75' | '90' | '100'

export interface CreateBudgetRequest {
  name: string
  description?: string
  category_id?: string
  constraint_id?: string // Optional: link to budget constraint
  amount: number
  currency: string
  period?: BudgetPeriod // Optional - defaults to one-time if not provided
  start_date: string
  end_date?: string
  enable_alerts?: boolean
  alert_thresholds?: AlertThreshold[]
  allow_rollover?: boolean
  carry_over_percent?: number
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  status?: BudgetStatus
}

export interface BudgetFilters {
  status?: BudgetStatus
  period?: BudgetPeriod
  category_id?: string
  limit?: number
  offset?: number
}

export interface BudgetListResponse {
  budgets: Budget[]
  total: number
  summary?: BudgetSummary
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
}
