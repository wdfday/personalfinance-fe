/**
 * Custom hooks for User module
 */

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  fetchCurrentUser,
  updateUserProfile,
  changePassword,
  clearUserError,
  setUser,
  clearUser,
} from '@/features/user/userSlice'
import type { UpdateUserProfileRequest } from '@/services/api'

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser, isLoading, error, lastUpdated } = useSelector(
    (state: RootState) => state.user
  )

  const fetchUser = useCallback(() => {
    return dispatch(fetchCurrentUser())
  }, [dispatch])

  const updateProfile = useCallback(
    (data: UpdateUserProfileRequest) => {
      return dispatch(updateUserProfile(data))
    },
    [dispatch]
  )

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      return dispatch(
        changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        })
      )
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearUserError())
  }, [dispatch])

  const setCurrentUser = useCallback(
    (user: any) => {
      dispatch(setUser(user))
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch(clearUser())
  }, [dispatch])

  return {
    user: currentUser,
    isLoading,
    error,
    lastUpdated,
    fetchUser,
    updateProfile,
    updatePassword,
    clearError,
    setUser: setCurrentUser,
    clearUser: clear,
  }
}

