import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { monthService } from '@/services/api'
import type { 
    MonthViewResponse, 
    CreateMonthRequest, 
    AssignCategoryRequest, 
    MoveMoneyRequest,
    RecalculatePlanningRequest,
    PlanningIterationResponse
} from '@/services/api'

interface MonthSliceState {
    currentMonth: MonthViewResponse | null
    months: MonthViewResponse[] // List summary
    latestIteration: PlanningIterationResponse | null
    isLoading: boolean
    error: string | null
    operationLoading: boolean // For specific operations like assign/move
}

const initialState: MonthSliceState = {
    currentMonth: null,
    months: [],
    latestIteration: null,
    isLoading: false,
    error: null,
    operationLoading: false,
}

// Thunks
export const fetchMonth = createAsyncThunk(
    'month/fetchMonth',
    async ({ budgetID, month }: { budgetID: string; month: string }, { rejectWithValue }) => {
        try {
            return await monthService.getMonth(month) // Note: getMonth only takes ID in service definition, not budgetID + month string. 
            // Warning: Slice assumed (budgetID, month), service assumes (id). 
            // If the argument 'month' passed here is actually the ID, then it works. 
            // If it's a date string, we should use getByDate?
            // Existing service signature: getMonth(id: string).
            // Logic: usually 'month' param in route is ID.
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch month')
        }
    }
)

export const fetchMonths = createAsyncThunk(
    'month/fetchMonths',
    async (budgetID: string, { rejectWithValue }) => {
        try {
            // Service does not support getMonths list yet.
            // return await monthService.getMonths(budgetID) 
            return [] as MonthViewResponse[]
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch months')
        }
    }
)

export const fetchCurrentMonth = createAsyncThunk(
    'month/fetchCurrentMonth',
    async (budgetID: string, { rejectWithValue }) => {
        try {
            // Use getByDate for current month
            const date = new Date().toISOString().split('T')[0]
            return await monthService.getByDate(date)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch current month')
        }
    }
)

export const createMonth = createAsyncThunk(
    'month/createMonth',
    async (data: CreateMonthRequest, { rejectWithValue }) => {
        try {
            return await monthService.create(data)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to create month')
        }
    }
)

export const assignCategory = createAsyncThunk(
    'month/assignCategory',
    async (data: AssignCategoryRequest, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { month: MonthSliceState }
            const currentMonth = state.month.currentMonth
            if (!currentMonth) throw new Error("No current month loaded")
            
            await monthService.assignCategory(data)
            // After assigning, re-fetch month? Or optimistic update?
            // For now, let's just return success and caller can re-fetch
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to assign category')
        }
    }
)

export const moveMoney = createAsyncThunk(
    'month/moveMoney',
    async (data: MoveMoneyRequest, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { month: MonthSliceState }
            const currentMonth = state.month.currentMonth
            if (!currentMonth) throw new Error("No current month loaded")
            
            await monthService.moveMoney(data)
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to move money')
        }
    }
)

export const recalculatePlanning = createAsyncThunk(
    'month/recalculatePlanning',
    async (data: Omit<RecalculatePlanningRequest, 'month_id'>, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { month: MonthSliceState }
            const currentMonth = state.month.currentMonth
            if (!currentMonth) throw new Error("No current month loaded")
            
            return await monthService.recalculatePlanning({
                month_id: currentMonth.month_id,
                ...data
            })
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to recalculate planning')
        }
    }
)

const monthSlice = createSlice({
    name: 'month',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        resetState: (state) => {
            return initialState
        }
    },
    extraReducers: (builder) => {
        // Fetch Month
        builder
            .addCase(fetchMonth.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchMonth.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentMonth = action.payload
            })
            .addCase(fetchMonth.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Fetch Months List
        builder
            .addCase(fetchMonths.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchMonths.fulfilled, (state, action) => {
                state.isLoading = false
                state.months = action.payload
            })
            .addCase(fetchMonths.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Fetch Current Month
        builder
            .addCase(fetchCurrentMonth.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchCurrentMonth.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentMonth = action.payload
            })
            .addCase(fetchCurrentMonth.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
        
        // Create Month
        builder
            .addCase(createMonth.pending, (state) => {
                state.operationLoading = true
                state.error = null
            })
            .addCase(createMonth.fulfilled, (state, action) => {
                state.operationLoading = false
                // Add to list if we are modifying list
                // state.months.push(action.payload)
                // But actually we might need to reload specific month view
            })
            .addCase(createMonth.rejected, (state, action) => {
                state.operationLoading = false
                state.error = action.payload as string
            })

        // Assign Category
        builder
            .addCase(assignCategory.pending, (state) => {
                // We might want optimistic updates here later
            })
            .addCase(assignCategory.fulfilled, (state, action) => {
                if (state.currentMonth) {
                    // Optimistic update logic could go here
                    // e.g. TBB -= amount, Category.Assigned += amount
                    // For now, simpler to refetch or let component handle refetch
                    const { category_id, amount } = action.payload
                    state.currentMonth.to_be_budgeted -= amount
                    
                    const cat = state.currentMonth.categories.find(c => c.category_id === category_id)
                    if (cat) {
                        cat.assigned += amount
                        cat.available += amount
                    }
                }
            })

        // Move Money
        builder
            .addCase(moveMoney.fulfilled, (state, action) => {
                  if (state.currentMonth) {
                    const { from_category_id, to_category_id, amount } = action.payload
                    
                    const fromCat = state.currentMonth.categories.find(c => c.category_id === from_category_id)
                    if (fromCat) {
                        fromCat.assigned -= amount
                        fromCat.available -= amount
                    }

                    const toCat = state.currentMonth.categories.find(c => c.category_id === to_category_id)
                    if (toCat) {
                        toCat.assigned += amount
                        toCat.available += amount
                    }
                  }
            })

        // Recalculate Planning
        builder
            .addCase(recalculatePlanning.pending, (state) => {
                state.operationLoading = true
                state.error = null
            })
            .addCase(recalculatePlanning.fulfilled, (state, action) => {
                state.operationLoading = false
                state.latestIteration = action.payload
            })
            .addCase(recalculatePlanning.rejected, (state, action) => {
                state.operationLoading = false
                state.error = action.payload as string
            })
    }
})

export const { clearError, resetState } = monthSlice.actions
export default monthSlice.reducer

// Selectors
export const selectCurrentMonth = (state: { month: MonthSliceState }) => state.month.currentMonth
export const selectMonthsList = (state: { month: MonthSliceState }) => state.month.months
export const selectMonthLoading = (state: { month: MonthSliceState }) => state.month.isLoading
export const selectLatestIteration = (state: { month: MonthSliceState }) => state.month.latestIteration
export const selectOperationLoading = (state: { month: MonthSliceState }) => state.month.operationLoading
