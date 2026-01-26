// Budget Constraint Types - matches server/internal/module/cashflow/budget_profile/dto

export interface BudgetConstraint {
  id: string
  user_id: string
  category_id: string
  category_name?: string
  period: string
  start_date: string
  end_date?: string
  duration_days?: number
  minimum_amount: number
  is_flexible: boolean
  maximum_amount: number
  priority: number
  status: ConstraintStatus
  is_recurring: boolean
  is_active: boolean
  is_archived: boolean
  flexibility_range?: number
  display_string?: string
  description?: string
  tags?: string[]
  previous_version_id?: string
  created_at: string
  updated_at: string
  archived_at?: string
}

export type ConstraintStatus = 'active' | 'ended' | 'archived'

export interface CreateBudgetConstraintRequest {
  category_id: string
  minimum_amount: number
  maximum_amount?: number
  is_flexible?: boolean
  priority?: number
  start_date: string
  end_date?: string
  description?: string
  is_recurring?: boolean
}

export interface UpdateBudgetConstraintRequest {
  minimum_amount?: number
  maximum_amount?: number
  is_flexible?: boolean
  priority?: number
  end_date?: string
  description?: string
}

export interface BudgetConstraintListResponse {
  budget_constraints: BudgetConstraint[]
  count: number
  summary?: BudgetConstraintSummary
}

export interface BudgetConstraintWithHistoryResponse {
  current: BudgetConstraint
  version_history?: BudgetConstraint[]
}

export interface BudgetConstraintSummary {
  total_mandatory_expenses: number
  total_flexible: number
  total_fixed: number
  count: number
  active_count: number
}

export interface BudgetConstraintFilters {
  status?: ConstraintStatus
  category_id?: string
  is_flexible?: boolean
  limit?: number
  offset?: number
}
