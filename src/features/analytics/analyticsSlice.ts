import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import analyticsService, {
  BudgetAllocationInput,
  BudgetAllocationResult,
  DebtStrategyInput,
  DebtStrategyResult,
} from "./analytics.service"

interface AnalyticsState {
  budgetAllocation: {
    data: BudgetAllocationResult | null
    loading: boolean
    error: string | null
  }
  debtStrategy: {
    data: DebtStrategyResult | null
    loading: boolean
    error: string | null
  }
  goalPrioritization: {
    data: any | null
    loading: boolean
    error: string | null
  }
  debtTradeoff: {
    data: any | null // To be refined with DebtTradeoffResult
    loading: boolean
    error: string | null
  }
}

const initialState: AnalyticsState = {
  budgetAllocation: {
    data: null,
    loading: false,
    error: null,
  },
  debtStrategy: {
    data: null,
    loading: false,
    error: null,
  },
  goalPrioritization: {
    data: null,
    loading: false,
    error: null,
  },
  debtTradeoff: {
    data: null,
    loading: false,
    error: null,
  },
}

// Thunks
export const runBudgetAllocation = createAsyncThunk(
  "analytics/runBudgetAllocation",
  async (input: BudgetAllocationInput, { rejectWithValue }) => {
    try {
      return await analyticsService.allocateBudget(input)
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to run budget allocation")
    }
  }
)

export const simulateDebtStrategy = createAsyncThunk(
  "analytics/simulateDebtStrategy",
  async (input: DebtStrategyInput, { rejectWithValue }) => {
    try {
      return await analyticsService.simulateDebtStrategy(input)
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to simulate debt strategy")
    }
  }
)

export const prioritizeGoals = createAsyncThunk(
  "analytics/prioritizeGoals",
  async (input: any, { rejectWithValue }) => {
    try {
      return await analyticsService.prioritizeGoals(input)
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to prioritize goals")
    }
  }
)

export const analyzeDebtTradeoff = createAsyncThunk(
  "analytics/analyzeDebtTradeoff",
  async (input: any, { rejectWithValue }) => {
    try {
      return await analyticsService.analyzeDebtTradeoff(input)
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to analyze debt tradeoff")
    }
  }
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetBudgetAllocation: (state) => {
      state.budgetAllocation = { data: null, loading: false, error: null }
    },
    resetDebtStrategy: (state) => {
        state.debtStrategy = { data: null, loading: false, error: null }
    },
    resetGoalPrioritization: (state) => {
        state.goalPrioritization = { data: null, loading: false, error: null }
    },
    resetDebtTradeoff: (state) => {
        state.debtTradeoff = { data: null, loading: false, error: null }
    }
  },
  extraReducers: (builder) => {
    // Budget Allocation
    builder.addCase(runBudgetAllocation.pending, (state) => {
      state.budgetAllocation.loading = true
      state.budgetAllocation.error = null
    })
    builder.addCase(runBudgetAllocation.fulfilled, (state, action) => {
      state.budgetAllocation.loading = false
      state.budgetAllocation.data = action.payload
    })
    builder.addCase(runBudgetAllocation.rejected, (state, action) => {
      state.budgetAllocation.loading = false
      state.budgetAllocation.error = action.payload as string
    })

    // Debt Strategy
    builder.addCase(simulateDebtStrategy.pending, (state) => {
      state.debtStrategy.loading = true
      state.debtStrategy.error = null
    })
    builder.addCase(simulateDebtStrategy.fulfilled, (state, action) => {
        state.debtStrategy.loading = false
        state.debtStrategy.data = action.payload
    })
    builder.addCase(simulateDebtStrategy.rejected, (state, action) => {
        state.debtStrategy.loading = false
        state.debtStrategy.error = action.payload as string
    })

    // Goal Prioritization
    builder.addCase(prioritizeGoals.pending, (state) => {
        state.goalPrioritization.loading = true
        state.goalPrioritization.error = null
    })
    builder.addCase(prioritizeGoals.fulfilled, (state, action) => {
        state.goalPrioritization.loading = false
        state.goalPrioritization.data = action.payload
    })
    builder.addCase(prioritizeGoals.rejected, (state, action) => {
        state.goalPrioritization.loading = false
        state.goalPrioritization.error = action.payload as string
    })

    // Debt Tradeoff
    builder.addCase(analyzeDebtTradeoff.pending, (state) => {
        state.debtTradeoff.loading = true
        state.debtTradeoff.error = null
    })
    builder.addCase(analyzeDebtTradeoff.fulfilled, (state, action) => {
        state.debtTradeoff.loading = false
        state.debtTradeoff.data = action.payload
    })
    builder.addCase(analyzeDebtTradeoff.rejected, (state, action) => {
        state.debtTradeoff.loading = false
        state.debtTradeoff.error = action.payload as string
    })
  },
})

export const { resetBudgetAllocation, resetDebtStrategy, resetGoalPrioritization, resetDebtTradeoff } = analyticsSlice.actions
export default analyticsSlice.reducer
