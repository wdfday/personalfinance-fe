/**
 * Custom hooks for Auth module with Redux
 */

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  loginUser,
  registerUser,
  checkAuth,
  logout,
  clearAuthError,
  setToken,
} from '@/features/auth/authSlice'
import type { LoginRequest, RegisterRequest } from '@/features/auth/authSlice'

export const useAuthRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { authInfo, token, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  const login = useCallback(
    (credentials: LoginRequest) => {
      return dispatch(loginUser(credentials))
    },
    [dispatch]
  )

  const register = useCallback(
    (userData: RegisterRequest) => {
      return dispatch(registerUser(userData))
    },
    [dispatch]
  )

  const checkAuthentication = useCallback(() => {
    return dispatch(checkAuth())
  }, [dispatch])

  const logoutUser = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const updateToken = useCallback(
    (newToken: string) => {
      dispatch(setToken(newToken))
    },
    [dispatch]
  )

  return {
    authInfo,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    checkAuth: checkAuthentication,
    logout: logoutUser,
    clearError,
    setToken: updateToken,
  }
}

