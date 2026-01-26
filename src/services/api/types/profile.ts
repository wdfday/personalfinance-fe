// Profile Types - matches server/internal/module/identify/profile/dto

export interface Profile {
  user_id: string
  occupation?: string
  industry?: string
  employer?: string
  dependents_count?: number
  marital_status?: string
  monthly_income_avg?: number
  emergency_fund_months?: number
  debt_to_income_ratio?: number
  credit_score?: number
  income_stability?: string
  risk_tolerance: string
  investment_horizon: string
  investment_experience: string
  budget_method: string
  notification_channels: string[]
  alert_threshold_budget?: number
  report_frequency?: string
  currency_primary: string
  currency_secondary: string
  preferred_report_day_of_month?: number
  onboarding_completed: boolean
  onboarding_completed_at?: string
  primary_goal?: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  occupation?: string
  industry?: string
  employer?: string
  dependents_count?: number
  marital_status?: string
  monthly_income_avg?: number
  emergency_fund_months?: number
  debt_to_income_ratio?: number
  credit_score?: number
  income_stability?: string
  risk_tolerance?: string
  investment_horizon?: string
  investment_experience?: string
  budget_method?: string
  notification_channels?: string[]
  alert_threshold_budget?: number
  report_frequency?: string
  currency_primary?: string
  currency_secondary?: string
  preferred_report_day_of_month?: number
  onboarding_completed?: boolean
  onboarding_completed_at?: string
  primary_goal?: string
}
