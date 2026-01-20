// Category Service
import { apiClient } from '../client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse } from '../types/categories'

export const categoriesService = {
  async getAll(): Promise<CategoryListResponse> {
    return apiClient.get<CategoryListResponse>('/categories')
  },

  async getById(id: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`)
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>('/categories', data)
  },

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/categories/${id}`)
  },
}

export default categoriesService
