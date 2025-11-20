/**
 * API Services - Usage Examples
 * Các ví dụ về cách sử dụng API services
 */

import {
  authService,
  accountsService,
  transactionsService,
  budgetsService,
  goalsService,
  investmentsService,
  categoriesService,
  summariesService,
} from './index'

/**
 * Example 1: Authentication Flow
 */
export async function authenticationExample() {
  try {
    // Đăng ký user mới
    const registerResponse = await authService.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      full_name: 'John Doe',
      phone: '+1234567890',
    })
    console.log('Registered user:', registerResponse.user)

    // Đăng nhập
    const loginResponse = await authService.login({
      username: 'johndoe',
      password: 'password123',
    })
    console.log('Logged in user:', loginResponse.user)
    console.log('Token:', loginResponse.access_token)

    // Lấy thông tin user hiện tại
    const currentUser = await authService.getCurrentUser()
    console.log('Current user:', currentUser)

    // Cập nhật profile
    const updatedUser = await authService.updateProfile({
      full_name: 'John Updated Doe',
      phone: '+0987654321',
    })
    console.log('Updated user:', updatedUser)

    // Đăng xuất
    authService.logout()
    console.log('Logged out')
  } catch (error) {
    console.error('Auth error:', error)
  }
}

/**
 * Example 2: Accounts Management
 */
export async function accountsExample() {
  try {
    // Tạo các accounts
    const checkingAccount = await accountsService.createAccount({
      name: 'Checking Account',
      type: 'bank',
      balance: 5000,
      currency: 'USD',
      icon: '🏦',
      color: '#3b82f6',
    })

    const savingsAccount = await accountsService.createAccount({
      name: 'Savings Account',
      type: 'bank',
      balance: 10000,
      currency: 'USD',
      icon: '💰',
      color: '#10b981',
    })

    const wallet = await accountsService.createAccount({
      name: 'MoMo Wallet',
      type: 'e_wallet',
      balance: 500,
      currency: 'USD',
      icon: '📱',
      color: '#ec4899',
    })

    // Lấy danh sách accounts
    const { accounts, total } = await accountsService.getAccounts()
    console.log(`Total accounts: ${total}`)
    accounts.forEach((acc) => {
      console.log(`- ${acc.name}: $${acc.balance}`)
    })

    // Lấy tổng số dư
    const totalBalance = await accountsService.getTotalBalance()
    console.log(`Total balance: $${totalBalance.total}`)

    // Cập nhật account
    await accountsService.updateAccount(checkingAccount.id, {
      balance: 5500,
    })

    // Xóa account
    // await accountsService.deleteAccount(wallet.id)
  } catch (error) {
    console.error('Accounts error:', error)
  }
}

/**
 * Example 3: Transactions Management
 */
export async function transactionsExample() {
  try {
    // Tạo income transaction
    const incomeTransaction = await transactionsService.createTransaction({
      account_id: '1',
      category_id: '1',
      type: 'income',
      amount: 5000,
      currency: 'USD',
      description: 'Monthly salary',
      date: new Date().toISOString(),
      tags: ['salary', 'monthly'],
    })

    // Tạo expense transaction
    const expenseTransaction = await transactionsService.createTransaction({
      account_id: '1',
      category_id: '5',
      type: 'expense',
      amount: -125.5,
      currency: 'USD',
      description: 'Grocery shopping',
      date: new Date().toISOString(),
      tags: ['food', 'grocery'],
      merchant: 'Walmart',
    })

    // Lấy transactions với filter
    const { transactions } = await transactionsService.getTransactions({
      type: 'expense',
      start_date: new Date(2024, 0, 1).toISOString(),
      end_date: new Date(2024, 11, 31).toISOString(),
      limit: 20,
    })

    console.log(`Found ${transactions.length} expense transactions`)

    // Lấy recent transactions
    const recentTransactions = await transactionsService.getRecentTransactions(10)
    console.log('Recent transactions:', recentTransactions)

    // Tính tổng thu chi
    const summary = await transactionsService.getTransactionsSummary(
      new Date(2024, 0, 1).toISOString(),
      new Date(2024, 11, 31).toISOString()
    )

    console.log('Transaction Summary:')
    console.log(`- Income: $${summary.totalIncome}`)
    console.log(`- Expense: $${summary.totalExpense}`)
    console.log(`- Net: $${summary.netAmount}`)
  } catch (error) {
    console.error('Transactions error:', error)
  }
}

/**
 * Example 4: Budgets Management
 */
export async function budgetsExample() {
  try {
    // Tạo monthly budget
    const groceryBudget = await budgetsService.createBudget({
      name: 'Monthly Groceries',
      category_id: '5',
      amount: 500,
      currency: 'USD',
      period: 'monthly',
      start_date: new Date(2024, 0, 1).toISOString(),
      end_date: new Date(2024, 0, 31, 23, 59, 59).toISOString(),
    })

    const transportBudget = await budgetsService.createBudget({
      name: 'Monthly Transport',
      category_id: '6',
      amount: 200,
      currency: 'USD',
      period: 'monthly',
      start_date: new Date(2024, 0, 1).toISOString(),
      end_date: new Date(2024, 0, 31, 23, 59, 59).toISOString(),
    })

    // Lấy active budgets
    const activeBudgets = await budgetsService.getActiveBudgets()
    console.log(`Active budgets: ${activeBudgets.length}`)

    activeBudgets.forEach((budget) => {
      const usage = budgetsService.getBudgetUsagePercentage(budget)
      const isExceeded = budgetsService.isBudgetExceeded(budget)

      console.log(`\n${budget.name}:`)
      console.log(`- Budget: $${budget.amount}`)
      console.log(`- Spent: $${budget.spent_amount}`)
      console.log(`- Remaining: $${budget.remaining_amount}`)
      console.log(`- Usage: ${usage.toFixed(1)}%`)
      console.log(`- Status: ${isExceeded ? '⚠️ Exceeded' : '✅ On track'}`)
    })
  } catch (error) {
    console.error('Budgets error:', error)
  }
}

/**
 * Example 5: Goals Management
 */
export async function goalsExample() {
  try {
    // Tạo savings goal
    const emergencyFund = await goalsService.createGoal({
      name: 'Emergency Fund',
      description: 'Build 6 months of expenses as emergency fund',
      target_amount: 10000,
      currency: 'USD',
      target_date: new Date(2024, 11, 31).toISOString(),
      priority: 'high',
      category: 'savings',
    })

    const vacationGoal = await goalsService.createGoal({
      name: 'Vacation to Japan',
      description: 'Save for 2-week vacation to Japan',
      target_amount: 5000,
      currency: 'USD',
      target_date: new Date(2024, 6, 1).toISOString(),
      priority: 'medium',
      category: 'travel',
    })

    // Lấy active goals
    const activeGoals = await goalsService.getActiveGoals()
    console.log(`Active goals: ${activeGoals.length}`)

    activeGoals.forEach((goal) => {
      const progress = goalsService.getGoalProgress(goal)
      const remaining = goalsService.getRemainingAmount(goal)
      const daysLeft = goalsService.getDaysRemaining(goal)
      const isCompleted = goalsService.isGoalCompleted(goal)

      console.log(`\n${goal.name}:`)
      console.log(`- Target: $${goal.target_amount}`)
      console.log(`- Current: $${goal.current_amount}`)
      console.log(`- Progress: ${progress.toFixed(1)}%`)
      console.log(`- Remaining: $${remaining}`)
      console.log(`- Days left: ${daysLeft}`)
      console.log(`- Status: ${isCompleted ? '✅ Completed' : '🎯 In progress'}`)
    })
  } catch (error) {
    console.error('Goals error:', error)
  }
}

/**
 * Example 6: Investments Management
 */
export async function investmentsExample() {
  try {
    // Tạo stock investments
    const appleStock = await investmentsService.createInvestment({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      quantity: 10,
      purchase_price: 150.0,
      currency: 'USD',
      purchase_date: new Date(2024, 0, 15).toISOString(),
    })

    const googleStock = await investmentsService.createInvestment({
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      type: 'stock',
      quantity: 5,
      purchase_price: 140.0,
      currency: 'USD',
      purchase_date: new Date(2024, 0, 20).toISOString(),
    })

    // Tạo crypto investment
    const bitcoin = await investmentsService.createInvestment({
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.5,
      purchase_price: 45000.0,
      currency: 'USD',
      purchase_date: new Date(2024, 1, 1).toISOString(),
    })

    // Tính portfolio metrics
    const portfolioValue = await investmentsService.getPortfolioValue()
    const gainLoss = await investmentsService.getTotalGainLoss()
    const allocation = await investmentsService.getPortfolioAllocation()

    console.log('\nPortfolio Summary:')
    console.log(`- Total value: $${portfolioValue.toFixed(2)}`)
    console.log(`- Gain/Loss: $${gainLoss.amount.toFixed(2)} (${gainLoss.percentage.toFixed(2)}%)`)
    console.log('\nAllocation:')
    Object.entries(allocation).forEach(([type, percentage]) => {
      console.log(`- ${type}: ${percentage.toFixed(1)}%`)
    })

    // Lấy investments by type
    const stocks = await investmentsService.getInvestmentsByType('stock')
    const crypto = await investmentsService.getInvestmentsByType('crypto')

    console.log(`\nStocks: ${stocks.length}`)
    console.log(`Crypto: ${crypto.length}`)
  } catch (error) {
    console.error('Investments error:', error)
  }
}

/**
 * Example 7: Categories Management
 */
export async function categoriesExample() {
  try {
    // Tạo parent category
    const foodCategory = await categoriesService.createCategory({
      name: 'Food & Dining',
      type: 'expense',
      icon: '🍔',
      color: '#ef4444',
    })

    // Tạo subcategories
    await categoriesService.createCategory({
      name: 'Groceries',
      type: 'expense',
      parent_id: foodCategory.id,
      icon: '🛒',
      color: '#f97316',
    })

    await categoriesService.createCategory({
      name: 'Restaurants',
      type: 'expense',
      parent_id: foodCategory.id,
      icon: '🍽️',
      color: '#f59e0b',
    })

    // Lấy category tree
    const categoryTree = await categoriesService.getCategoryTree()
    console.log('Category Tree:')
    categoryTree.forEach((parent) => {
      console.log(`\n${parent.icon} ${parent.name}`)
      parent.children.forEach((child) => {
        console.log(`  - ${child.icon} ${child.name}`)
      })
    })

    // Lấy income và expense categories
    const incomeCategories = await categoriesService.getIncomeCategories()
    const expenseCategories = await categoriesService.getExpenseCategories()

    console.log(`\nIncome categories: ${incomeCategories.length}`)
    console.log(`Expense categories: ${expenseCategories.length}`)
  } catch (error) {
    console.error('Categories error:', error)
  }
}

/**
 * Example 8: Dashboard Summary
 */
export async function dashboardExample() {
  try {
    // Lấy tổng quan dashboard
    const dashboard = await summariesService.getDashboardSummary()

    console.log('\n=== DASHBOARD SUMMARY ===\n')

    // Accounts summary
    console.log('📊 Accounts:')
    console.log(`- Total balance: $${dashboard.accounts.total_balance}`)
    console.log(`- Net worth: $${dashboard.accounts.net_worth}`)
    console.log(`- Account count: ${dashboard.accounts.account_count}`)

    // Transactions summary
    console.log('\n💰 Transactions:')
    console.log(`- Income: $${dashboard.transactions.total_income}`)
    console.log(`- Expense: $${Math.abs(dashboard.transactions.total_expense)}`)
    console.log(`- Net: $${dashboard.transactions.net_amount}`)
    console.log(`- Count: ${dashboard.transactions.transaction_count}`)

    // Budgets summary
    console.log('\n📝 Budgets:')
    console.log(`- Total budgets: ${dashboard.budgets.total_budgets}`)
    console.log(`- Active: ${dashboard.budgets.active_budgets}`)
    console.log(`- Allocated: $${dashboard.budgets.total_allocated}`)
    console.log(`- Spent: $${dashboard.budgets.total_spent}`)
    console.log(`- Remaining: $${dashboard.budgets.total_remaining}`)

    // Goals summary
    console.log('\n🎯 Goals:')
    console.log(`- Total goals: ${dashboard.goals.total_goals}`)
    console.log(`- Active: ${dashboard.goals.active_goals}`)
    console.log(`- Completed: ${dashboard.goals.completed_goals}`)
    console.log(`- Overall progress: ${dashboard.goals.overall_progress.toFixed(1)}%`)

    // Investments summary
    console.log('\n📈 Investments:')
    console.log(`- Total investments: ${dashboard.investments.total_investments}`)
    console.log(`- Portfolio value: $${dashboard.investments.total_portfolio_value}`)
    console.log(
      `- Gain/Loss: $${dashboard.investments.total_gain_loss} (${dashboard.investments.total_gain_loss_percentage.toFixed(2)}%)`
    )
  } catch (error) {
    console.error('Dashboard error:', error)
  }
}

/**
 * Example 9: Spending Analytics
 */
export async function analyticsExample() {
  try {
    // Lấy spending trend 6 tháng gần nhất
    const trend = await summariesService.getSpendingTrend(6)

    console.log('\n=== SPENDING TREND (6 Months) ===\n')
    trend.labels.forEach((label, index) => {
      console.log(`${label}:`)
      console.log(`  Income: $${trend.income[index]}`)
      console.log(`  Expense: $${trend.expense[index]}`)
      console.log(`  Net: $${trend.income[index] - trend.expense[index]}`)
    })

    // Lấy category breakdown
    const breakdown = await summariesService.getCategoryBreakdown(
      new Date(2024, 0, 1).toISOString(),
      new Date(2024, 11, 31).toISOString()
    )

    console.log('\n=== CATEGORY BREAKDOWN ===\n')
    breakdown.labels.forEach((label, index) => {
      console.log(`${label}: $${breakdown.values[index]}`)
    })
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

/**
 * Example 10: Complete User Journey
 */
export async function completeUserJourney() {
  console.log('\n=== COMPLETE USER JOURNEY ===\n')

  try {
    // 1. Authentication
    console.log('Step 1: Authentication')
    await authService.register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      full_name: 'New User',
    })

    // 2. Setup accounts
    console.log('\nStep 2: Setup accounts')
    await accountsService.createAccount({
      name: 'Checking',
      type: 'bank',
      balance: 5000,
      currency: 'USD',
    })

    // 3. Create categories
    console.log('\nStep 3: Create categories')
    const foodCategory = await categoriesService.createCategory({
      name: 'Food',
      type: 'expense',
      icon: '🍔',
      color: '#ef4444',
    })

    // 4. Add transactions
    console.log('\nStep 4: Add transactions')
    await transactionsService.createTransaction({
      account_id: '1',
      category_id: foodCategory.id,
      type: 'expense',
      amount: -50,
      currency: 'USD',
      description: 'Lunch',
      date: new Date().toISOString(),
    })

    // 5. Create budget
    console.log('\nStep 5: Create budget')
    await budgetsService.createBudget({
      name: 'Monthly Food Budget',
      category_id: foodCategory.id,
      amount: 500,
      currency: 'USD',
      period: 'monthly',
      start_date: new Date(2024, 0, 1).toISOString(),
      end_date: new Date(2024, 0, 31).toISOString(),
    })

    // 6. Create goal
    console.log('\nStep 6: Create goal')
    await goalsService.createGoal({
      name: 'Emergency Fund',
      description: 'Save for emergencies',
      target_amount: 10000,
      currency: 'USD',
      target_date: new Date(2024, 11, 31).toISOString(),
      priority: 'high',
      category: 'savings',
    })

    // 7. View dashboard
    console.log('\nStep 7: View dashboard')
    const dashboard = await summariesService.getDashboardSummary()
    console.log('Dashboard loaded successfully!')
    console.log(`- Accounts: ${dashboard.accounts.account_count}`)
    console.log(`- Transactions: ${dashboard.transactions.transaction_count}`)
    console.log(`- Budgets: ${dashboard.budgets.total_budgets}`)
    console.log(`- Goals: ${dashboard.goals.total_goals}`)

    console.log('\n✅ User journey completed successfully!')
  } catch (error) {
    console.error('❌ User journey failed:', error)
  }
}

// Export all examples
export const examples = {
  authentication: authenticationExample,
  accounts: accountsExample,
  transactions: transactionsExample,
  budgets: budgetsExample,
  goals: goalsExample,
  investments: investmentsExample,
  categories: categoriesExample,
  dashboard: dashboardExample,
  analytics: analyticsExample,
  completeJourney: completeUserJourney,
}

export default examples

