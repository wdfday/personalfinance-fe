/**
 * Categories Slice
 * Quản lý state cho Categories module
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { categoriesService } from '@/services/api'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse } from '@/services/api'
import { getErrorMessage } from '@/services/api/utils'

interface CategoriesState {
  categories: Category[]
  selectedCategory: Category | null
  isLoading: boolean
  error: string | null
  total: number
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  total: 0,
}

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesService.getCategories()
      return response
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchCategory = createAsyncThunk(
  'categories/fetchCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const category = await categoriesService.getCategory(id)
      return category
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      const category = await categoriesService.createCategory(categoryData)
      return category
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: UpdateCategoryRequest }, { rejectWithValue }) => {
    try {
      const category = await categoriesService.updateCategory(id, data)
      return category
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoriesService.deleteCategory(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.categories
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Category
      .addCase(fetchCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCategory = action.payload
        state.error = null
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories.push(action.payload)
        state.total += 1
        state.error = null
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.categories.findIndex(category => category.id === action.payload.id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload
        }
        state.error = null
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = state.categories.filter(category => category.id !== action.payload)
        state.total -= 1
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null
        }
        state.error = null
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedCategory, clearSelectedCategory } = categoriesSlice.actions
export default categoriesSlice

