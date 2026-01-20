
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { incomeProfilesService } from "@/services/api/services/income-profiles.service"
import { IncomeProfile, CreateIncomeProfileRequest, UpdateIncomeProfileRequest, IncomeSummary } from "@/services/api/types/income-profiles"
import { RootState } from '@/lib/store'

interface IncomeState {
  items: IncomeProfile[]
  summary: IncomeSummary | null
  isLoading: boolean
  error: string | null
}

const initialState: IncomeState = {
  items: [],
  summary: null,
  isLoading: false,
  error: null,
}

export const fetchIncomeProfiles = createAsyncThunk(
  'income/fetchIncomeProfiles',
  async (params: { status?: string; is_recurring?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await incomeProfilesService.getAll(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch income profiles')
    }
  }
)

export const createIncomeProfile = createAsyncThunk(
  'income/createIncomeProfile',
  async (data: CreateIncomeProfileRequest, { rejectWithValue }) => {
    try {
      const response = await incomeProfilesService.create(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create income profile')
    }
  }
)

export const updateIncomeProfile = createAsyncThunk(
  'income/updateIncomeProfile',
  async ({ id, data }: { id: string; data: UpdateIncomeProfileRequest }, { rejectWithValue }) => {
    try {
      const response = await incomeProfilesService.update(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update income profile')
    }
  }
)

export const verifyIncomeProfile = createAsyncThunk(
  'income/verifyIncomeProfile',
  async ({ id, verified }: { id: string; verified: boolean }, { rejectWithValue }) => {
    try {
      const response = await incomeProfilesService.verify(id, verified)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify income profile')
    }
  }
)

export const deleteIncomeProfile = createAsyncThunk(
  'income/deleteIncomeProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      await incomeProfilesService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete income profile')
    }
  }
)

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchIncomeProfiles.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIncomeProfiles.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.income_profiles
        if (action.payload.summary) {
            state.summary = action.payload.summary
        }
      })
      .addCase(fetchIncomeProfiles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create
    builder
      .addCase(createIncomeProfile.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })

    // Update & Verify
    builder
      .addCase(updateIncomeProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(verifyIncomeProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })

    // Delete
    builder
      .addCase(deleteIncomeProfile.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export const { clearError } = incomeSlice.actions
export default incomeSlice.reducer
