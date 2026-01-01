/**
 * Summaries Service
 * Lấy thống kê và báo cáo tổng hợp
 */

import { baseApiClient } from './base'

// Types
export interface AccountSummary {
  total_balance: number
  total_assets: number
  total_liabilities: number
  net_worth: number
  currency_allocation: Record<string, number>
  account_count: number
  last_updated: string
}

export interface TransactionSummary {
  total_income: number
  total_expense: number
  net_amount: number
  transaction_count: number
  category_breakdown: Record<string, number>
  currency_breakdown: Record<string, number>
  last_updated: string
}

export interface BudgetSummary {
  total_budgets: number
  active_budgets: number
  total_allocated: number
  total_spent: number
  total_remaining: number
  overspent_count: number
  last_updated: string
}

export interface GoalSummary {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  overdueGoals?: number
  totalTargetAmount: number
  totalCurrentAmount: number
  totalRemaining: number
  overallProgress?: number
  averageProgress: number
  goalsByType?: Record<string, any>
  goalsByPriority?: Record<string, number>
  lastUpdated?: string
}

export interface InvestmentSummary {
  total_investments: number
  total_portfolio_value: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  type_allocation: Record<string, number>
  last_updated: string
}

export interface DashboardSummary {
  accounts: AccountSummary
  transactions: TransactionSummary
  budgets: BudgetSummary
  goals: GoalSummary
  investments: InvestmentSummary
}

export interface TransactionSummaryParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date?: string
  end_date?: string
}

class SummariesService {
  /**
   * Lấy tổng quan accounts
   */
  async getAccountSummary(): Promise<AccountSummary> {
    return baseApiClient.get<AccountSummary>('/summaries/accounts')
  }

  /**
   * Lấy tổng quan transactions
   */
  async getTransactionSummary(params?: TransactionSummaryParams): Promise<TransactionSummary> {
    return baseApiClient.get<TransactionSummary>('/summaries/transactions', params)
  }

  /**
   * Lấy tổng quan budgets
   */
  async getBudgetSummary(): Promise<BudgetSummary> {
    return baseApiClient.get<BudgetSummary>('/summaries/budgets')
  }

  /**
   * Lấy tổng quan goals
   */
  async getGoalSummary(): Promise<GoalSummary> {
    return baseApiClient.get<GoalSummary>('/summaries/goals')
  }

  /**
   * Lấy tổng quan investments
   */
  async getInvestmentSummary(): Promise<InvestmentSummary> {
    return baseApiClient.get<InvestmentSummary>('/summaries/investments')
  }

  /**
   * Lấy tổng quan dashboard (tất cả summaries)
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    // Gọi parallel tất cả summaries
    const [accounts, transactions, budgets, goals, investments] = await Promise.all([
      this.getAccountSummary(),
      this.getTransactionSummary(),
      this.getBudgetSummary(),
      this.getGoalSummary(),
      this.getInvestmentSummary(),
    ])

    return {
      accounts,
      transactions,
      budgets,
      goals,
      investments,
    }
  }

  /**
   * Lấy spending trend theo tháng
   */
  async getSpendingTrend(months: number = 6): Promise<{
    labels: string[]
    income: number[]
    expense: number[]
  }> {
    const data: { labels: string[]; income: number[]; expense: number[] } = {
      labels: [],
      income: [],
      expense: [],
    }

    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const summary = await this.getTransactionSummary({
        start_date: startDate,
        end_date: endDate,
      })

      data.labels.push(
        date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      )
      data.income.push(summary.total_income)
      data.expense.push(Math.abs(summary.total_expense))
    }

    return data
  }

  /**
   * Lấy category spending breakdown
   */
  async getCategoryBreakdown(startDate?: string, endDate?: string): Promise<{
    labels: string[]
    values: number[]
  }> {
    const summary = await this.getTransactionSummary({
      start_date: startDate,
      end_date: endDate,
    })

    const labels: string[] = []
    const values: number[] = []

    Object.entries(summary.category_breakdown).forEach(([category, amount]) => {
      labels.push(category)
      values.push(Math.abs(amount))
    })

    return { labels, values }
  }
}

// Export singleton instance
export const summariesService = new SummariesService()
export default summariesService

