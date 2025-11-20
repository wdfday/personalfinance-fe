# API Services - Quick Start Guide

## 🚀 Bắt đầu nhanh trong 5 phút

### 1. Cấu hình môi trường

Tạo file `.env.local` trong thư mục `client/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Import service

```typescript
import { authService } from '@/services/api'
```

### 3. Sử dụng ngay

```typescript
// Đăng nhập
const response = await authService.login({
  username: 'johndoe',
  password: 'password123'
})

console.log('Logged in:', response.user)
// Token tự động được lưu và sử dụng cho các request tiếp theo
```

## 📝 Ví dụ cơ bản

### Authentication

```typescript
import { authService } from '@/services/api'

// Login
const { user, access_token } = await authService.login({
  username: 'john',
  password: 'pass123'
})

// Get current user
const currentUser = await authService.getCurrentUser()

// Logout
authService.logout()
```

### Accounts

```typescript
import { accountsService } from '@/services/api'

// Get all accounts
const { accounts } = await accountsService.getAccounts()

// Create account
const account = await accountsService.createAccount({
  name: 'Checking',
  type: 'bank',
  balance: 1000,
  currency: 'USD'
})
```

### Transactions

```typescript
import { transactionsService } from '@/services/api'

// Get recent transactions
const recent = await transactionsService.getRecentTransactions(10)

// Create transaction
const transaction = await transactionsService.createTransaction({
  account_id: '1',
  type: 'expense',
  amount: -50,
  currency: 'USD',
  description: 'Lunch',
  date: new Date().toISOString()
})
```

### Dashboard Summary

```typescript
import { summariesService } from '@/services/api'

// Get complete dashboard
const dashboard = await summariesService.getDashboardSummary()

console.log('Total balance:', dashboard.accounts.total_balance)
console.log('Total income:', dashboard.transactions.total_income)
console.log('Active budgets:', dashboard.budgets.active_budgets)
```

## 🎯 React Hook Example

```typescript
// useAuth.ts
import { useState, useEffect } from 'react'
import { authService } from '@/services/api'
import type { User } from '@/services/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser()
        .then(setUser)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password })
    setUser(response.user)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

Sử dụng hook:

```typescript
// LoginPage.tsx
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, login, loading } = useAuth()

  const handleLogin = async () => {
    await login('john', 'pass123')
  }

  if (loading) return <div>Loading...</div>
  if (user) return <div>Welcome {user.full_name}</div>

  return <button onClick={handleLogin}>Login</button>
}
```

## 🔐 Error Handling

```typescript
import { authService } from '@/services/api'
import { getErrorMessage } from '@/services/api/utils'
import type { ApiError } from '@/services/api'

try {
  await authService.login({ username, password })
} catch (error) {
  const apiError = error as ApiError
  
  // Get user-friendly message
  const message = getErrorMessage(error)
  console.error(message)
  
  // Or handle specific status
  if (apiError.status === 401) {
    alert('Sai tên đăng nhập hoặc mật khẩu')
  }
}
```

## 📊 Complete Example: Transaction List

```typescript
// TransactionList.tsx
import { useState, useEffect } from 'react'
import { transactionsService } from '@/services/api'
import type { Transaction } from '@/services/api'
import { formatCurrency, formatDate } from '@/services/api/utils'

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const { transactions } = await transactionsService.getTransactions({
        limit: 20
      })
      setTransactions(transactions)
    } catch (error) {
      console.error('Load failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await transactionsService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Transactions</h1>
      {transactions.map(t => (
        <div key={t.id}>
          <span>{formatDate(t.date)}</span>
          <span>{t.description}</span>
          <span>{formatCurrency(t.amount, t.currency)}</span>
          <button onClick={() => handleDelete(t.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

## 🎨 All Available Services

```typescript
import {
  authService,        // Authentication
  accountsService,    // Accounts management
  transactionsService, // Transactions
  budgetsService,     // Budgets
  goalsService,       // Goals
  investmentsService, // Investments
  categoriesService,  // Categories
  summariesService,   // Analytics & summaries
} from '@/services/api'
```

## 🛠️ Utilities

```typescript
import {
  formatCurrency,     // Format money: $1,234.56
  formatDate,         // Format date: Jan 20, 2024
  formatPercentage,   // Format percent: 45.5%
  getErrorMessage,    // Get error message
  getStartOfMonth,    // Get start of month
  getEndOfMonth,      // Get end of month
  calculatePercentage, // Calculate percentage
} from '@/services/api/utils'
```

## 📚 Thêm thông tin

- [README.md](./README.md) - Complete documentation
- [examples.ts](./examples.ts) - More examples
- [CHANGELOG.md](./CHANGELOG.md) - What's included

## ⚡ Tips

### 1. Check authentication before calling

```typescript
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser()
}
```

### 2. Use try-catch for all API calls

```typescript
try {
  const data = await accountsService.getAccounts()
} catch (error) {
  console.error(getErrorMessage(error))
}
```

### 3. Token is automatically managed

```typescript
// After login, token is saved automatically
await authService.login({ username, password })

// All subsequent requests use the token
await accountsService.getAccounts() // ✅ Authenticated
```

### 4. Logout clears everything

```typescript
authService.logout()
// Token removed, user cleared, redirected to login on next API call
```

## 🐛 Troubleshooting

### "Network error"
- Check if backend server is running
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS settings in backend

### "Unauthorized"
- Login again
- Check if token is expired
- Check if token is in localStorage

### "Not found"
- Check if endpoint exists in backend
- Check if ID is correct
- Check API version

## 🎯 Next Steps

1. ✅ Setup environment variables
2. ✅ Import and use services
3. ✅ Add error handling
4. ✅ Create React hooks
5. ✅ Replace mock data
6. ✅ Test with real backend

---

**Happy coding! 🚀**

