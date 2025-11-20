// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Import mock API client
import { mockApiClient } from './mock-api'

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
}

export interface Budget {
  id: string
  user_id: string
  name: string
  category_id?: string
  amount: number
  currency: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  spent_amount: number
  remaining_amount: number
  status: 'active' | 'completed' | 'cancelled'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateBudgetRequest {
  name: string
  category_id?: string
  amount: number
  currency: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
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

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
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

    return response.json()
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return mockApiClient.login(credentials)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return mockApiClient.register(userData)
  }

  logout() {
    return mockApiClient.logout()
  }

  // Account methods
  async getAccounts(): Promise<AccountListResponse> {
    return mockApiClient.getAccounts()
  }

  async getAccount(id: number): Promise<Account> {
    return mockApiClient.getAccount(id)
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    return mockApiClient.createAccount(account)
  }

  async updateAccount(id: number, account: UpdateAccountRequest): Promise<Account> {
    return mockApiClient.updateAccount(id, account)
  }

  async deleteAccount(id: number): Promise<void> {
    return mockApiClient.deleteAccount(id)
  }

  // Transaction methods
  async getTransactions(params?: {
    account_id?: string
    type?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ transactions: Transaction[]; total: number }> {
    return mockApiClient.getTransactions(params)
  }

  async getTransaction(id: string): Promise<Transaction> {
    return mockApiClient.getTransaction(id)
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    return mockApiClient.createTransaction(transaction)
  }

  async updateTransaction(id: string, transaction: Partial<CreateTransactionRequest>): Promise<Transaction> {
    return mockApiClient.updateTransaction(id, transaction)
  }

  async deleteTransaction(id: string): Promise<void> {
    return mockApiClient.deleteTransaction(id)
  }

  // Budget methods
  async getBudgets(): Promise<{ budgets: Budget[]; total: number }> {
    return mockApiClient.getBudgets()
  }

  async getBudget(id: string): Promise<Budget> {
    return mockApiClient.getBudget(id)
  }

  async createBudget(budget: CreateBudgetRequest): Promise<Budget> {
    return mockApiClient.createBudget(budget)
  }

  async updateBudget(id: string, budget: Partial<CreateBudgetRequest>): Promise<Budget> {
    return mockApiClient.updateBudget(id, budget)
  }

  async deleteBudget(id: string): Promise<void> {
    return mockApiClient.deleteBudget(id)
  }

  // Goal methods
  async getGoals(): Promise<{ goals: Goal[]; total: number }> {
    return mockApiClient.getGoals()
  }

  async getGoal(id: string): Promise<Goal> {
    return mockApiClient.getGoal(id)
  }

  async createGoal(goal: CreateGoalRequest): Promise<Goal> {
    return mockApiClient.createGoal(goal)
  }

  async updateGoal(id: string, goal: Partial<CreateGoalRequest>): Promise<Goal> {
    return mockApiClient.updateGoal(id, goal)
  }

  async deleteGoal(id: string): Promise<void> {
    return mockApiClient.deleteGoal(id)
  }

  // Investment methods
  async getInvestments(): Promise<{ investments: Investment[]; total: number }> {
    return mockApiClient.getInvestments()
  }

  async getInvestment(id: string): Promise<Investment> {
    return mockApiClient.getInvestment(id)
  }

  async createInvestment(investment: CreateInvestmentRequest): Promise<Investment> {
    return mockApiClient.createInvestment(investment)
  }

  async updateInvestment(id: string, investment: Partial<CreateInvestmentRequest>): Promise<Investment> {
    return mockApiClient.updateInvestment(id, investment)
  }

  async deleteInvestment(id: string): Promise<void> {
    return mockApiClient.deleteInvestment(id)
  }

  // Category methods
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    return mockApiClient.getCategories()
  }

  async getCategory(id: string): Promise<Category> {
    return mockApiClient.getCategory(id)
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    return mockApiClient.createCategory(category)
  }

  async updateCategory(id: string, category: Partial<CreateCategoryRequest>): Promise<Category> {
    return mockApiClient.updateCategory(id, category)
  }

  async deleteCategory(id: string): Promise<void> {
    return mockApiClient.deleteCategory(id)
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
    return mockApiClient.getAccountSummary()
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
    return mockApiClient.getTransactionSummary(params)
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
