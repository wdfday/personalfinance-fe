import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient, Goal, CreateGoalRequest } from '@/lib/api'

interface GoalsState {
  goals: Goal[]
  selectedGoal: Goal | null
  isLoading: boolean
  error: string | null
  total: number
}

const initialState: GoalsState = {
  goals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,
  total: 0,
}

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getGoals()
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goals')
    }
  }
)

export const fetchGoal = createAsyncThunk(
  'goals/fetchGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      const goal = await apiClient.getGoal(id)
      return goal
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goal')
    }
  }
)

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: CreateGoalRequest, { rejectWithValue }) => {
    try {
      const goal = await apiClient.createGoal(goalData)
      return goal
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create goal')
    }
  }
)

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, data }: { id: string; data: Partial<CreateGoalRequest> }, { rejectWithValue }) => {
    try {
      const goal = await apiClient.updateGoal(id, data)
      return goal
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update goal')
    }
  }
)

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteGoal(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete goal')
    }
  }
)

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedGoal: (state, action: PayloadAction<Goal | null>) => {
      state.selectedGoal = action.payload
    },
    clearSelectedGoal: (state) => {
      state.selectedGoal = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Goals
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false
        state.goals = action.payload.goals
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Goal
      .addCase(fetchGoal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGoal.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedGoal = action.payload
        state.error = null
      })
      .addCase(fetchGoal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Goal
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false
        state.goals.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Goal
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
        if (state.selectedGoal?.id === action.payload.id) {
          state.selectedGoal = action.payload
        }
        state.error = null
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Goal
      .addCase(deleteGoal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.isLoading = false
        state.goals = state.goals.filter(goal => goal.id !== action.payload)
        state.total -= 1
        if (state.selectedGoal?.id === action.payload) {
          state.selectedGoal = null
        }
        state.error = null
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedGoal, clearSelectedGoal } = goalsSlice.actions
export default goalsSlice

