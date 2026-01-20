// Month/Planning Types
// Item type classification for CategoryState
export type ItemType = "CONSTRAINT" | "GOAL" | "DEBT";

// Category state with type classification
export interface CategoryState {
  category_id: string;
  type: ItemType; // Distinguishes constraints from goals/debts
  rollover: number;
  assigned: number;
  activity: number;
  available?: number; // Calculated: rollover + assigned + activity
  goal_target?: number;
  debt_min_payment?: number;
  notes?: string;
}

// Month status
export type MonthStatus = "OPEN" | "CLOSED";

// Input snapshot for DSS
export interface InputSnapshot {
  constraints: ConstraintSnapshot[];
  goals: GoalSnapshot[];
  debts: DebtSnapshot[];
  totals: {
    projected_income: number;
    total_tbb: number;
  };
}

export interface ConstraintSnapshot {
  constraint_id: string;
  category_id: string;
  name: string;
  min_amount: number;
  max_amount?: number;
}

export interface GoalSnapshot {
  goal_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  priority: number;
}

export interface DebtSnapshot {
  debt_id: string;
  name: string;
  original_amount: number;
  current_balance: number;
  min_payment: number;
  interest_rate: number;
}

// DSS Result
export interface DSSResult {
  executed_at: string;
  solver_type: string;
  input_summary: Record<string, number>;
  allocations: CategoryAllocation[];
  feasible: boolean;
  score?: number;
  warnings?: string[];
  explanations?: string[];
}

export interface CategoryAllocation {
  category_id: string;
  amount: number;
}

// Month State (immutable snapshot)
export interface MonthState {
  version: number;
  created_at: string;
  is_applied: boolean;
  to_be_budgeted: number;
  actual_income: number;
  category_states: Record<string, CategoryState>;
  constraints: ConstraintSnapshot[];
  goals: GoalSnapshot[];
  debts: DebtSnapshot[];
  input?: InputSnapshot;
  dss_result?: DSSResult;
  dss_executions: string[];
}

// Month snapshot when closed
export interface MonthClosedSnapshot {
  closed_at: string;
  closed_by: string;
  is_auto_close: boolean;
  projected_income: number;
  total_income_received: number;
  income_variance: number;
  total_spent: number;
  final_tbb: number;
  category_rollovers: Record<string, number>;
  overspent_categories: string[];
  dss_iteration_count: number;
  applied_iteration?: number;
}

// Main Month entity
export interface Month {
  id: string;
  user_id: string;
  month: string; // "2024-01"
  start_date: string;
  end_date: string;
  status: MonthStatus;
  states: MonthState[]; // Immutable array, append-only
  closed_at?: string;
  closed_snapshot?: MonthClosedSnapshot;
  version: number;
  created_at: string;
  updated_at: string;
}

// Month view response (simplified for UI)
export interface MonthViewResponse {
  month_id: string;
  user_id: string;
  month: string; // "2024-01"
  start_date: string;
  end_date: string;
  status: string; // "OPEN" | "CLOSED"
  income: number;
  budgeted: number;
  activity: number;
  to_be_budgeted: number;
  categories: CategoryLineResponse[];
  created_at: string;
  updated_at: string;
}

export interface CategoryLineResponse {
  category_id: string;
  name: string;
  rollover: number;
  assigned: number;
  activity: number;
  available: number;
  goal_target?: number;
  debt_min_payment?: number;
  notes?: string;
}

export interface CreateMonthRequest {
  budget_id: string;
  month: string;
}

export interface AssignCategoryRequest {
  month_id: string;
  category_id: string;
  amount: number;
}

export interface MoveMoneyRequest {
  month_id: string;
  from_category_id: string;
  to_category_id: string;
  amount: number;
}

export interface PlanningIterationResponse {
  month_id: string;
  version: number;
  total: number;
  is_latest: boolean;
  projected_income: number;
  total_constraints: number;
  total_goal_targets: number;
  total_debt_minimum: number;
  total_adhoc: number;
  disposable: number;
  to_be_budgeted: number;
  created_at: string;
}

export interface RecalculatePlanningRequest {
  month_id: string;
  selected_goal_ids?: string[];
  selected_debt_ids?: string[];
  adhoc_expenses?: AdHocExpenseInput[];
  adhoc_income?: AdHocIncomeInput[];
  projected_income_override?: number;
}

export interface AdHocExpenseInput {
  name: string;
  amount: number;
  category_id?: string;
  category_hint?: string;
  notes?: string;
}

export interface AdHocIncomeInput {
  name: string;
  amount: number;
  notes?: string;
}

// ========== DSS (Decision Support System) Types ==========

// DSS Status
export type DSSStatus = "pending" | "completed" | "failed";

// DSS Input Summary
export interface DSSInputSummary {
  total_income: number;
  total_expenses: number;
  total_tbb: number;
  goal_count: number;
  debt_count: number;
  category_count: number;
}

// Budget Allocation Result
export interface BudgetAllocationResult {
  recommendations: Record<string, number>; // categoryId -> amount
  optimality_score: number; // 0-100
  method: string; // "linear_programming", "heuristic"
  constraints?: string[];
}

// Goal Priority Result
export interface GoalPriorityResult {
  rankings: GoalRanking[];
  total_score: number;
  method: string; // "meta_gp", "ahp", "weighted"
}

export interface GoalRanking {
  goal_id: string;
  goal_name: string;
  rank: number;
  score: number;
  suggested_amount: number;
  rationale?: string;
}

// Debt Strategy Result
export interface DebtStrategyResult {
  strategy: string; // "avalanche", "snowball", "hybrid"
  payment_plan: DebtPaymentPlan[];
  total_interest_saved: number;
  payoff_months: number;
  monthly_payment: number;
}

export interface DebtPaymentPlan {
  debt_id: string;
  debt_name: string;
  priority: number;
  min_payment: number;
  extra_payment: number;
  total_payment: number;
}

// Tradeoff Result
export interface TradeoffResult {
  scenarios: TradeoffScenario[];
  recommendation: string;
  optimal_index: number;
}

export interface TradeoffScenario {
  name: string;
  goal_allocation: number;
  debt_allocation: number;
  risk_score: number; // 0-100, lower is better
  time_to_goals: number; // months
  debt_free_in: number; // months
  total_interest: number;
  financial_health: number; // 0-100, higher is better
}

// DSS Preview Request
export interface PreviewDSSRequest {
  month_id: string;
  user_id?: string;
  modules: string[]; // ["budget_allocation", "goal_priorities", "debt_strategy", "tradeoffs"]
}

// DSS Preview Response
export interface DSSPreviewResponse {
  execution_id: string;
  previewed_at: string;
  expires_at: string;
  status: DSSStatus;
  error?: string;

  // Module results
  budget_allocation?: BudgetAllocationResult;
  goal_priorities?: GoalPriorityResult;
  debt_strategy?: DebtStrategyResult;
  tradeoffs?: TradeoffResult;
  cashflow_forecast?: any; // Not fully typed yet

  // Input summary
  input_summary?: DSSInputSummary;
}

// DSS Save Request
export interface SaveDSSRequest {
  month_id: string;
  execution_id: string;
  user_id?: string;
  notes?: string;
}

// DSS Execution Response (saved execution)
export interface DSSExecutionResponse {
  id: string;
  executed_at: string;
  executed_by: string;
  status: DSSStatus;
  notes?: string;
  error?: string;

  // Module results
  budget_allocation?: BudgetAllocationResult;
  goal_priorities?: GoalPriorityResult;
  debt_strategy?: DebtStrategyResult;
  tradeoffs?: TradeoffResult;
  cashflow_forecast?: any;

  // Input summary
  input_summary?: DSSInputSummary;
}

// DSS History Response
export interface DSSHistoryResponse {
  month_id: string;
  month: string;
  has_executions: boolean;
  execution_count: number;
  executions: DSSExecutionResponse[];
}
