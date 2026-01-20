/**
 * Accounts Slice
 * Quản lý state cho Accounts module
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  accountsService, 
  getErrorMessage,
  type Account, 
  type CreateAccountRequest, 
  type UpdateAccountRequest 
} from '@/services/api'

interface AccountsState {
  accounts: Account[]
  selectedAccount: Account | null
  isLoading: boolean
  error: string | null
  total: number
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
  total: 0,
}

// Async thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsService.getAll()
      return response
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchAccount = createAsyncThunk(
  'accounts/fetchAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      const account = await accountsService.getById(id)
      return account
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: CreateAccountRequest, { rejectWithValue }) => {
    try {
      const account = await accountsService.create(accountData)
      return account
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }: { id: string; data: UpdateAccountRequest }, { rejectWithValue }) => {
    try {
      const account = await accountsService.update(id, data)
      return account
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      await accountsService.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedAccount: (state, action: PayloadAction<Account | null>) => {
      state.selectedAccount = action.payload
    },
    clearSelectedAccount: (state) => {
      state.selectedAccount = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false
        state.accounts = action.payload.items
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Account
      .addCase(fetchAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedAccount = action.payload
        state.error = null
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.accounts.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Account
      .addCase(updateAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.accounts.findIndex(account => account.id === action.payload.id)
        if (index !== -1) {
          state.accounts[index] = action.payload
        }
        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = action.payload
        }
        state.error = null
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.accounts = state.accounts.filter(account => account.id !== action.payload)
        state.total -= 1
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null
        }
        state.error = null
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedAccount, clearSelectedAccount } = accountsSlice.actions
export default accountsSlice
