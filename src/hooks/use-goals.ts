import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  archiveGoal,
  unarchiveGoal,
} from '@/features/goals/goalsSlice'
import type { CreateGoalRequest, UpdateGoalRequest, Goal } from '@/services/api/types/goals'

export const useGoals = () => {
  const dispatch = useAppDispatch()
  const { goals, isLoading, error, total } = useAppSelector((state) => state.goals)

  const refreshGoals = useCallback(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  // Optional: Auto fetch
  // useEffect(() => { dispatch(fetchGoals()) }, [dispatch])

  const addGoal = useCallback(
    async (data: CreateGoalRequest) => {
      return dispatch(createGoal(data)).unwrap()
    },
    [dispatch]
  )

  const editGoal = useCallback(
    async (id: string, data: UpdateGoalRequest) => {
      return dispatch(updateGoal({ id, data })).unwrap()
    },
    [dispatch]
  )

  const removeGoal = useCallback(
    async (id: string) => {
      return dispatch(deleteGoal(id)).unwrap()
    },
    [dispatch]
  )

  const archive = useCallback(
    async (id: string) => {
      return dispatch(archiveGoal(id)).unwrap()
    },
    [dispatch]
  )

  const unarchive = useCallback(
    async (id: string) => {
      return dispatch(unarchiveGoal(id)).unwrap()
    },
    [dispatch]
  )

  return {
    goals,
    total,
    isLoading,
    error,
    refreshGoals,
    addGoal,
    editGoal,
    removeGoal,
    archiveGoal: archive,
    unarchiveGoal: unarchive,
  }
}
