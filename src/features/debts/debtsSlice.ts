import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { debtsService, Debt, CreateDebtRequest, UpdateDebtRequest, AddPaymentRequest } from '@/services/api'

interface DebtsState {
  debts: Debt[]
  selectedDebt: Debt | null
  isLoading: boolean
  error: string | null
  total: number
}

const initialState: DebtsState = {
  debts: [],
  selectedDebt: null,
  isLoading: false,
  error: null,
  total: 0,
}

// Async thunks
export const fetchDebts = createAsyncThunk(
  'debts/fetchDebts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await debtsService.getDebts()
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch debts')
    }
  }
)

export const fetchDebt = createAsyncThunk(
  'debts/fetchDebt',
  async (id: string, { rejectWithValue }) => {
    try {
      const debt = await debtsService.getDebt(id)
      return debt
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch debt')
    }
  }
)

export const createDebt = createAsyncThunk(
  'debts/createDebt',
  async (debtData: CreateDebtRequest, { rejectWithValue }) => {
    try {
      const debt = await debtsService.createDebt(debtData)
      return debt
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create debt')
    }
  }
)

export const updateDebt = createAsyncThunk(
  'debts/updateDebt',
  async ({ id, data }: { id: string; data: UpdateDebtRequest }, { rejectWithValue }) => {
    try {
      const debt = await debtsService.updateDebt(id, data)
      return debt
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update debt')
    }
  }
)

export const deleteDebt = createAsyncThunk(
  'debts/deleteDebt',
  async (id: string, { rejectWithValue }) => {
    try {
      await debtsService.deleteDebt(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete debt')
    }
  }
)

export const addPayment = createAsyncThunk(
  'debts/addPayment',
  async ({ id, data }: { id: string; data: AddPaymentRequest }, { rejectWithValue }) => {
    try {
      const debt = await debtsService.addPayment(id, data)
      return debt
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add payment')
    }
  }
)

export const markAsPaidOff = createAsyncThunk(
  'debts/markAsPaidOff',
  async (id: string, { rejectWithValue }) => {
    try {
      const debt = await debtsService.markAsPaidOff(id)
      return debt
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark debt as paid off')
    }
  }
)

const debtsSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedDebt: (state, action: PayloadAction<Debt | null>) => {
      state.selectedDebt = action.payload
    },
    clearSelectedDebt: (state) => {
      state.selectedDebt = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Debts
      .addCase(fetchDebts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDebts.fulfilled, (state, action) => {
        state.isLoading = false
        state.debts = action.payload.debts
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchDebts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Debt
      .addCase(fetchDebt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDebt.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedDebt = action.payload
        state.error = null
      })
      .addCase(fetchDebt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Debt
      .addCase(createDebt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDebt.fulfilled, (state, action) => {
        state.isLoading = false
        state.debts.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createDebt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Debt
      .addCase(updateDebt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDebt.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.debts.findIndex(debt => debt.id === action.payload.id)
        if (index !== -1) {
          state.debts[index] = action.payload
        }
        if (state.selectedDebt?.id === action.payload.id) {
          state.selectedDebt = action.payload
        }
        state.error = null
      })
      .addCase(updateDebt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Debt
      .addCase(deleteDebt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDebt.fulfilled, (state, action) => {
        state.isLoading = false
        state.debts = state.debts.filter(debt => debt.id !== action.payload)
        state.total -= 1
        if (state.selectedDebt?.id === action.payload) {
          state.selectedDebt = null
        }
        state.error = null
      })
      .addCase(deleteDebt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add Payment
      .addCase(addPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.debts.findIndex(debt => debt.id === action.payload.id)
        if (index !== -1) {
          state.debts[index] = action.payload
        }
        if (state.selectedDebt?.id === action.payload.id) {
          state.selectedDebt = action.payload
        }
        state.error = null
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Mark As Paid Off
      .addCase(markAsPaidOff.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markAsPaidOff.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.debts.findIndex(debt => debt.id === action.payload.id)
        if (index !== -1) {
          state.debts[index] = action.payload
        }
        if (state.selectedDebt?.id === action.payload.id) {
          state.selectedDebt = action.payload
        }
        state.error = null
      })
      .addCase(markAsPaidOff.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedDebt, clearSelectedDebt } = debtsSlice.actions
export default debtsSlice


