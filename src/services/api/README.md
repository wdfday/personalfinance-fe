# API Services - Personal Finance DSS

Thư viện API services để kết nối client với backend API.

## 📁 Cấu trúc

```
services/api/
├── base.ts                    # Base API client với authentication
├── auth.service.ts           # Authentication service
├── accounts.service.ts       # Accounts management
├── transactions.service.ts   # Transactions management
├── budgets.service.ts        # Budgets management
├── goals.service.ts          # Goals management
├── investments.service.ts    # Investments management
├── categories.service.ts     # Categories management
├── summaries.service.ts      # Analytics & summaries
├── index.ts                  # Export tất cả services
└── README.md                 # Documentation
```

## 🚀 Cài đặt

### 1. Environment Variables

Tạo file `.env.local` trong thư mục `client/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Import Services

```typescript
// Import individual service
import { authService } from '@/services/api'
import { accountsService } from '@/services/api'
import { transactionsService } from '@/services/api'

// Import all services
import { apiServices } from '@/services/api'

// Import types
import type { User, Account, Transaction } from '@/services/api'
```

## 📝 Sử dụng

### Authentication Service

#### Đăng ký

```typescript
import { authService } from '@/services/api'

try {
  const response = await authService.register({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    full_name: 'John Doe',
    phone: '+1234567890'
  })
  
  console.log('User:', response.user)
  console.log('Token:', response.access_token)
  // Token tự động được lưu vào localStorage
} catch (error) {
  console.error('Register failed:', error)
}
```

#### Đăng nhập

```typescript
try {
  const response = await authService.login({
    username: 'johndoe',
    password: 'password123'
  })
  
  console.log('Logged in:', response.user)
  // Token tự động được lưu và sử dụng cho các request tiếp theo
} catch (error) {
  console.error('Login failed:', error)
}
```

#### Lấy thông tin user hiện tại

```typescript
try {
  const user = await authService.getCurrentUser()
  console.log('Current user:', user)
} catch (error) {
  console.error('Get user failed:', error)
}
```

#### Đăng xuất

```typescript
authService.logout()
// Token tự động bị xóa khỏi localStorage
```

### Accounts Service

#### Lấy danh sách accounts

```typescript
import { accountsService } from '@/services/api'

try {
  const { accounts, total } = await accountsService.getAccounts()
  console.log(`Found ${total} accounts:`, accounts)
} catch (error) {
  console.error('Get accounts failed:', error)
}
```

#### Tạo account mới

```typescript
try {
  const account = await accountsService.createAccount({
    name: 'Checking Account',
    type: 'bank',
    balance: 1000.00,
    currency: 'USD',
    icon: '🏦',
    color: '#3b82f6'
  })
  
  console.log('Created account:', account)
} catch (error) {
  console.error('Create account failed:', error)
}
```

#### Cập nhật account

```typescript
try {
  const account = await accountsService.updateAccount(1, {
    name: 'Updated Account Name',
    balance: 1500.00
  })
  
  console.log('Updated account:', account)
} catch (error) {
  console.error('Update account failed:', error)
}
```

#### Xóa account

```typescript
try {
  await accountsService.deleteAccount(1)
  console.log('Account deleted')
} catch (error) {
  console.error('Delete account failed:', error)
}
```

### Transactions Service

#### Lấy danh sách transactions

```typescript
import { transactionsService } from '@/services/api'

try {
  const { transactions, total } = await transactionsService.getTransactions({
    type: 'expense',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-01-31T23:59:59Z',
    limit: 20
  })
  
  console.log(`Found ${total} transactions:`, transactions)
} catch (error) {
  console.error('Get transactions failed:', error)
}
```

#### Tạo transaction

```typescript
try {
  const transaction = await transactionsService.createTransaction({
    account_id: '1',
    category_id: '5',
    type: 'expense',
    amount: -125.50,
    currency: 'USD',
    description: 'Grocery shopping',
    date: new Date().toISOString(),
    tags: ['food', 'grocery']
  })
  
  console.log('Created transaction:', transaction)
} catch (error) {
  console.error('Create transaction failed:', error)
}
```

#### Lấy transactions gần đây

```typescript
try {
  const recentTransactions = await transactionsService.getRecentTransactions(10)
  console.log('Recent transactions:', recentTransactions)
} catch (error) {
  console.error('Get recent transactions failed:', error)
}
```

#### Tính tổng thu chi

```typescript
try {
  const summary = await transactionsService.getTransactionsSummary(
    '2024-01-01T00:00:00Z',
    '2024-01-31T23:59:59Z'
  )
  
  console.log('Income:', summary.totalIncome)
  console.log('Expense:', summary.totalExpense)
  console.log('Net:', summary.netAmount)
} catch (error) {
  console.error('Get summary failed:', error)
}
```

### Budgets Service

```typescript
import { budgetsService } from '@/services/api'

// Lấy danh sách budgets
const { budgets } = await budgetsService.getBudgets()

// Tạo budget mới
const budget = await budgetsService.createBudget({
  name: 'Monthly Groceries',
  category_id: '5',
  amount: 500.00,
  currency: 'USD',
  period: 'monthly',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-01-31T23:59:59Z'
})

// Lấy active budgets
const activeBudgets = await budgetsService.getActiveBudgets()

// Kiểm tra budget usage
const usagePercentage = budgetsService.getBudgetUsagePercentage(budget)
const isExceeded = budgetsService.isBudgetExceeded(budget)
```

### Goals Service

```typescript
import { goalsService } from '@/services/api'

// Lấy danh sách goals
const { goals } = await goalsService.getGoals()

// Tạo goal mới
const goal = await goalsService.createGoal({
  name: 'Emergency Fund',
  description: 'Save for emergencies',
  target_amount: 10000.00,
  currency: 'USD',
  target_date: '2024-12-31T23:59:59Z',
  priority: 'high',
  category: 'savings'
})

// Tính progress
const progress = goalsService.getGoalProgress(goal)
const remaining = goalsService.getRemainingAmount(goal)
const daysLeft = goalsService.getDaysRemaining(goal)

console.log(`Progress: ${progress}%`)
console.log(`Remaining: $${remaining}`)
console.log(`Days left: ${daysLeft}`)
```

### Investments Service

```typescript
import { investmentsService } from '@/services/api'

// Lấy danh sách investments
const { investments } = await investmentsService.getInvestments()

// Tạo investment mới
const investment = await investmentsService.createInvestment({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  type: 'stock',
  quantity: 10,
  purchase_price: 150.00,
  currency: 'USD',
  purchase_date: '2024-01-15T00:00:00Z'
})

// Tính portfolio value
const portfolioValue = await investmentsService.getPortfolioValue()
const gainLoss = await investmentsService.getTotalGainLoss()
const allocation = await investmentsService.getPortfolioAllocation()

console.log(`Portfolio value: $${portfolioValue}`)
console.log(`Gain/Loss: $${gainLoss.amount} (${gainLoss.percentage}%)`)
console.log('Allocation:', allocation)
```

### Categories Service

```typescript
import { categoriesService } from '@/services/api'

// Lấy danh sách categories
const { categories } = await categoriesService.getCategories()

// Lấy income categories
const incomeCategories = await categoriesService.getIncomeCategories()

// Lấy expense categories
const expenseCategories = await categoriesService.getExpenseCategories()

// Tạo category mới
const category = await categoriesService.createCategory({
  name: 'Groceries',
  type: 'expense',
  icon: '🛒',
  color: '#10b981'
})

// Lấy category tree
const categoryTree = await categoriesService.getCategoryTree()
```

### Summaries Service

```typescript
import { summariesService } from '@/services/api'

// Lấy tổng quan dashboard
const dashboard = await summariesService.getDashboardSummary()

console.log('Accounts:', dashboard.accounts)
console.log('Transactions:', dashboard.transactions)
console.log('Budgets:', dashboard.budgets)
console.log('Goals:', dashboard.goals)
console.log('Investments:', dashboard.investments)

// Lấy spending trend
const trend = await summariesService.getSpendingTrend(6) // 6 tháng gần nhất
console.log('Labels:', trend.labels)
console.log('Income:', trend.income)
console.log('Expense:', trend.expense)

// Lấy category breakdown
const breakdown = await summariesService.getCategoryBreakdown(
  '2024-01-01T00:00:00Z',
  '2024-01-31T23:59:59Z'
)
console.log('Categories:', breakdown.labels)
console.log('Amounts:', breakdown.values)
```

## 🔐 Authentication

### Token Management

Token được quản lý tự động:
- Khi login/register thành công, token được lưu vào `localStorage`
- Token tự động được thêm vào header `Authorization: Bearer <token>` cho mọi request
- Khi logout, token tự động bị xóa
- Nếu nhận 401 Unauthorized, token bị xóa và redirect về login

### Manual Token Management

```typescript
import { baseApiClient } from '@/services/api'

// Set token manually
baseApiClient.setToken('your-token-here')

// Get current token
const token = baseApiClient.getToken()

// Clear token
baseApiClient.setToken(null)
```

## ⚠️ Error Handling

Tất cả service methods đều throw `ApiError` khi có lỗi:

```typescript
import { authService } from '@/services/api'
import type { ApiError } from '@/services/api'

try {
  await authService.login({ username: 'test', password: 'wrong' })
} catch (error) {
  const apiError = error as ApiError
  
  console.error('Error:', apiError.error)
  console.error('Details:', apiError.details)
  console.error('Status:', apiError.status)
  
  // Handle specific status codes
  if (apiError.status === 401) {
    console.error('Invalid credentials')
  } else if (apiError.status === 404) {
    console.error('Not found')
  }
}
```

## 🎯 React Hooks Integration

### Example: useAuth Hook

```typescript
import { useState, useEffect } from 'react'
import { authService } from '@/services/api'
import type { User } from '@/services/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Load user failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password })
    setUser(response.user)
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

### Example: useAccounts Hook

```typescript
import { useState, useEffect } from 'react'
import { accountsService } from '@/services/api'
import type { Account } from '@/services/api'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const { accounts } = await accountsService.getAccounts()
      setAccounts(accounts)
    } catch (error) {
      console.error('Load accounts failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (data: CreateAccountRequest) => {
    const account = await accountsService.createAccount(data)
    setAccounts([...accounts, account])
    return account
  }

  const deleteAccount = async (id: number) => {
    await accountsService.deleteAccount(id)
    setAccounts(accounts.filter(a => a.id !== id))
  }

  return { accounts, loading, createAccount, deleteAccount, refresh: loadAccounts }
}
```

## 🔄 Redux Integration

Các services có thể được sử dụng trong Redux actions/thunks:

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit'
import { accountsService } from '@/services/api'

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async () => {
    const response = await accountsService.getAccounts()
    return response.accounts
  }
)

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (data: CreateAccountRequest) => {
    const account = await accountsService.createAccount(data)
    return account
  }
)
```

## 📚 API Reference

Chi tiết về các endpoint và request/response format, xem:
- [API Test Guide](/md/API_TEST_GUIDE.md)
- [Backend API Summary](/md/BACKEND_API_SUMMARY.md)

## 🛠️ Development

### Testing Services

```typescript
// Test trong console hoặc test file
import { authService, accountsService } from '@/services/api'

// Login
const auth = await authService.login({
  username: 'test',
  password: 'password123'
})

// Get accounts
const accounts = await accountsService.getAccounts()
console.log(accounts)
```

### Debug Mode

Bật debug trong base client:

```typescript
// base.ts
async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${this.baseURL}${endpoint}`
  
  // Debug log
  console.log('Request:', url, options)
  
  // ... rest of code
}
```

## 📄 License

MIT

