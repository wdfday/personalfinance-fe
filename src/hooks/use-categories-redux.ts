"use client"

/**
 * Hook tiện ích cho Categories Redux state
 */

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
  setSelectedCategory,
  clearSelectedCategory,
} from '@/features/categories/categoriesSlice'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/services/api'

export function useCategoriesRedux() {
  const dispatch = useAppDispatch()
  const categoriesState = useAppSelector((state) => state.categories)

  return {
    categories: categoriesState.categories,
    selectedCategory: categoriesState.selectedCategory,
    isLoading: categoriesState.isLoading,
    error: categoriesState.error,
    total: categoriesState.total,

    fetchCategories: () => dispatch(fetchCategories()),
    fetchCategory: (id: string) => dispatch(fetchCategory(id)),
    createCategory: (data: CreateCategoryRequest) => dispatch(createCategory(data)),
    updateCategory: (id: string, data: UpdateCategoryRequest) => dispatch(updateCategory({ id, data })),
    deleteCategory: (id: string) => dispatch(deleteCategory(id)),

    clearError: () => dispatch(clearError()),
    setSelectedCategory: (category: typeof categoriesState.selectedCategory) => dispatch(setSelectedCategory(category)),
    clearSelectedCategory: () => dispatch(clearSelectedCategory()),
  }
}


