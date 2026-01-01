/**
 * Categories Service
 * Quản lý danh mục thu chi
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'
import type { Category, CategoryType } from '@/types/api'

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  parent_id?: string
  icon?: string
  color?: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  type?: CategoryType
  parent_id?: string
  icon?: string
  color?: string
  is_active?: boolean
  description?: string
}

export interface CategoryListResponse {
  items: Category[]
  total: number
}

// Re-export types for backward compatibility
export type { Category }

class CategoriesService {
  /**
   * Lấy danh sách categories (flat list)
   */
  async getCategories(): Promise<CategoryListResponse> {
    return baseApiClient.get<CategoryListResponse>('/categories')
  }

  /**
   * Lấy categories dạng tree (hierarchical)
   */
  async getCategoriesTree(): Promise<Category[]> {
    return baseApiClient.get<Category[]>('/categories/tree')
  }

  /**
   * Lấy thông tin một category
   */
  async getCategory(id: string): Promise<Category> {
    return baseApiClient.get<Category>(`/categories/${id}`)
  }

  /**
   * Tạo category mới
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return baseApiClient.post<Category>('/categories', data)
  }

  /**
   * Cập nhật category
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return baseApiClient.put<Category>(`/categories/${id}`, data)
  }

  /**
   * Xóa category (soft delete)
   */
  async deleteCategory(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/categories/${id}`)
  }

  /**
   * Lấy categories theo type (income/expense)
   */
  async getCategoriesByType(type: CategoryType): Promise<Category[]> {
    const response = await this.getCategories()
    return response.items.filter(cat => cat.type === type)
  }

  /**
   * Lấy system categories (built-in)
   */
  async getSystemCategories(): Promise<Category[]> {
    const response = await this.getCategories()
    return response.items.filter(cat => cat.is_system)
  }

  /**
   * Lấy user custom categories
   */
  async getUserCategories(): Promise<Category[]> {
    const response = await this.getCategories()
    return response.items.filter(cat => !cat.is_system)
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService()
export default categoriesService
