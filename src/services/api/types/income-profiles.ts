// Income Profile Types - matches server/internal/module/cashflow/income_profile/dto

export interface IncomeProfile {
  id: string
  user_id: string
  category_id: string
  start_date?: string
  end_date?: string
  duration_days?: number
  source: string
  amount: number
  currency: string
  frequency: string
  status: IncomeStatus
  is_recurring: boolean
  is_active: boolean
  is_archived: boolean
  dss_metadata?: DSSMetadata
  dss_score?: number
  description?: string
  tags?: string[]
  previous_version_id?: string
  created_at: string
  updated_at: string
  archived_at?: string
}

export type IncomeStatus = 'active' | 'pending' | 'ended' | 'archived' | 'paused'

export interface DSSMetadata {
  stability_score: number
  risk_level: 'low' | 'medium' | 'high'
  confidence: number
  variance: number
  trend: 'increasing' | 'stable' | 'decreasing'
  recommended_savings_rate: number
  last_analyzed: string
  analysis_version: string
}

export interface CreateIncomeProfileRequest {
  category_id: string
  source: string
  amount: number
  currency?: string
  frequency: string
  start_date?: string
  end_date?: string
  description?: string
  tags?: string[]
  is_recurring?: boolean
}

export interface UpdateIncomeProfileRequest extends Partial<CreateIncomeProfileRequest> {
  category_id?: string
}

export interface IncomeProfileListResponse {
  income_profiles: IncomeProfile[]
  count: number
  summary?: IncomeSummary
}

export interface IncomeSummary {
  total_monthly_income: number
  total_yearly_income: number
  active_income_count: number
  recurring_income_count: number
  average_stability?: number
}
