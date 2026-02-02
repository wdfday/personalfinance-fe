/**
 * Auth Slice
 * Quản lý authentication state (login, register, logout)
 * Note: User data được quản lý bởi userSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/api/services/auth.service'
import { usersService } from '@/services/api/services/users.service'
import type { UserAuthInfo } from '@/services/api/types/auth'
import { getErrorMessage } from '@/services/api/utils'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

interface AuthState {
  authInfo: UserAuthInfo | null  // Minimal info từ login/register
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  authInfo: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return {
        authInfo: response.user,
        token: response.token.access_token,
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return {
        authInfo: response.user,
        token: response.token.access_token,
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists
      const token = authService.getToken()
      if (!token) {
        throw new Error('No token found')
      }
      
      // Get current user from User Service
      const user = await usersService.getMe()
      
      return { user, token }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.authInfo = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
    setToken: (state, action) => {
      state.token = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.authInfo = action.payload.authInfo
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.authInfo = action.payload.authInfo
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        // Không set user ở đây, sẽ set ở userSlice
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.token = null
      })
  },
})

export const { logout, clearAuthError, setToken } = authSlice.actions
export default authSlice
