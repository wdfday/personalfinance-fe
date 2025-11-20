/**
 * Transactions Slice
 * Quản lý state cho Transactions module
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { transactionsService } from '@/services/api'
import type { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionQueryParams
} from '@/services/api'
import { getErrorMessage } from '@/services/api/utils'

interface TransactionsState {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    page_size: number
    total_pages: number
    total_count: number
  }
  summary?: {
    total_income: number
    total_expense: number
    total_transfer: number
    net_amount: number
    count: number
  }
  filters: TransactionQueryParams
}

const initialState: TransactionsState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    page_size: 20,
    total_pages: 0,
    total_count: 0,
  },
  filters: {
    page: 1,
    page_size: 20,
  },
}

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: TransactionQueryParams, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactions(params)
      return response
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      const transaction = await transactionsService.getTransaction(id)
      return transaction
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: CreateTransactionRequest, { rejectWithValue }) => {
    try {
      const transaction = await transactionsService.createTransaction(transactionData)
      return transaction
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: string; data: UpdateTransactionRequest }, { rejectWithValue }) => {
    try {
      const transaction = await transactionsService.updateTransaction(id, data)
      return transaction
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionsService.deleteTransaction(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionQueryParams>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        page_size: 20,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = action.payload.transactions
        state.pagination = action.payload.pagination
        state.summary = action.payload.summary
        state.error = null
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Transaction
      .addCase(fetchTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedTransaction = action.payload
        state.error = null
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions.unshift(action.payload)
        state.pagination.total_count += 1
        state.error = null
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id)
        if (index !== -1) {
          state.transactions[index] = action.payload
        }
        if (state.selectedTransaction?.id === action.payload.id) {
          state.selectedTransaction = action.payload
        }
        state.error = null
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload)
        state.pagination.total_count -= 1
        if (state.selectedTransaction?.id === action.payload) {
          state.selectedTransaction = null
        }
        state.error = null
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  setSelectedTransaction, 
  clearSelectedTransaction, 
  setFilters, 
  clearFilters 
} = transactionsSlice.actions
export default transactionsSlice
