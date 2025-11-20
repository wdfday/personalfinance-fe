import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient, Investment, CreateInvestmentRequest } from '@/lib/api'

interface InvestmentsState {
  investments: Investment[]
  selectedInvestment: Investment | null
  isLoading: boolean
  error: string | null
  total: number
}

const initialState: InvestmentsState = {
  investments: [],
  selectedInvestment: null,
  isLoading: false,
  error: null,
  total: 0,
}

// Async thunks
export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getInvestments()
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch investments')
    }
  }
)

export const fetchInvestment = createAsyncThunk(
  'investments/fetchInvestment',
  async (id: string, { rejectWithValue }) => {
    try {
      const investment = await apiClient.getInvestment(id)
      return investment
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch investment')
    }
  }
)

export const createInvestment = createAsyncThunk(
  'investments/createInvestment',
  async (investmentData: CreateInvestmentRequest, { rejectWithValue }) => {
    try {
      const investment = await apiClient.createInvestment(investmentData)
      return investment
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create investment')
    }
  }
)

export const updateInvestment = createAsyncThunk(
  'investments/updateInvestment',
  async ({ id, data }: { id: string; data: Partial<CreateInvestmentRequest> }, { rejectWithValue }) => {
    try {
      const investment = await apiClient.updateInvestment(id, data)
      return investment
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update investment')
    }
  }
)

export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteInvestment(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete investment')
    }
  }
)

const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedInvestment: (state, action: PayloadAction<Investment | null>) => {
      state.selectedInvestment = action.payload
    },
    clearSelectedInvestment: (state) => {
      state.selectedInvestment = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Investments
      .addCase(fetchInvestments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.isLoading = false
        state.investments = action.payload.investments
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Investment
      .addCase(fetchInvestment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvestment.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedInvestment = action.payload
        state.error = null
      })
      .addCase(fetchInvestment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Investment
      .addCase(createInvestment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.isLoading = false
        state.investments.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createInvestment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Investment
      .addCase(updateInvestment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.investments.findIndex(investment => investment.id === action.payload.id)
        if (index !== -1) {
          state.investments[index] = action.payload
        }
        if (state.selectedInvestment?.id === action.payload.id) {
          state.selectedInvestment = action.payload
        }
        state.error = null
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Investment
      .addCase(deleteInvestment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.isLoading = false
        state.investments = state.investments.filter(investment => investment.id !== action.payload)
        state.total -= 1
        if (state.selectedInvestment?.id === action.payload) {
          state.selectedInvestment = null
        }
        state.error = null
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedInvestment, clearSelectedInvestment } = investmentsSlice.actions
export default investmentsSlice

