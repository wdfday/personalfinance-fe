import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { budgetConstraintsService } from '@/services/api'
import type {
    BudgetConstraint,
    BudgetConstraintSummary,
    CreateBudgetConstraintRequest,
    UpdateBudgetConstraintRequest,
    BudgetConstraintFilters,
} from '@/services/api'

interface BudgetConstraintsState {
    constraints: BudgetConstraint[]
    selectedConstraint: BudgetConstraint | null
    summary: BudgetConstraintSummary | null
    isLoading: boolean
    error: string | null
    total: number
    isInitialized: boolean
}

const initialState: BudgetConstraintsState = {
    constraints: [],
    selectedConstraint: null,
    summary: null,
    isLoading: false,
    error: null,
    total: 0,
    isInitialized: false,
}

// Async thunks
export const fetchConstraints = createAsyncThunk(
    'budgetConstraints/fetchConstraints',
    async (filters: BudgetConstraintFilters | undefined, { rejectWithValue }) => {
        try {
            const response = await budgetConstraintsService.getAll()
            return response
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch budget constraints'
            )
        }
    }
)

export const fetchConstraint = createAsyncThunk(
    'budgetConstraints/fetchConstraint',
    async (id: string, { rejectWithValue }) => {
        try {
            const constraint = await budgetConstraintsService.getById(id)
            return constraint
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch budget constraint'
            )
        }
    }
)

export const fetchConstraintSummary = createAsyncThunk(
    'budgetConstraints/fetchConstraintSummary',
    async (_, { rejectWithValue }) => {
        try {
            const summary = await budgetConstraintsService.getSummary()
            return summary
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch constraint summary'
            )
        }
    }
)

export const createConstraint = createAsyncThunk(
    'budgetConstraints/createConstraint',
    async (data: CreateBudgetConstraintRequest, { rejectWithValue }) => {
        try {
            const constraint = await budgetConstraintsService.create(data)
            return constraint
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create budget constraint'
            )
        }
    }
)

export const updateConstraint = createAsyncThunk(
    'budgetConstraints/updateConstraint',
    async (
        { id, data }: { id: string; data: UpdateBudgetConstraintRequest },
        { rejectWithValue }
    ) => {
        try {
            const constraint = await budgetConstraintsService.update(id, data)
            return constraint
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update budget constraint'
            )
        }
    }
)

export const deleteConstraint = createAsyncThunk(
    'budgetConstraints/deleteConstraint',
    async (id: string, { rejectWithValue }) => {
        try {
            await budgetConstraintsService.delete(id)
            return id
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to delete budget constraint'
            )
        }
    }
)

const budgetConstraintsSlice = createSlice({
    name: 'budgetConstraints',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setSelectedConstraint: (state, action: PayloadAction<BudgetConstraint | null>) => {
            state.selectedConstraint = action.payload
        },
        clearSelectedConstraint: (state) => {
            state.selectedConstraint = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Constraints
            .addCase(fetchConstraints.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchConstraints.fulfilled, (state, action) => {
                state.isLoading = false
                // Backend returns { budget_constraints: [...], count: 5 }
                state.constraints = action.payload.budget_constraints
                state.total = action.payload.count
                state.isInitialized = true
                state.error = null
            })
            .addCase(fetchConstraints.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Fetch Constraint
            .addCase(fetchConstraint.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchConstraint.fulfilled, (state, action) => {
                state.isLoading = false
                state.selectedConstraint = action.payload
                state.error = null
            })
            .addCase(fetchConstraint.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Fetch Summary
            .addCase(fetchConstraintSummary.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchConstraintSummary.fulfilled, (state, action) => {
                state.isLoading = false
                state.summary = action.payload
                state.error = null
            })
            .addCase(fetchConstraintSummary.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Create Constraint
            .addCase(createConstraint.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createConstraint.fulfilled, (state, action) => {
                state.isLoading = false
                state.constraints.push(action.payload)
                state.total += 1
                state.error = null
            })
            .addCase(createConstraint.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Update Constraint
            .addCase(updateConstraint.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateConstraint.fulfilled, (state, action) => {
                state.isLoading = false
                const index = state.constraints.findIndex((c) => c.id === action.payload.id)
                if (index !== -1) {
                    state.constraints[index] = action.payload
                }
                if (state.selectedConstraint?.id === action.payload.id) {
                    state.selectedConstraint = action.payload
                }
                state.error = null
            })
            .addCase(updateConstraint.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Delete Constraint
            .addCase(deleteConstraint.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteConstraint.fulfilled, (state, action) => {
                state.isLoading = false
                state.constraints = state.constraints.filter((c) => c.id !== action.payload)
                state.total -= 1
                if (state.selectedConstraint?.id === action.payload) {
                    state.selectedConstraint = null
                }
                state.error = null
            })
            .addCase(deleteConstraint.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError, setSelectedConstraint, clearSelectedConstraint } =
    budgetConstraintsSlice.actions
export default budgetConstraintsSlice
