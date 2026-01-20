export interface Month {
    id: string;
    budget_id: string;
    month: string; // "2024-02"
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
    
    // Closed month data (at Month level)
    closed_at?: string;
    closed_snapshot?: MonthClosedSnapshot;
    
    created_at: string;
    updated_at: string;
}

// Full closed snapshot with all financial summary data
export interface MonthClosedSnapshot {
    closed_at: string;
    closed_by?: string;
    is_auto_close: boolean;

    // Income summary
    total_income_received: number;
    projected_income: number;
    income_variance: number;

    // Expense summary
    total_spent: number;
    total_budgeted: number;
    spending_variance: number;

    // Savings summary
    net_savings: number;
    savings_rate: number;

    // TBB summary
    final_tbb: number;
    tbb_start_of_month: number;

    // Category rollovers (carried to next month)
    category_rollovers: Record<string, number>;
    overspent_categories?: string[];

    // Goal/Debt progress
    goal_contributions?: Record<string, number>;
    goals_completed?: string[];
    debt_payments?: Record<string, number>;
    debts_paid_off?: string[];

    // Transaction summary for CSV export
    transaction_count: number;
    income_transactions: number;
    expense_transactions: number;
    category_breakdown?: CategoryTransactionSummary[];

    // DSS usage
    dss_iteration_count: number;
    applied_iteration?: number;
}

export interface CategoryTransactionSummary {
    category_id: string;
    category_name: string;
    transaction_count: number;
    total_amount: number;
    budgeted: number;
    rollover: number;
    available: number;
    variance: number;
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

export interface MonthViewResponse {
    month_id: string;
    budget_id: string;
    month: string;
    start_date: string;
    end_date: string;
    status: string;
    to_be_budgeted: number;
    income: number;
    budgeted: number;
    activity: number;
    categories: CategoryLineResponse[];
    created_at: string;
    updated_at: string;
}

export interface CreateMonthRequest {
    budget_id: string;
    month: string; // "2024-02"
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

// ===== Planning Iteration Types =====

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

export interface RecalculatePlanningRequest {
    month_id: string;
    selected_goal_ids?: string[];
    selected_debt_ids?: string[];
    adhoc_expenses?: AdHocExpenseInput[];
    adhoc_income?: AdHocIncomeInput[];
    projected_income_override?: number;
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

// ===== Input Snapshot Types =====

export interface IncomeSnapshot {
    profile_id?: string;
    name: string;
    amount: number;
    is_recurring: boolean;
    frequency?: string;
    source_type: string;
    is_confirmed: boolean;
}

export interface ConstraintSnapshot {
    constraint_id?: string;
    name: string;
    category_id: string;
    type: string;
    amount: number;
    is_recurring: boolean;
    source_type: string;
}

export interface GoalSnapshot {
    goal_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    progress: number;
    priority: number;
    deadline?: string;
    monthly_target: number;
    is_selected: boolean;
}

export interface DebtSnapshot {
    debt_id: string;
    name: string;
    current_balance: number;
    interest_rate: number;
    min_payment: number;
    progress: number;
    is_selected: boolean;
}

export interface InputTotals {
    projected_income: number;
    recurring_income: number;
    total_constraints: number;
    total_goal_targets: number;
    total_debt_minimum: number;
    total_adhoc: number;
    disposable: number;
}

export interface InputSnapshot {
    captured_at: string;
    income_profiles: IncomeSnapshot[];
    constraints: ConstraintSnapshot[];
    goals: GoalSnapshot[];
    debts: DebtSnapshot[];
    adhoc_expenses: AdHocExpenseInput[];
    adhoc_income: AdHocIncomeInput[];
    totals: InputTotals;
}

// ===== Month State Types =====

export interface MonthState {
    version: number;
    created_at: string;
    is_applied: boolean;
    tbb: number;
    actual_income: number;
    categories: Record<string, CategoryState>;
    input?: InputSnapshot;
    dss_result?: DSSResult;
}

export interface CategoryState {
    category_id: string;
    rollover: number;
    assigned: number;
    activity: number;
    available: number;
    goal_target?: number;
    debt_min_payment?: number;
    notes?: string;
}

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
    name: string;
    amount: number;
    priority: number;
    source: string;
}

