// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Types based on backend DTOs
export interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateAccountRequest {
  name: string
  type: 'cash' | 'bank' | 'e_wallet' | 'credit_card'
  balance: number
}

export interface UpdateAccountRequest {
  name?: string
  type?: 'cash' | 'bank' | 'e_wallet' | 'credit_card'
}

export interface AccountListResponse {
  accounts: Account[]
  total: number
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id?: string
  type: 'income' | 'expense' | 'transfer' | 'investment'
  sub_type: string
  amount: number
  currency: string
  exchange_rate: number
  base_amount: number
  description: string
  note: string
  date: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  reference: string
  tags: string[]
  location: string
  merchant: string
  is_recurring: boolean
  recurring_id?: string
  is_tax_deductible: boolean
  tax_amount: number
  fee: number
  last_updated: string
  income_profile_id?: string
}

export interface CreateTransactionRequest {
  account_id: string
  category_id?: string
  type: 'income' | 'expense' | 'transfer' | 'investment'
  sub_type: string
  amount: number
  currency: string
  description: string
  note?: string
  date: string
  tags?: string[]
  location?: string
  merchant?: string
  is_tax_deductible?: boolean
  tax_amount?: number
  fee?: number
  income_profile_id?: string
}

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  category_id?: string
  account_id?: string
  amount: number
  currency: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  start_date: string
  end_date?: string
  spent_amount: number
  remaining_amount: number
  percentage_spent: number
  status: 'active' | 'warning' | 'exceeded' | 'paused' | 'expired'
  enable_alerts: boolean
  alert_thresholds: string[]
  allow_rollover: boolean
  carry_over_percent?: number
  rollover_amount?: number
  created_at: string
  updated_at: string
}

export interface CreateBudgetRequest {
  name: string
  description?: string
  category_id?: string
  account_id?: string
  amount: number
  currency: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  start_date: string
  end_date?: string
  enable_alerts?: boolean
  alert_thresholds?: string[]
  allow_rollover?: boolean
  carry_over_percent?: number
}

export interface BudgetConstraint {
  id: string
  user_id: string
  category_id: string
  category_name?: string
  minimum_amount: number
  maximum_amount?: number
  is_flexible: boolean
  priority: number
  period: string
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface CreateBudgetConstraintRequest {
  category_id: string
  minimum_amount: number
  maximum_amount?: number
  is_flexible: boolean
  priority: number
  start_date: string
  end_date?: string
}

export interface BudgetFilters {
  status?: 'active' | 'warning' | 'exceeded' | 'paused' | 'expired'
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  category_id?: string
  account_id?: string
}

export interface BudgetConstraintSummary {
  total_mandatory_expenses: number
  active_count: number
  total_flexible: number
  total_fixed: number
  count: number
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string
  status: 'active' | 'completed' | 'cancelled' | 'paused'
  priority: 'low' | 'medium' | 'high'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateGoalRequest {
  name: string
  description: string
  target_amount: number
  currency: string
  target_date: string
  priority: 'low' | 'medium' | 'high'
  category: string
}

export interface Investment {
  id: string
  user_id: string
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate'
  quantity: number
  purchase_price: number
  current_price: number
  currency: string
  purchase_date: string
  current_value: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvestmentRequest {
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate'
  quantity: number
  purchase_price: number
  currency: string
  purchase_date: string
}

export interface Category {
  id: string
  user_id?: string
  name: string
  type: 'income' | 'expense' | 'transfer'
  parent_id?: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  type: 'income' | 'expense' | 'transfer'
  parent_id?: string
  icon: string
  color: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  expires_at: string
}

export interface DSSMetadata {
  stability_score: number
  risk_level: string
  confidence: number
  variance: number
  trend: string
  recommended_savings_rate: number
  last_analyzed: string
  analysis_version: string
}

export interface IncomeProfile {
  id: string
  user_id: string
  start_date?: string
  end_date?: string
  duration_days?: number
  source: string
  amount: number
  currency: string
  frequency: string
  base_salary: number
  bonus: number
  commission: number
  allowance: number
  other_income: number
  total_income: number
  income_breakdown?: Record<string, number>
  status: string
  is_recurring: boolean
  is_verified: boolean
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

export interface CreateIncomeProfileRequest {
  source: string
  amount: number
  currency: string
  frequency: string
  start_date?: string
  end_date?: string
  base_salary?: number
  bonus?: number
  commission?: number
  allowance?: number
  other_income?: number
  description?: string
  tags?: string[]
  is_recurring?: boolean
}

export interface UpdateIncomeProfileRequest {
  source?: string
  amount?: number
  frequency?: string
  start_date?: string
  end_date?: string
  base_salary?: number
  bonus?: number
  commission?: number
  allowance?: number
  other_income?: number
  description?: string
  tags?: string[]
  is_recurring?: boolean
}

export interface IncomeProfileListResponse {
  income_profiles: IncomeProfile[]
  count: number
  summary?: IncomeSummaryResponse
}

export interface IncomeSummaryResponse {
  total_monthly_income: number
  total_yearly_income: number
  active_income_count: number
  recurring_income_count: number
  average_stability?: number
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const json = await response.json()
    // API returns { status, message, data } wrapper
    return json.data !== undefined ? json.data : json
  }

  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  public async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  public async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<{ user: User; token: { access_token: string; expires_in: number } }>('/auth/login', credentials)
    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token.access_token)
      this.token = response.token.access_token
    }
    return {
      user: response.user,
      token: response.token.access_token,
      expires_at: new Date(Date.now() + response.token.expires_in * 1000).toISOString()
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<{ user: User; token: { access_token: string; expires_in: number } }>('/auth/register', userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token.access_token)
      this.token = response.token.access_token
    }
    return {
      user: response.user,
      token: response.token.access_token,
      expires_at: new Date(Date.now() + response.token.expires_in * 1000).toISOString()
    }
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout', {})
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        this.token = null
      }
    }
  }

  // Account methods
  async getAccounts(): Promise<AccountListResponse> {
    const response = await this.get<{ items: Account[]; total: number }>('/accounts/')
    return { accounts: response.items, total: response.total }
  }

  async getAccount(id: string): Promise<Account> {
    return this.get<Account>(`/accounts/${id}`)
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    return this.post<Account>('/accounts', account)
  }

  async updateAccount(id: string, account: UpdateAccountRequest): Promise<Account> {
    return this.put<Account>(`/accounts/${id}`, account)
  }

  async deleteAccount(id: string): Promise<void> {
    return this.delete<void>(`/accounts/${id}`)
  }

  // Transaction methods
  async getTransactions(params?: {
    account_id?: string
    category_id?: string
    type?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.get<{ transactions: Transaction[]; total: number }>(`/transactions${queryString}`)
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.get<Transaction>(`/transactions/${id}`)
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    return this.post<Transaction>('/transactions', transaction)
  }

  async updateTransaction(id: string, transaction: Partial<CreateTransactionRequest>): Promise<Transaction> {
    return this.put<Transaction>(`/transactions/${id}`, transaction)
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.delete<void>(`/transactions/${id}`)
  }

  // Budget methods
  async getBudgets(params?: BudgetFilters): Promise<{ budgets: Budget[]; total: number }> {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.get<{ budgets: Budget[]; total: number }>(`/budgets${queryString}`)
  }

  async getBudget(id: string): Promise<Budget> {
    return this.get<Budget>(`/budgets/${id}`)
  }

  async createBudget(budget: CreateBudgetRequest): Promise<Budget> {
    return this.post<Budget>('/budgets', budget)
  }

  async updateBudget(id: string, budget: Partial<CreateBudgetRequest>): Promise<Budget> {
    return this.put<Budget>(`/budgets/${id}`, budget)
  }

  async deleteBudget(id: string): Promise<void> {
    return this.delete<void>(`/budgets/${id}`)
  }

  // Budget Constraint methods
  async getBudgetConstraints(): Promise<BudgetConstraint[]> {
    return this.get<BudgetConstraint[]>('/budget-constraints')
  }

  async getBudgetConstraint(id: string): Promise<BudgetConstraint> {
    return this.get<BudgetConstraint>(`/budget-constraints/${id}`)
  }

  // Goal methods
  async getGoals(): Promise<{ goals: Goal[]; total: number }> {
    return this.get<{ goals: Goal[]; total: number }>('/goals')
  }

  async getGoal(id: string): Promise<Goal> {
    return this.get<Goal>(`/goals/${id}`)
  }

  async createGoal(goal: CreateGoalRequest): Promise<Goal> {
    return this.post<Goal>('/goals', goal)
  }

  async updateGoal(id: string, goal: Partial<CreateGoalRequest>): Promise<Goal> {
    return this.put<Goal>(`/goals/${id}`, goal)
  }

  async deleteGoal(id: string): Promise<void> {
    return this.delete<void>(`/goals/${id}`)
  }

  // Investment methods
  async getInvestments(): Promise<{ investments: Investment[]; total: number }> {
    return this.get<{ investments: Investment[]; total: number }>('/investments')
  }

  async getInvestment(id: string): Promise<Investment> {
    return this.get<Investment>(`/investments/${id}`)
  }

  async createInvestment(investment: CreateInvestmentRequest): Promise<Investment> {
    return this.post<Investment>('/investments', investment)
  }

  async updateInvestment(id: string, investment: Partial<CreateInvestmentRequest>): Promise<Investment> {
    return this.put<Investment>(`/investments/${id}`, investment)
  }

  async deleteInvestment(id: string): Promise<void> {
    return this.delete<void>(`/investments/${id}`)
  }

  // Category methods
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const response = await this.get<{ categories: Category[]; count: number }>('/categories')
    return { categories: response.categories, total: response.count }
  }

  async getCategory(id: string): Promise<Category> {
    return this.get<Category>(`/categories/${id}`)
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    return this.post<Category>('/categories', category)
  }

  async updateCategory(id: string, category: Partial<CreateCategoryRequest>): Promise<Category> {
    return this.put<Category>(`/categories/${id}`, category)
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete<void>(`/categories/${id}`)
  }

  // Income Profile methods
  async getIncomeProfiles(params?: { status?: string, is_recurring?: boolean }): Promise<IncomeProfileListResponse> {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.get<IncomeProfileListResponse>(`/income-profiles${queryString}`)
  }

  async getIncomeProfile(id: string): Promise<IncomeProfile> {
    return this.get<IncomeProfile>(`/income-profiles/${id}`)
  }

  async createIncomeProfile(profile: CreateIncomeProfileRequest): Promise<IncomeProfile> {
    return this.post<IncomeProfile>('/income-profiles', profile)
  }

  async updateIncomeProfile(id: string, profile: UpdateIncomeProfileRequest): Promise<IncomeProfile> {
    return this.put<IncomeProfile>(`/income-profiles/${id}`, profile)
  }

  async deleteIncomeProfile(id: string): Promise<void> {
    return this.delete<void>(`/income-profiles/${id}`)
  }

  // Summary methods
  async getAccountSummary(): Promise<{
    total_balance: number
    total_assets: number
    total_liabilities: number
    net_worth: number
    currency_allocation: Record<string, number>
    account_count: number
    last_updated: string
  }> {
    return this.get('/accounts/summary')
  }

  async getTransactionSummary(params?: {
    period?: string
    start_date?: string
    end_date?: string
  }): Promise<{
    total_income: number
    total_expense: number
    net_amount: number
    transaction_count: number
    category_breakdown: Record<string, number>
    currency_breakdown: Record<string, number>
    last_updated: string
  }> {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.get(`/transactions/summary${queryString}`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
