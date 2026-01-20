import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { budgetsService } from '@/services/api'
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '@/services/api/types/budgets'

interface BudgetsState {
  budgets: Budget[]
  selectedBudget: Budget | null
  isLoading: boolean
  error: string | null
  total: number
  isInitialized: boolean
}

const initialState: BudgetsState = {
  budgets: [],
  selectedBudget: null,
  isLoading: false,
  error: null,
  total: 0,
  isInitialized: false,
}

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetsService.getAll()
      console.log('📊 Budget API response:', response)
      // API returns { data: [...], total, page, page_size, total_pages }
      const budgets = (response as unknown as { data: Budget[] }).data || response.items || []
      return {
        budgets,
        total: response.total || budgets.length
      }
    } catch (error) {
      console.error('❌ Budget API error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch budgets')
    }
  }
)

export const fetchBudget = createAsyncThunk(
  'budgets/fetchBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetsService.getById(id)
      return budget
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch budget')
    }
  }
)

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: CreateBudgetRequest, { rejectWithValue }) => {
    try {
      const budget = await budgetsService.create(budgetData)
      return budget
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create budget')
    }
  }
)

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: string; data: Partial<UpdateBudgetRequest> }, { rejectWithValue }) => {
    try {
      const budget = await budgetsService.update(id, data as UpdateBudgetRequest)
      return budget
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update budget')
    }
  }
)

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetsService.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete budget')
    }
  }
)

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedBudget: (state, action: PayloadAction<Budget | null>) => {
      state.selectedBudget = action.payload
    },
    clearSelectedBudget: (state) => {
      state.selectedBudget = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgets = action.payload.budgets
        state.total = action.payload.total
        state.error = null
        state.isInitialized = true
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isInitialized = true
      })
      // Fetch Budget
      .addCase(fetchBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedBudget = action.payload
        state.error = null
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgets.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id)
        if (index !== -1) {
          state.budgets[index] = action.payload
        }
        if (state.selectedBudget?.id === action.payload.id) {
          state.selectedBudget = action.payload
        }
        state.error = null
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload)
        state.total -= 1
        if (state.selectedBudget?.id === action.payload) {
          state.selectedBudget = null
        }
        state.error = null
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedBudget, clearSelectedBudget } = budgetsSlice.actions
export const selectBudgets = (state: { budgets: BudgetsState }) => state.budgets.budgets
export default budgetsSlice

