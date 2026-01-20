import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    budgetAllocationService,
    type ExecuteAllocationRequest,
    type GenerateAllocationRequest,
    type BudgetAllocationModelOutput,
    type AllocationScenario
} from '@/services/api'

interface BudgetAllocationState {
    result: BudgetAllocationModelOutput | null
    selectedScenario: AllocationScenario | null
    isLoading: boolean
    error: string | null
}

const initialState: BudgetAllocationState = {
    result: null,
    selectedScenario: null,
    isLoading: false,
    error: null,
}

// Async thunks
export const executeBudgetAllocation = createAsyncThunk(
    'budgetAllocation/execute',
    async (request: ExecuteAllocationRequest, { rejectWithValue }) => {
        try {
            const response = await budgetAllocationService.executeScenario(request)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to execute budget allocation')
        }
    }
)

export const generateAllocations = createAsyncThunk(
    'budgetAllocation/generate',
    async (params: { userId: string; year: number; month: number; overrideIncome?: number }, { rejectWithValue }) => {
        try {
            const request: GenerateAllocationRequest = {
                user_id: params.userId,
                year: params.year,
                month: params.month,
                override_income: params.overrideIncome,
            }
            const response = await budgetAllocationService.generateScenarios(request)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to generate allocations')
        }
    }
)

const budgetAllocationSlice = createSlice({
    name: 'budgetAllocation',
    initialState,
    reducers: {
        clearResult: (state) => {
            state.result = null
            state.selectedScenario = null
            state.error = null
        },
        selectScenario: (state, action: PayloadAction<'conservative' | 'balanced' | 'aggressive'>) => {
            if (state.result) {
                state.selectedScenario = state.result.scenarios.find(s => s.type === action.payload) || null
            }
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Execute allocation
            .addCase(executeBudgetAllocation.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(executeBudgetAllocation.fulfilled, (state, action) => {
                state.isLoading = false
                state.result = action.payload
                // Auto-select balanced scenario if available
                state.selectedScenario = action.payload.scenarios.find(s => s.type === 'balanced')
                    || action.payload.scenarios[0] || null
                state.error = null
            })
            .addCase(executeBudgetAllocation.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Generate allocations
            .addCase(generateAllocations.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(generateAllocations.fulfilled, (state, action) => {
                state.isLoading = false
                state.result = action.payload
                state.selectedScenario = action.payload.scenarios.find(s => s.type === 'balanced')
                    || action.payload.scenarios[0] || null
                state.error = null
            })
            .addCase(generateAllocations.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    },
})

export const { clearResult, selectScenario, clearError } = budgetAllocationSlice.actions
export default budgetAllocationSlice
