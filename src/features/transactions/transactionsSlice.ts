/**
 * Transactions Slice
 * Quản lý state cho Transactions module - Direction-based model
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { transactionsService } from '@/services/api'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryFilters,
  TransactionListResponse,
  TransactionSummary,
} from '@/types/api'
import { getErrorMessage } from '@/services/api/utils'

interface TransactionsState {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
  }
  summary?: TransactionSummary
  filters: TransactionQueryFilters
}

const initialState: TransactionsState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 0,
    totalCount: 0,
  },
  filters: {
    page: 1,
    pageSize: 20,
  },
}

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: TransactionQueryFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactions(params)
      return response
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchTransactionSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async (params: TransactionQueryFilters | undefined, { rejectWithValue }) => {
    try {
      const summary = await transactionsService.getSummary(params)
      return summary
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
    setFilters: (state, action: PayloadAction<Partial<TransactionQueryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        pageSize: 20,
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
        state.transactions = action.payload.transactions || []
        state.pagination = action.payload.pagination || {
          page: 1,
          pageSize: 20,
          totalPages: 0,
          totalCount: 0,
        }
        // Use summary from response if available
        if (action.payload.summary) {
          state.summary = action.payload.summary
        } else {
          // Calculate summary from transactions using direction model
          const transactions = action.payload.transactions || []
          state.summary = {
            totalDebit: transactions.filter(t => t.direction === 'DEBIT').reduce((sum, t) => sum + t.amount, 0),
            totalCredit: transactions.filter(t => t.direction === 'CREDIT').reduce((sum, t) => sum + t.amount, 0),
            netAmount: transactions.filter(t => t.direction === 'CREDIT').reduce((sum, t) => sum + t.amount, 0) -
              transactions.filter(t => t.direction === 'DEBIT').reduce((sum, t) => sum + t.amount, 0),
            count: transactions.length,
          }
        }
        state.error = null
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Summary
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.summary = action.payload
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
        state.pagination.totalCount += 1
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
        state.pagination.totalCount -= 1
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
