// Mock API Client for development
import { 
  mockAccounts, 
  mockTransactions, 
  mockBudgets, 
  mockGoals, 
  mockInvestments, 
  mockCategories,
  mockAccountSummary,
  mockTransactionSummary,
  mockUser,
  mockAuthToken,
  mockAuthResponse
} from './mock-data'

// Fixed timestamp to avoid hydration mismatch
const FIXED_TIMESTAMP = '2024-01-20T14:22:00Z'

import { 
  Account, 
  CreateAccountRequest, 
  UpdateAccountRequest, 
  Transaction, 
  CreateTransactionRequest,
  Budget,
  CreateBudgetRequest,
  Goal,
  CreateGoalRequest,
  Investment,
  CreateInvestmentRequest,
  Category,
  CreateCategoryRequest,
  AccountListResponse
} from './api'

// Mock API Client Class
class MockApiClient {
  // Auth methods
  async login(credentials: { email: string; password: string }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful login
        const response = {
          user: mockUser,
          token: mockAuthToken,
          expires_at: '2024-12-31T23:59:59Z'
        }
        resolve(response)
      }, 500)
    })
  }

  async register(userData: { email: string; password: string; full_name: string; phone?: string }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful registration
        const response = {
          user: {
            ...mockUser,
            email: userData.email,
            full_name: userData.full_name,
            phone: userData.phone || ''
          },
          token: mockAuthToken,
          expires_at: '2024-12-31T23:59:59Z'
        }
        resolve(response)
      }, 500)
    })
  }

  async checkAuth() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful auth check
        const response = {
          user: mockUser,
          token: mockAuthToken
        }
        resolve(response)
      }, 300)
    })
  }

  logout() {
    // Simulate logout
    return Promise.resolve()
  }
  // Account methods
  async getAccounts(): Promise<AccountListResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          accounts: mockAccounts,
          total: mockAccounts.length
        })
      }, 500) // Simulate network delay
    })
  }

  async getAccount(id: number): Promise<Account> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const account = mockAccounts.find(acc => acc.id === id)
        if (!account) {
          reject(new Error('Account not found'))
        } else {
          resolve(account)
        }
      }, 300)
    })
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAccount: Account = {
          id: Math.max(...mockAccounts.map(a => a.id)) + 1,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: 'USD',
          icon: '🏦',
          color: '#3b82f6',
          is_active: true,
          created_at: FIXED_TIMESTAMP,
          updated_at: FIXED_TIMESTAMP
        }
        mockAccounts.push(newAccount)
        resolve(newAccount)
      }, 500)
    })
  }

  async updateAccount(id: number, account: UpdateAccountRequest): Promise<Account> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAccounts.findIndex(acc => acc.id === id)
        if (index === -1) {
          reject(new Error('Account not found'))
        } else {
          const updatedAccount = {
            ...mockAccounts[index],
            ...account,
            updated_at: FIXED_TIMESTAMP
          }
          mockAccounts[index] = updatedAccount
          resolve(updatedAccount)
        }
      }, 500)
    })
  }

  async deleteAccount(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAccounts.findIndex(acc => acc.id === id)
        if (index === -1) {
          reject(new Error('Account not found'))
        } else {
          mockAccounts.splice(index, 1)
          resolve()
        }
      }, 500)
    })
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
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTransactions = [...mockTransactions]
        
        if (params?.account_id) {
          filteredTransactions = filteredTransactions.filter(t => t.account_id === params.account_id)
        }
        if (params?.type) {
          filteredTransactions = filteredTransactions.filter(t => t.type === params.type)
        }
        if (params?.limit) {
          filteredTransactions = filteredTransactions.slice(0, params.limit)
        }
        
        resolve({
          transactions: filteredTransactions,
          total: filteredTransactions.length
        })
      }, 500)
    })
  }

  async getTransaction(id: string): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const transaction = mockTransactions.find(t => t.id === id)
        if (!transaction) {
          reject(new Error('Transaction not found'))
        } else {
          resolve(transaction)
        }
      }, 300)
    })
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTransaction: Transaction = {
          id: (Math.max(...mockTransactions.map(t => parseInt(t.id))) + 1).toString(),
          user_id: '1',
          account_id: transaction.account_id,
          category_id: transaction.category_id,
          type: transaction.type,
          sub_type: transaction.sub_type,
          amount: transaction.amount,
          currency: transaction.currency,
          exchange_rate: 1.0,
          base_amount: transaction.amount,
          description: transaction.description,
          note: transaction.note || '',
          date: transaction.date,
          status: 'completed',
          reference: `TXN${Math.floor(Math.random() * 1000000)}`,
          tags: transaction.tags || [],
          location: transaction.location || '',
          merchant: transaction.merchant || '',
          is_recurring: false,
          is_tax_deductible: transaction.is_tax_deductible || false,
          tax_amount: transaction.tax_amount || 0,
          fee: transaction.fee || 0,
          last_updated: FIXED_TIMESTAMP
        }
        mockTransactions.unshift(newTransaction)
        resolve(newTransaction)
      }, 500)
    })
  }

  async updateTransaction(id: string, transaction: Partial<CreateTransactionRequest>): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransactions.findIndex(t => t.id === id)
        if (index === -1) {
          reject(new Error('Transaction not found'))
        } else {
          const updatedTransaction = {
            ...mockTransactions[index],
            ...transaction,
            last_updated: FIXED_TIMESTAMP
          }
          mockTransactions[index] = updatedTransaction
          resolve(updatedTransaction)
        }
      }, 500)
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransactions.findIndex(t => t.id === id)
        if (index === -1) {
          reject(new Error('Transaction not found'))
        } else {
          mockTransactions.splice(index, 1)
          resolve()
        }
      }, 500)
    })
  }

  // Budget methods
  async getBudgets(): Promise<{ budgets: Budget[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          budgets: mockBudgets,
          total: mockBudgets.length
        })
      }, 500)
    })
  }

  async getBudget(id: string): Promise<Budget> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const budget = mockBudgets.find(b => b.id === id)
        if (!budget) {
          reject(new Error('Budget not found'))
        } else {
          resolve(budget)
        }
      }, 300)
    })
  }

  async createBudget(budget: CreateBudgetRequest): Promise<Budget> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBudget: Budget = {
          id: (Math.max(...mockBudgets.map(b => parseInt(b.id))) + 1).toString(),
          user_id: '1',
          name: budget.name,
          category_id: budget.category_id,
          amount: budget.amount,
          currency: budget.currency,
          period: budget.period,
          start_date: budget.start_date,
          end_date: budget.end_date,
          spent_amount: 0,
          remaining_amount: budget.amount,
          status: 'active',
          is_active: true,
          created_at: FIXED_TIMESTAMP,
          updated_at: FIXED_TIMESTAMP
        }
        mockBudgets.push(newBudget)
        resolve(newBudget)
      }, 500)
    })
  }

  async updateBudget(id: string, budget: Partial<CreateBudgetRequest>): Promise<Budget> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockBudgets.findIndex(b => b.id === id)
        if (index === -1) {
          reject(new Error('Budget not found'))
        } else {
          const updatedBudget = {
            ...mockBudgets[index],
            ...budget,
            updated_at: FIXED_TIMESTAMP
          }
          mockBudgets[index] = updatedBudget
          resolve(updatedBudget)
        }
      }, 500)
    })
  }

  async deleteBudget(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockBudgets.findIndex(b => b.id === id)
        if (index === -1) {
          reject(new Error('Budget not found'))
        } else {
          mockBudgets.splice(index, 1)
          resolve()
        }
      }, 500)
    })
  }

  // Goal methods
  async getGoals(): Promise<{ goals: Goal[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          goals: mockGoals,
          total: mockGoals.length
        })
      }, 500)
    })
  }

  async getGoal(id: string): Promise<Goal> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goal = mockGoals.find(g => g.id === id)
        if (!goal) {
          reject(new Error('Goal not found'))
        } else {
          resolve(goal)
        }
      }, 300)
    })
  }

  async createGoal(goal: CreateGoalRequest): Promise<Goal> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGoal: Goal = {
          id: (Math.max(...mockGoals.map(g => parseInt(g.id))) + 1).toString(),
          user_id: '1',
          name: goal.name,
          description: goal.description,
          target_amount: goal.target_amount,
          current_amount: 0,
          currency: goal.currency,
          target_date: goal.target_date,
          status: 'active',
          priority: goal.priority,
          category: goal.category,
          is_active: true,
          created_at: FIXED_TIMESTAMP,
          updated_at: FIXED_TIMESTAMP
        }
        mockGoals.push(newGoal)
        resolve(newGoal)
      }, 500)
    })
  }

  async updateGoal(id: string, goal: Partial<CreateGoalRequest>): Promise<Goal> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockGoals.findIndex(g => g.id === id)
        if (index === -1) {
          reject(new Error('Goal not found'))
        } else {
          const updatedGoal = {
            ...mockGoals[index],
            ...goal,
            updated_at: FIXED_TIMESTAMP
          }
          mockGoals[index] = updatedGoal
          resolve(updatedGoal)
        }
      }, 500)
    })
  }

  async deleteGoal(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockGoals.findIndex(g => g.id === id)
        if (index === -1) {
          reject(new Error('Goal not found'))
        } else {
          mockGoals.splice(index, 1)
          resolve()
        }
      }, 500)
    })
  }

  // Investment methods
  async getInvestments(): Promise<{ investments: Investment[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          investments: mockInvestments,
          total: mockInvestments.length
        })
      }, 500)
    })
  }

  async getInvestment(id: string): Promise<Investment> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const investment = mockInvestments.find(i => i.id === id)
        if (!investment) {
          reject(new Error('Investment not found'))
        } else {
          resolve(investment)
        }
      }, 300)
    })
  }

  async createInvestment(investment: CreateInvestmentRequest): Promise<Investment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInvestment: Investment = {
          id: (Math.max(...mockInvestments.map(i => parseInt(i.id))) + 1).toString(),
          user_id: '1',
          symbol: investment.symbol,
          name: investment.name,
          type: investment.type,
          quantity: investment.quantity,
          purchase_price: investment.purchase_price,
          current_price: investment.purchase_price, // Initially same as purchase price
          currency: investment.currency,
          purchase_date: investment.purchase_date,
          current_value: investment.quantity * investment.purchase_price,
          total_gain_loss: 0,
          total_gain_loss_percentage: 0,
          is_active: true,
          created_at: FIXED_TIMESTAMP,
          updated_at: FIXED_TIMESTAMP
        }
        mockInvestments.push(newInvestment)
        resolve(newInvestment)
      }, 500)
    })
  }

  async updateInvestment(id: string, investment: Partial<CreateInvestmentRequest>): Promise<Investment> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockInvestments.findIndex(i => i.id === id)
        if (index === -1) {
          reject(new Error('Investment not found'))
        } else {
          const updatedInvestment = {
            ...mockInvestments[index],
            ...investment,
            updated_at: FIXED_TIMESTAMP
          }
          mockInvestments[index] = updatedInvestment
          resolve(updatedInvestment)
        }
      }, 500)
    })
  }

  async deleteInvestment(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockInvestments.findIndex(i => i.id === id)
        if (index === -1) {
          reject(new Error('Investment not found'))
        } else {
          mockInvestments.splice(index, 1)
          resolve()
        }
      }, 500)
    })
  }

  // Category methods
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          categories: mockCategories,
          total: mockCategories.length
        })
      }, 500)
    })
  }

  async getCategory(id: string): Promise<Category> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const category = mockCategories.find(c => c.id === id)
        if (!category) {
          reject(new Error('Category not found'))
        } else {
          resolve(category)
        }
      }, 300)
    })
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory: Category = {
          id: (Math.max(...mockCategories.map(c => parseInt(c.id))) + 1).toString(),
          user_id: '1',
          name: category.name,
          type: category.type,
          parent_id: category.parent_id,
          icon: category.icon,
          color: category.color,
          is_active: true,
          created_at: FIXED_TIMESTAMP,
          updated_at: FIXED_TIMESTAMP
        }
        mockCategories.push(newCategory)
        resolve(newCategory)
      }, 500)
    })
  }

  async updateCategory(id: string, category: Partial<CreateCategoryRequest>): Promise<Category> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id)
        if (index === -1) {
          reject(new Error('Category not found'))
        } else {
          const updatedCategory = {
            ...mockCategories[index],
            ...category,
            updated_at: FIXED_TIMESTAMP
          }
          mockCategories[index] = updatedCategory
          resolve(updatedCategory)
        }
      }, 500)
    })
  }

  async deleteCategory(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id)
        if (index === -1) {
          reject(new Error('Category not found'))
        } else {
          mockCategories.splice(index, 1)
          resolve()
        }
      }, 500)
    })
  }

  // Summary methods
  async getAccountSummary(): Promise<typeof mockAccountSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAccountSummary)
      }, 500)
    })
  }

  async getTransactionSummary(params?: {
    period?: string
    start_date?: string
    end_date?: string
  }): Promise<typeof mockTransactionSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTransactionSummary)
      }, 500)
    })
  }
}

// Export singleton instance
export const mockApiClient = new MockApiClient()
export default mockApiClient
