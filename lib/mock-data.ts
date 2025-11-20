// Mock data for development
import { Account, Transaction, Budget, Goal, Investment, Category } from './api'

// Fixed timestamps to avoid hydration mismatch
const FIXED_TIMESTAMP = '2024-01-20T14:22:00Z'
const FIXED_TIMESTAMP_2 = '2024-01-19T14:22:00Z'
const FIXED_TIMESTAMP_3 = '2024-01-18T08:30:00Z'
const FIXED_TIMESTAMP_4 = '2024-01-17T12:00:00Z'
const FIXED_TIMESTAMP_5 = '2024-01-15T09:00:00Z'
const FIXED_TIMESTAMP_6 = '2024-01-10T10:00:00Z'
const FIXED_TIMESTAMP_7 = '2024-01-05T14:30:00Z'
const FIXED_TIMESTAMP_8 = '2024-01-01T09:00:00Z'

// Mock User Data
export const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  phone: '+1234567890',
  avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg',
  is_active: true,
  created_at: FIXED_TIMESTAMP_8,
  updated_at: FIXED_TIMESTAMP
}

// Mock Auth Token
export const mockAuthToken = 'mock-jwt-token-1234567890'

// Mock Auth Response
export const mockAuthResponse = {
  user: mockUser,
  token: mockAuthToken,
  expires_at: '2024-12-31T23:59:59Z'
}

// Mock Accounts
export const mockAccounts: Account[] = [
  {
    id: 1,
    name: "Checking Account",
    type: "bank",
    balance: 7500.50,
    currency: "USD",
    icon: "🏦",
    color: "#3b82f6",
    is_active: true,
    created_at: FIXED_TIMESTAMP_5,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: 2,
    name: "Savings Account",
    type: "bank",
    balance: 25000.00,
    currency: "USD",
    icon: "💰",
    color: "#10b981",
    is_active: true,
    created_at: FIXED_TIMESTAMP_6,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: 3,
    name: "Investment Portfolio",
    type: "investment",
    balance: 150000.75,
    currency: "USD",
    icon: "📈",
    color: "#8b5cf6",
    is_active: true,
    created_at: FIXED_TIMESTAMP_7,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: 4,
    name: "Credit Card",
    type: "credit_card",
    balance: -2500.25,
    currency: "USD",
    icon: "💳",
    color: "#ef4444",
    is_active: true,
    created_at: FIXED_TIMESTAMP_2,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: 5,
    name: "Cash Wallet",
    type: "cash",
    balance: 500.00,
    currency: "USD",
    icon: "💵",
    color: "#f59e0b",
    is_active: true,
    created_at: FIXED_TIMESTAMP_3,
    updated_at: FIXED_TIMESTAMP
  }
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    user_id: "1",
    account_id: "1",
    category_id: "1",
    type: "expense",
    sub_type: "groceries",
    amount: -125.50,
    currency: "USD",
    exchange_rate: 1.0,
    base_amount: -125.50,
    description: "Grocery shopping at Whole Foods",
    note: "Weekly groceries",
    date: FIXED_TIMESTAMP,
    status: "completed",
    reference: "TXN001",
    tags: ["food", "groceries"],
    location: "Whole Foods Market",
    merchant: "Whole Foods",
    is_recurring: false,
    is_tax_deductible: false,
    tax_amount: 0,
    fee: 0,
    last_updated: FIXED_TIMESTAMP
  },
  {
    id: "2",
    user_id: "1",
    account_id: "1",
    category_id: "2",
    type: "expense",
    sub_type: "utilities",
    amount: -85.00,
    currency: "USD",
    exchange_rate: 1.0,
    base_amount: -85.00,
    description: "Electricity bill",
    note: "Monthly electricity",
    date: FIXED_TIMESTAMP_2,
    status: "completed",
    reference: "TXN002",
    tags: ["utilities", "bills"],
    location: "Online",
    merchant: "Electric Company",
    is_recurring: true,
    is_tax_deductible: false,
    tax_amount: 0,
    fee: 0,
    last_updated: FIXED_TIMESTAMP_2
  },
  {
    id: "3",
    user_id: "1",
    account_id: "1",
    category_id: "3",
    type: "income",
    sub_type: "salary",
    amount: 5000.00,
    currency: "USD",
    exchange_rate: 1.0,
    base_amount: 5000.00,
    description: "Monthly salary",
    note: "Direct deposit",
    date: FIXED_TIMESTAMP_5,
    status: "completed",
    reference: "TXN003",
    tags: ["salary", "income"],
    location: "Bank",
    merchant: "Company Inc",
    is_recurring: true,
    is_tax_deductible: false,
    tax_amount: 0,
    fee: 0,
    last_updated: FIXED_TIMESTAMP_5
  },
  {
    id: "4",
    user_id: "1",
    account_id: "2",
    category_id: "4",
    type: "expense",
    sub_type: "dining",
    amount: -45.75,
    currency: "USD",
    exchange_rate: 1.0,
    base_amount: -45.75,
    description: "Dinner at restaurant",
    note: "Date night",
    date: FIXED_TIMESTAMP_3,
    status: "completed",
    reference: "TXN004",
    tags: ["dining", "entertainment"],
    location: "Downtown Restaurant",
    merchant: "Bella Vista",
    is_recurring: false,
    is_tax_deductible: false,
    tax_amount: 0,
    fee: 0,
    last_updated: FIXED_TIMESTAMP_3
  },
  {
    id: "5",
    user_id: "1",
    account_id: "3",
    category_id: "5",
    type: "investment",
    sub_type: "dividend",
    amount: 250.00,
    currency: "USD",
    exchange_rate: 1.0,
    base_amount: 250.00,
    description: "Dividend payment",
    note: "Quarterly dividend",
    date: FIXED_TIMESTAMP_4,
    status: "completed",
    reference: "TXN005",
    tags: ["investment", "dividend"],
    location: "Online",
    merchant: "Investment Firm",
    is_recurring: true,
    is_tax_deductible: false,
    tax_amount: 0,
    fee: 0,
    last_updated: FIXED_TIMESTAMP_4
  }
]

// Mock Budgets
export const mockBudgets: Budget[] = [
  {
    id: "1",
    user_id: "1",
    name: "Monthly Groceries",
    category_id: "1",
    amount: 500.00,
    currency: "USD",
    period: "monthly",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-01-31T23:59:59Z",
    spent_amount: 375.50,
    remaining_amount: 124.50,
    status: "active",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "2",
    user_id: "1",
    name: "Entertainment",
    category_id: "4",
    amount: 200.00,
    currency: "USD",
    period: "monthly",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-01-31T23:59:59Z",
    spent_amount: 180.25,
    remaining_amount: 19.75,
    status: "active",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "3",
    user_id: "1",
    name: "Utilities",
    category_id: "2",
    amount: 300.00,
    currency: "USD",
    period: "monthly",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-01-31T23:59:59Z",
    spent_amount: 285.00,
    remaining_amount: 15.00,
    status: "active",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  }
]

// Mock Goals
export const mockGoals: Goal[] = [
  {
    id: "1",
    user_id: "1",
    name: "Emergency Fund",
    description: "Build 6 months of expenses emergency fund",
    target_amount: 15000.00,
    current_amount: 8500.00,
    currency: "USD",
    target_date: "2024-12-31T23:59:59Z",
    status: "active",
    priority: "high",
    category: "Emergency",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "2",
    user_id: "1",
    name: "Vacation to Europe",
    description: "Save for 2-week Europe vacation",
    target_amount: 5000.00,
    current_amount: 2200.00,
    currency: "USD",
    target_date: "2024-06-30T23:59:59Z",
    status: "active",
    priority: "medium",
    category: "Travel",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "3",
    user_id: "1",
    name: "New Car",
    description: "Down payment for new car",
    target_amount: 10000.00,
    current_amount: 3500.00,
    currency: "USD",
    target_date: "2024-09-30T23:59:59Z",
    status: "active",
    priority: "medium",
    category: "Transportation",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  }
]

// Mock Investments
export const mockInvestments: Investment[] = [
  {
    id: "1",
    user_id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "stock",
    quantity: 10,
    purchase_price: 150.00,
    current_price: 185.50,
    currency: "USD",
    purchase_date: "2024-01-10T10:00:00Z",
    current_value: 1855.00,
    total_gain_loss: 355.00,
    total_gain_loss_percentage: 23.67,
    is_active: true,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-20T14:22:00Z"
  },
  {
    id: "2",
    user_id: "1",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "stock",
    quantity: 5,
    purchase_price: 2800.00,
    current_price: 2950.00,
    currency: "USD",
    purchase_date: "2024-01-05T14:30:00Z",
    current_value: 14750.00,
    total_gain_loss: 750.00,
    total_gain_loss_percentage: 5.36,
    is_active: true,
    created_at: "2024-01-05T14:30:00Z",
    updated_at: "2024-01-20T14:22:00Z"
  },
  {
    id: "3",
    user_id: "1",
    symbol: "VTSAX",
    name: "Vanguard Total Stock Market Index Fund",
    type: "mutual_fund",
    quantity: 100,
    purchase_price: 95.00,
    current_price: 98.50,
    currency: "USD",
    purchase_date: "2024-01-01T09:00:00Z",
    current_value: 9850.00,
    total_gain_loss: 350.00,
    total_gain_loss_percentage: 3.68,
    is_active: true,
    created_at: "2024-01-01T09:00:00Z",
    updated_at: "2024-01-20T14:22:00Z"
  }
]

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: "1",
    user_id: "1",
    name: "Groceries",
    type: "expense",
    parent_id: undefined,
    icon: "🛒",
    color: "#3b82f6",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "2",
    user_id: "1",
    name: "Utilities",
    type: "expense",
    parent_id: undefined,
    icon: "⚡",
    color: "#f59e0b",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "3",
    user_id: "1",
    name: "Salary",
    type: "income",
    parent_id: undefined,
    icon: "💰",
    color: "#10b981",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "4",
    user_id: "1",
    name: "Dining",
    type: "expense",
    parent_id: undefined,
    icon: "🍽️",
    color: "#ef4444",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  },
  {
    id: "5",
    user_id: "1",
    name: "Investment",
    type: "income",
    parent_id: undefined,
    icon: "📈",
    color: "#8b5cf6",
    is_active: true,
    created_at: FIXED_TIMESTAMP_8,
    updated_at: FIXED_TIMESTAMP
  }
]

// Mock Summary Data
export const mockAccountSummary = {
  total_balance: 180500.00,
  total_assets: 183000.25,
  total_liabilities: 2500.25,
  net_worth: 180500.00,
  currency_allocation: {
    "USD": 180500.00
  },
  account_count: 5,
    last_updated: FIXED_TIMESTAMP
}

export const mockTransactionSummary = {
  total_income: 5250.00,
  total_expense: -256.25,
  net_amount: 4993.75,
  transaction_count: 5,
  category_breakdown: {
    "Groceries": 125.50,
    "Utilities": 85.00,
    "Salary": 5000.00,
    "Dining": 45.75,
    "Investment": 250.00
  },
  currency_breakdown: {
    "USD": 4993.75
  },
    last_updated: FIXED_TIMESTAMP
}
