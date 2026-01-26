import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchConstraints,
  fetchConstraintSummary,
  createConstraint,
  updateConstraint,
  archiveConstraint,
  endConstraint,
  setSelectedConstraint,
} from '@/features/budget-constraints/budgetConstraintsSlice'
import type { CreateBudgetConstraintRequest, UpdateBudgetConstraintRequest, BudgetConstraint } from '@/services/api/types/budget-constraints'

export const useBudgetConstraints = () => {
  const dispatch = useAppDispatch()
  const { constraints, summary, selectedConstraint, isLoading, error } = useAppSelector(
    (state) => state.budgetConstraints
  )

  const refreshConstraints = useCallback(() => {
    dispatch(fetchConstraints())
  }, [dispatch])

  const refreshSummary = useCallback(() => {
    dispatch(fetchConstraintSummary())
  }, [dispatch])

  const isInitialized = useAppSelector(state => state.budgetConstraints.isInitialized)

  // Optional: Auto fetch
  useEffect(() => {
    if (!constraints.length && !isLoading && !error && !isInitialized) {
      dispatch(fetchConstraints())
      dispatch(fetchConstraintSummary())
    }
  }, [constraints.length, dispatch, error, isLoading])

  const addConstraint = useCallback(
    async (data: CreateBudgetConstraintRequest) => {
      return dispatch(createConstraint(data)).unwrap()
    },
    [dispatch]
  )

  const editConstraint = useCallback(
    async (id: string, data: UpdateBudgetConstraintRequest) => {
      return dispatch(updateConstraint({ id, data })).unwrap()
    },
    [dispatch]
  )

  const archiveConstraintAction = useCallback(
    async (id: string) => {
      return dispatch(archiveConstraint(id)).unwrap()
    },
    [dispatch]
  )

  const endConstraintAction = useCallback(
    async (id: string) => {
      return dispatch(endConstraint(id)).unwrap()
    },
    [dispatch]
  )

  const selectConstraint = useCallback(
    (constraint: BudgetConstraint | null) => {
      dispatch(setSelectedConstraint(constraint))
    },
    [dispatch]
  )

  return {
    constraints,
    summary,
    selectedConstraint,
    isLoading,
    error,
    refreshConstraints,
    refreshSummary,
    addConstraint,
    editConstraint,
    archiveConstraint: archiveConstraintAction,
    endConstraint: endConstraintAction,
    selectConstraint,
  }
}
