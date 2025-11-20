/**
 * User Slice
 * Quản lý state cho User module (basic user info)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { userService } from '@/services/api'
import type { User, UpdateUserProfileRequest } from '@/services/api'
import { getErrorMessage } from '@/services/api/utils'

interface UserState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Async thunks
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getCurrentUser()
      return user
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: UpdateUserProfileRequest, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.updateProfile(data)
      return updatedUser
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (
    data: { current_password: string; new_password: string },
    { rejectWithValue }
  ) => {
    try {
      await userService.changePassword(data)
      return { success: true }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.lastUpdated = Date.now()
    },
    clearUser: (state) => {
      state.currentUser = null
      state.error = null
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.lastUpdated = Date.now()
        state.error = null
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.lastUpdated = Date.now()
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUserError, setUser, clearUser } = userSlice.actions
export default userSlice

