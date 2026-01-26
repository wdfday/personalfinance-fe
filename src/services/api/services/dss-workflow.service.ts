import { apiClient } from '../client';

// ==================== Types ====================

// Initialize DSS - MUST be called first before any preview/apply
export interface InitializeDSSRequest {
  monthly_income: number;
  goals: Array<{
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    type: string;
    priority?: string;
  }>;
  debts: Array<{
    id: string;
    name: string;
    current_balance: number;
    interest_rate: number;
    minimum_payment: number;
    behavior?: string; // "revolving", "installment", "interest_only"
  }>;
  constraints: Array<{
    id: string;
    name: string;
    category_id: string;
    minimum_amount: number;
    maximum_amount?: number;
    is_flexible: boolean;
    priority?: number;
  }>;
}

export interface InitializeDSSResponse {
  month_id: string;
  status: string;
  expires_in: string;
  message: string;
  goal_count: number;
  debt_count: number;
  constraint_count: number;
  monthly_income: number;
}

// Step 0: Auto-Scoring (no body needed - reads from cache)
export interface AutoScoringRequest {
  month_id: string;
  // Optional: Thử số tiền cấp phát cho goals để tính toán scoring với context budget
  // Nếu có, sẽ dùng để adjust MonthlyIncome context (ví dụ: goal_allocation_pct = 60% => dùng 60% income)
  goal_allocation_pct?: number; // 0-100, optional
  // Goals and income read from Redis cache
}

// Step 1: Goal Prioritization (criteria_weights preferred, criteria_ratings as fallback)
export interface GoalPrioritizationRequest {
  month_id: string;
  criteria_weights?: Record<string, number>; // Direct criteria weights (0-1 scale, preferred)
  criteria_ratings?: Record<string, number>; // Custom criteria ratings (1-10 scale, fallback)
  // Goals read from Redis cache
}

// Step 2: Debt Strategy (only strategy needed)
export interface DebtStrategyRequest {
  month_id: string;
  preferred_strategy?: 'avalanche' | 'snowball' | 'hybrid';
  // Optional: Thử số tiền cấp phát cho goal/debt để tính toán debt strategy với budget constraint
  goal_allocation_pct?: number; // 0-100, optional
  debt_allocation_pct?: number; // 0-100, optional
  // Debts read from Redis cache
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

// Scenario Parameters Override
export interface ScenarioParametersOverride {
  scenario_type: 'safe' | 'balanced';
  goal_contribution_factor?: number; // 0.0-2.0, multiplier for goal contributions
  flexible_spending_level?: number; // 0.0-1.0, 0 = minimum, 1 = maximum
  emergency_fund_percent?: number; // 0.0-1.0, % of surplus to emergency fund
  goals_percent?: number; // 0.0-1.0, % of surplus to goals
  flexible_percent?: number; // 0.0-1.0, % of surplus to flexible spending
}

// Step 3 Preview: Only allocation percentages (reads from cache)
// Note: Step 3 is now Budget Allocation (tradeoff step removed)
export interface PreviewBudgetAllocationRequest {
  month_id: string;
  goal_allocation_pct: number; // User-defined or default
  debt_allocation_pct: number; // User-defined or default
  scenario_overrides?: ScenarioParametersOverride[]; // Optional: custom scenario parameters
  // Constraints, goals, debts read from Redis cache
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
  // ==================== Initialize DSS (MUST call first) ====================
  
  initializeDSS: (monthStr: string, data: InitializeDSSRequest): Promise<InitializeDSSResponse> =>
    apiClient.post(`/months/${monthStr}/dss/initialize`, data),

  // ==================== Preview Endpoints ====================
  
  previewAutoScoring: (monthStr: string, data: AutoScoringRequest) =>
    apiClient.post(`/months/${monthStr}/auto-scoring/preview`, data),

  previewGoalPrioritization: (monthStr: string, data: GoalPrioritizationRequest) =>
    apiClient.post(`/months/${monthStr}/goal-prioritization/preview`, data),

  previewDebtStrategy: (monthStr: string, data: DebtStrategyRequest) =>
    apiClient.post(`/months/${monthStr}/dss/debt-strategy/preview`, data),

  // Step 3 tradeoff removed - no longer available
  // previewGoalDebtTradeoff: removed

  previewBudgetAllocation: (monthStr: string, data: PreviewBudgetAllocationRequest) =>
    apiClient.post(`/months/${monthStr}/budget-allocation/preview`, data),

  // ==================== Apply Endpoints ====================

  applyGoalPrioritization: (monthStr: string, data: ApplyGoalPrioritizationRequest) =>
    apiClient.post(`/months/${monthStr}/goal-prioritization/apply`, data),

  applyDebtStrategy: (monthStr: string, data: ApplyDebtStrategyRequest) =>
    apiClient.post(`/months/${monthStr}/dss/debt-strategy/apply`, data),

  // Step 3 tradeoff removed - no longer available
  // applyGoalDebtTradeoff: removed

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
