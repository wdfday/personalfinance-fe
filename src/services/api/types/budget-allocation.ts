// Budget Allocation Types
export interface BudgetAllocationModelInput {
  user_id: string
  year: number
  month: number
  override_income?: number
  use_all_scenarios: boolean
  run_sensitivity: boolean
  total_income: number
  mandatory_expenses: MandatoryExpense[]
  flexible_expenses: FlexibleExpense[]
  debts: DebtInput[]
  goals: GoalInput[]
  sensitivity_options?: SensitivityOptions
}

export interface MandatoryExpense {
  category_id: string
  name: string
  amount: number
  priority: number
}

export interface FlexibleExpense {
  category_id: string
  name: string
  min_amount: number
  max_amount: number
  priority: number
}

export interface DebtInput {
  debt_id: string
  name: string
  balance: number
  interest_rate: number
  minimum_payment: number
}

export interface GoalInput {
  goal_id: string
  name: string
  type: string
  priority: string
  remaining_amount: number
  suggested_contribution: number
}

export interface SensitivityOptions {
  income_change_percents: number[]
  rate_change_percents: number[]
  analyze_goal_priority: boolean
}

export interface BudgetAllocationModelOutput {
  user_id: string
  period: string
  total_income: number
  scenarios: AllocationScenario[]
  is_feasible: boolean
  global_warnings?: AllocationWarning[]
  sensitivity_results?: SensitivityAnalysisResult
  metadata: AllocationMetadata
}

export interface AllocationScenario {
  id: string
  name: string
  description: string
  type: 'safe' | 'balanced'
  total_allocated: number
  total_mandatory: number
  total_flexible: number
  total_debt_payments: number
  total_goal_contributions: number
  savings_rate: number
  allocations: CategoryAllocation[]
  debt_payments: DebtPayment[]
  goal_contributions: GoalContribution[]
  surplus: number
  score: number
  is_feasible: boolean
  warnings: AllocationWarning[]
}

export interface CategoryAllocation {
  category_id: string
  name: string
  amount: number
  type: 'mandatory' | 'flexible'
  percentage: number
}

export interface DebtPayment {
  debt_id: string
  name: string
  amount: number
  type: 'minimum' | 'extra' | 'total'
}

export interface GoalContribution {
  goal_id: string
  name: string
  amount: number
}

export interface AllocationWarning {
  type: string
  message: string
  severity: 'low' | 'medium' | 'high'
  entity_id?: string
}

export interface AllocationMetadata {
  generated_at: string
  data_sources: string[]
  computation_time_ms: number
  constraints_count: number
  goals_count: number
  debts_count: number
}

export interface SensitivityAnalysisResult {
  summary: {
    most_sensitive_to_income: boolean
    income_break_even_point: number
    overall_risk_level: string
    key_recommendations: string[]
  }
}

export interface GenerateAllocationRequest {
  user_id: string
  year: number
  month: number
  override_income?: number
}

export interface ExecuteAllocationRequest {
  user_id: string
  scenario_type: 'safe' | 'balanced'
  year: number
  month: number
}
