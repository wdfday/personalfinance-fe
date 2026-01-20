import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { accountsService }from "@/services/api/services/accounts.service"
import { transactionsService } from "@/services/api/services/transactions.service"
import type { Account } from '@/services/api'

// Helper to calculate account summary from accounts list
function calculateAccountSummary(accounts: Account[]) {
  let totalAssets = 0
  let totalLiabilities = 0
  const currencyAllocation: Record<string, number> = {}
  let lastUpdated = ''

  for (const acc of accounts) {
    const balance = acc.currentBalance

    // Credit cards are liabilities
    if (acc.accountType === 'credit_card') {
      totalLiabilities += balance
    } else {
      totalAssets += balance
    }

    // Currency allocation
    currencyAllocation[acc.currency] = (currencyAllocation[acc.currency] || 0) + balance

    // Track last updated
    if (acc.updatedAt > lastUpdated) {
      lastUpdated = acc.updatedAt
    }
  }

  return {
    total_balance: totalAssets - totalLiabilities,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: totalAssets - totalLiabilities,
    currency_allocation: currencyAllocation,
    account_count: accounts.length,
    last_updated: lastUpdated || new Date().toISOString(),
  }
}

interface DashboardState {
  accountSummary: {
    total_balance: number
    total_assets: number
    total_liabilities: number
    net_worth: number
    currency_allocation: Record<string, number>
    account_count: number
    last_updated: string
  } | null
  transactionSummary: {
    total_income: number
    total_expense: number
    net_amount: number
    transaction_count: number
    category_breakdown: Record<string, number>
    currency_breakdown: Record<string, number>
    last_updated: string
  } | null
  isLoading: boolean
  error: string | null
  dateRange: {
    start_date?: string
    end_date?: string
    period?: string
  }
}

const initialState: DashboardState = {
  accountSummary: null,
  transactionSummary: null,
  isLoading: false,
  error: null,
  dateRange: {
    period: 'monthly',
  },
}

// Async thunks
export const fetchAccountSummary = createAsyncThunk(
  'dashboard/fetchAccountSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsService.getAll()
      return calculateAccountSummary(response.items)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch account summary')
    }
  }
)

export const fetchTransactionSummary = createAsyncThunk(
  'dashboard/fetchTransactionSummary',
  async (params: {
    period?: string
    start_date?: string
    end_date?: string
  } | undefined, { rejectWithValue }) => {
    try {
      const summary = await transactionsService.getSummary(params)
      return summary
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transaction summary')
    }
  }
)

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (params: {
    period?: string
    start_date?: string
    end_date?: string
  } | undefined, { rejectWithValue }) => {
    try {
      const [accountsResponse, transactionSummary] = await Promise.all([
        accountsService.getAll(),
        transactionsService.getSummary(params),
      ])
      return { 
        accountSummary: calculateAccountSummary(accountsResponse.items), 
        transactionSummary 
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard data')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setDateRange: (state, action: PayloadAction<{
      start_date?: string
      end_date?: string
      period?: string
    }>) => {
      state.dateRange = { ...state.dateRange, ...action.payload }
    },
    clearDateRange: (state) => {
      state.dateRange = {
        period: 'monthly',
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Account Summary
      .addCase(fetchAccountSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.accountSummary = action.payload
        state.error = null
      })
      .addCase(fetchAccountSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Transaction Summary
      .addCase(fetchTransactionSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactionSummary = action.payload
        state.error = null
      })
      .addCase(fetchTransactionSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false
        state.accountSummary = action.payload.accountSummary
        state.transactionSummary = action.payload.transactionSummary
        state.error = null
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setDateRange, clearDateRange } = dashboardSlice.actions
export default dashboardSlice
