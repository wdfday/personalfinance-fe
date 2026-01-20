import { apiClient } from "@/services/api/client"

// --- Budget Allocation (P1) ---

export interface BudgetAllocationInput {
  user_id?: string
  year: number
  month: number
  override_income?: number
  use_all_scenarios?: boolean
  run_sensitivity?: boolean
  
  // Financial data
  total_income: number
  mandatory_expenses: MandatoryExpense[]
  flexible_expenses: FlexibleExpense[]
  debts: DebtInput[]
  goals: GoalInput[]
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
  type?: string
  priority: string // "critical", "high", "medium", "low"
  remaining_amount: number
  suggested_contribution: number
}

export interface BudgetAllocationResult {
  user_id: string
  period: string
  total_income: number
  scenarios: any[] // Complex type, can refine later
  is_feasible: boolean
  global_warnings?: any[]
  metadata: any
}

// --- Debt Strategy (P2) ---

export interface DebtStrategyInput {
  user_id?: string
  debts: DebtInfo[]
  total_debt_budget: number
  preferred_strategy?: "avalanche" | "snowball" | "hybrid" | "cash_flow" | "stress"
}

export interface DebtInfo {
  id: string
  name: string
  type: string
  balance: number
  interest_rate: number
  minimum_payment: number
  is_variable_rate?: boolean
  stress_score?: number
}

export interface DebtStrategyResult {
  recommended_strategy: string
  payment_plans: any[]
  total_interest: number
  months_to_debt_free: number
  strategy_comparison: any[]
}

// --- Goal Prioritization (P3) ---

export interface DirectRatingInput {
  user_id?: string
  goals: GoalForRating[]
  weights?: {
    urgency: number
    importance: number
    roi: number
    effort: number
  }
}

export interface GoalForRating {
    goal_id: string
    name: string
    ratings: {
        urgency: number
        importance: number
        roi: number
        effort: number // 1 (hard) to 10 (easy)
    }
}

export interface GoalPrioritizationResult {
  ranked_goals: any[]
  consistency_ratio: number
  ranking: any[]
}

// --- Service ---

const analyticsService = {
  // P1: Budget Allocation
  allocateBudget: async (data: BudgetAllocationInput): Promise<BudgetAllocationResult> => {
    return apiClient.post("/analytics/budget-allocation", data)
  },

  // P1: Generate Scenarios (Alternative endpoint)
  generateAllocationScenarios: async (data: { user_id: string, year: number, month: number, override_income?: number }): Promise<any> => {
      return apiClient.post("/analytics/budget-allocation/generate", data)
  },

  // P2: Debt Strategy
  simulateDebtStrategy: async (data: DebtStrategyInput): Promise<DebtStrategyResult> => {
    return apiClient.post("/analytics/debt-strategy/simulate", data)
  },

  // P3: Goal Prioritization (Direct Rating)
  prioritizeGoals: async (data: DirectRatingInput): Promise<GoalPrioritizationResult> => {
     return apiClient.post("/analytics/goal-prioritization/direct-rating", data)
  },

  // P6: Tradeoff (Placeholder)
  analyzeTradeoff: async (data: any): Promise<any> => {
    return apiClient.post("/analytics/debt-tradeoff/analyze", data)
  },
}

export default analyticsService
