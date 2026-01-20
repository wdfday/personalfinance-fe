import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setSelectedCategory,
  clearSelectedCategory,
} from '@/features/categories/categoriesSlice'
import type { CreateCategoryRequest, UpdateCategoryRequest, Category } from '@/services/api/types/categories'

export const useCategories = () => {
  const dispatch = useAppDispatch()
  const { categories, categoriesTree, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.categories
  )

  const refreshCategories = useCallback(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Initial fetch if needed (optional, can be controlled by component)
  useEffect(() => {
    if (categories.length === 0 && !isLoading && !error) {
      dispatch(fetchCategories())
    }
  }, [categories.length, dispatch, error, isLoading])

  const addCategory = useCallback(
    async (data: CreateCategoryRequest) => {
      return dispatch(createCategory(data)).unwrap()
    },
    [dispatch]
  )

  const editCategory = useCallback(
    async (id: string, data: UpdateCategoryRequest) => {
      return dispatch(updateCategory({ id, data })).unwrap()
    },
    [dispatch]
  )

  const removeCategory = useCallback(
    async (id: string) => {
      return dispatch(deleteCategory(id)).unwrap()
    },
    [dispatch]
  )

  const selectCategory = useCallback(
    (category: Category | null) => {
      dispatch(setSelectedCategory(category))
    },
    [dispatch]
  )

  return {
    categories,
    categoriesTree,
    selectedCategory,
    isLoading,
    error,
    refreshCategories,
    addCategory,
    editCategory,
    removeCategory,
    selectCategory,
    clearSelectedCategory: () => dispatch(clearSelectedCategory()),
  }
}
