/**
 * Profile Slice
 * Quản lý state cho Profile module (financial & preferences)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { profileService } from '@/services/api'
import type { UserProfile, UpdateUserProfileExtendedRequest } from '@/services/api'
import { getErrorMessage } from '@/services/api/utils'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  isOnboardingCompleted: boolean
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isOnboardingCompleted: false,
}

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await profileService.getProfile()
      return profile
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data: UpdateUserProfileExtendedRequest, { rejectWithValue }) => {
    try {
      const updatedProfile = await profileService.updateProfile(data)
      return updatedProfile
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const completeOnboarding = createAsyncThunk(
  'profile/completeOnboarding',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await profileService.completeOnboarding()
      return profile
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const checkOnboardingStatus = createAsyncThunk(
  'profile/checkOnboarding',
  async (_, { rejectWithValue }) => {
    try {
      const isCompleted = await profileService.isOnboardingCompleted()
      return isCompleted
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
      state.isOnboardingCompleted = action.payload.onboarding_completed
      state.lastUpdated = Date.now()
    },
    clearProfile: (state) => {
      state.profile = null
      state.error = null
      state.lastUpdated = null
      state.isOnboardingCompleted = false
    },
    updateProfileField: (
      state,
      action: PayloadAction<Partial<UserProfile>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.isOnboardingCompleted = action.payload.onboarding_completed
        state.lastUpdated = Date.now()
        state.error = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.isOnboardingCompleted = action.payload.onboarding_completed
        state.lastUpdated = Date.now()
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.isOnboardingCompleted = true
        state.lastUpdated = Date.now()
        state.error = null
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Check Onboarding Status
      .addCase(checkOnboardingStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isOnboardingCompleted = action.payload
      })
      .addCase(checkOnboardingStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearProfileError,
  setProfile,
  clearProfile,
  updateProfileField,
} = profileSlice.actions

export default profileSlice

