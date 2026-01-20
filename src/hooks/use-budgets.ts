import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  setSelectedBudget,
} from '@/features/budgets/budgetsSlice'
import type { CreateBudgetRequest, UpdateBudgetRequest, Budget, BudgetFilters } from '@/services/api/types/budgets'

export const useBudgets = () => {
  const dispatch = useAppDispatch()
  const { budgets, selectedBudget, isLoading, error } = useAppSelector((state) => state.budgets)

  const refreshBudgets = useCallback(
    (filters?: BudgetFilters) => {
      dispatch(fetchBudgets(filters))
    },
    [dispatch]
  )

  const isInitialized = useAppSelector((state) => state.budgets.isInitialized)

  useEffect(() => {
      if (budgets.length === 0 && !isLoading && !error && !isInitialized) {
          dispatch(fetchBudgets())
      }
  }, [budgets.length, dispatch, error, isLoading, isInitialized])


  const addBudget = useCallback(
    async (data: CreateBudgetRequest) => {
      return dispatch(createBudget(data)).unwrap()
    },
    [dispatch]
  )

  const editBudget = useCallback(
    async (id: string, data: UpdateBudgetRequest) => {
      return dispatch(updateBudget({ id, data })).unwrap()
    },
    [dispatch]
  )

  const removeBudget = useCallback(
    async (id: string) => {
      return dispatch(deleteBudget(id)).unwrap()
    },
    [dispatch]
  )

  const selectBudget = useCallback(
    (budget: Budget | null) => {
      dispatch(setSelectedBudget(budget))
    },
    [dispatch]
  )

  return {
    budgets,
    selectedBudget,
    isLoading,
    error,
    refreshBudgets,
    addBudget,
    editBudget,
    removeBudget,
    selectBudget,
  }
}
