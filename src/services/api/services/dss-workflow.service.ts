import { apiClient } from '../client';

// ==================== Types ====================

export interface AutoScoringRequest {
  month_id: string;
  monthly_income: number; // REQUIRED for feasibility calculation
  goals: Array<{
    id: string; // Changed from goal_id to match backend DTO
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    type: string; // REQUIRED by backend: savings, debt, investment, purchase, emergency, retirement, education, other
    priority: string;
  }>;
}

export interface GoalPrioritizationRequest {
  month_id: string;
  criteria_ratings?: Record<string, number>; // Custom criteria ratings (1-10 scale)
  goals: Array<{
    id: string; // Changed from goal_id to match backend GoalForRating DTO
    name: string;
    target_amount: number;
    current_amount: number; // REQUIRED by backend
    target_date: string; // Changed from deadline to match backend
    type: string; // REQUIRED by backend: savings, debt, investment, purchase, emergency, retirement, education, other
    priority: string;
    // Optional auto-scoring overrides
    feasibility_score?: number;
    impact_score?: number;
    importance_score?: number;
    urgency_score?: number;
  }>;
}

export interface DebtStrategyRequest {
  month_id: string;
  debts: Array<{
    debt_id: string;
    name: string;
    current_balance: number;
    interest_rate: number;
    minimum_payment: number;
  }>;
  total_debt_budget: number;
}

// Step 3 Preview: Only preferences (backend collects Goals & Debts from Step 1 & 2)
export interface PreviewGoalDebtTradeoffRequest {
  month_id: string;
  preferences: {
    psychological_weight: number;
    priority: 'debt_first' | 'balanced' | 'goals_first';
    accept_investment_risk: boolean;
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  };
}

// Step 3 Apply: User's allocation decision
export interface ApplyGoalDebtTradeoffRequest {
  month_id: string;
  goal_allocation_percent: number;
  debt_allocation_percent: number;
}

// Step 4 Preview: Constraints + allocation % from Step 3
// (Backend collects Goals & Debts from Step 1 & 2)
export interface PreviewBudgetAllocationRequest {
  month_id: string;
  total_income: number;
  goal_allocation_pct: number; // From Step 3
  debt_allocation_pct: number; // From Step 3
  constraints: Array<{
    category_id: string;
    category_name: string;
    min_amount: number;
    max_amount?: number;
    flexibility: 'fixed' | 'flexible' | 'discretionary';
    priority: number;
    is_ad_hoc: boolean;
    description?: string;
  }>;
}

export interface ApplyGoalPrioritizationRequest {
  month_id: string;
  accepted_ranking: string[];
}

export interface ApplyDebtStrategyRequest {
  month_id: string;
  selected_strategy: string;
}

// Step 4 Apply: Selected scenario + full allocations map
export interface ApplyBudgetAllocationRequest {
  month_id: string;
  selected_scenario: string;
  allocations: Record<string, number>; // CategoryID -> Amount
}

// ==================== Finalize DSS (Approach 2: Apply All at Once) ====================

export interface FinalizeDSSRequest {
  use_auto_scoring: boolean;
  goal_priorities: Array<{
    goal_id: string;
    priority: number;
    method: string;
  }>;
  debt_strategy?: string;
  tradeoff_choice?: {
    scenario_type: string;
    goal_allocation_pct: number;
    debt_allocation_pct: number;
    expected_outcome?: string;
  };
  budget_allocations: Record<string, number>; // CategoryID -> Amount
  goal_fundings: Array<{
    goal_id: string;
    suggested_amount: number;
    user_adjusted_amount?: number;
  }>;
  debt_payments: Array<{
    debt_id: string;
    minimum_payment: number;
    suggested_payment: number;
    user_adjusted_payment?: number;
  }>;
  notes?: string;
}

export interface FinalizeDSSResponse {
  month_id: string;
  state_version: number;
  to_be_budgeted: number;
  status: string;
  dss_workflow: {
    month_id: string;
    current_step: number;
    completed_steps: number[];
    is_complete: boolean;
    can_proceed: boolean;
    last_updated?: string;
    step1_applied: boolean;
    step2_applied: boolean;
    step3_applied: boolean;
    step4_applied: boolean;
  };
  message: string;
}

// ==================== API Service ====================

export const dssWorkflowService = {
  // ==================== Preview Endpoints ====================
  
  previewAutoScoring: (monthStr: string, data: AutoScoringRequest) =>
    apiClient.post(`/months/${monthStr}/auto-scoring/preview`, data),

  previewGoalPrioritization: (monthStr: string, data: GoalPrioritizationRequest) =>
    apiClient.post(`/months/${monthStr}/goal-prioritization/preview`, data),

  previewDebtStrategy: (monthStr: string, data: DebtStrategyRequest) =>
    apiClient.post(`/months/${monthStr}/debt-strategy/preview`, data),

  previewGoalDebtTradeoff: (monthStr: string, data: PreviewGoalDebtTradeoffRequest) =>
    apiClient.post(`/months/${monthStr}/goal-debt-tradeoff/preview`, data),

  previewBudgetAllocation: (monthStr: string, data: PreviewBudgetAllocationRequest) =>
    apiClient.post(`/months/${monthStr}/budget-allocation/preview`, data),

  // ==================== Apply Endpoints ====================

  applyGoalPrioritization: (monthStr: string, data: ApplyGoalPrioritizationRequest) =>
    apiClient.post(`/months/${monthStr}/goal-prioritization/apply`, data),

  applyDebtStrategy: (monthStr: string, data: ApplyDebtStrategyRequest) =>
    apiClient.post(`/months/${monthStr}/debt-strategy/apply`, data),

  applyGoalDebtTradeoff: (monthStr: string, data: ApplyGoalDebtTradeoffRequest) =>
    apiClient.post(`/months/${monthStr}/goal-debt-tradeoff/apply`, data),

  applyBudgetAllocation: (monthStr: string, data: ApplyBudgetAllocationRequest) =>
    apiClient.post(`/months/${monthStr}/budget-allocation/apply`, data),

  // ==================== Workflow Management ====================

  getWorkflowStatus: (monthStr: string) =>
    apiClient.get(`/months/${monthStr}/workflow/status`),

  resetWorkflow: (monthStr: string) =>
    apiClient.post(`/months/${monthStr}/workflow/reset`, { month_id: monthStr }),

  // ==================== Finalize DSS (Apply All at Once) ====================

  finalizeDSS: (monthStr: string, data: FinalizeDSSRequest): Promise<FinalizeDSSResponse> =>
    apiClient.post(`/months/${monthStr}/dss/finalize`, data),
};

export default dssWorkflowService;
