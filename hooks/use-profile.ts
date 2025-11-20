/**
 * Custom hooks for Profile module
 */

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  fetchProfile,
  updateProfile,
  completeOnboarding,
  checkOnboardingStatus,
  clearProfileError,
  setProfile,
  clearProfile,
  updateProfileField,
} from '@/features/profile/profileSlice'
import type { UpdateUserProfileExtendedRequest, UserProfile } from '@/services/api'

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    profile,
    isLoading,
    error,
    lastUpdated,
    isOnboardingCompleted,
  } = useSelector((state: RootState) => state.profile)

  const fetchUserProfile = useCallback(() => {
    return dispatch(fetchProfile())
  }, [dispatch])

  const updateUserProfile = useCallback(
    (data: UpdateUserProfileExtendedRequest) => {
      return dispatch(updateProfile(data))
    },
    [dispatch]
  )

  const finishOnboarding = useCallback(() => {
    return dispatch(completeOnboarding())
  }, [dispatch])

  const checkOnboarding = useCallback(() => {
    return dispatch(checkOnboardingStatus())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearProfileError())
  }, [dispatch])

  const setUserProfile = useCallback(
    (profileData: UserProfile) => {
      dispatch(setProfile(profileData))
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch(clearProfile())
  }, [dispatch])

  const updateField = useCallback(
    (data: Partial<UserProfile>) => {
      dispatch(updateProfileField(data))
    },
    [dispatch]
  )

  return {
    profile,
    isLoading,
    error,
    lastUpdated,
    isOnboardingCompleted,
    fetchProfile: fetchUserProfile,
    updateProfile: updateUserProfile,
    completeOnboarding: finishOnboarding,
    checkOnboardingStatus: checkOnboarding,
    clearError,
    setProfile: setUserProfile,
    clearProfile: clear,
    updateProfileField: updateField,
  }
}

