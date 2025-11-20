/**
 * Categories Service
 * Quản lý danh mục thu chi
 */

import { baseApiClient } from './base'

// Types
export interface Category {
  id: string
  user_id?: string | number
  name: string
  type: 'income' | 'expense' | 'transfer'
  parent_id?: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  type: 'income' | 'expense' | 'transfer'
  parent_id?: string
  icon: string
  color: string
}

export interface UpdateCategoryRequest {
  name?: string
  type?: 'income' | 'expense' | 'transfer'
  parent_id?: string
  icon?: string
  color?: string
  is_active?: boolean
}

export interface CategoryListResponse {
  categories: Category[]
  total: number
}

class CategoriesService {
  /**
   * Lấy danh sách tất cả categories
   */
  async getCategories(): Promise<CategoryListResponse> {
    const response = await baseApiClient.get<{ categories: Category[], count: number }>('/categories')
    return {
      categories: Array.isArray(response?.categories) ? response.categories : [],
      total: response?.count ?? (Array.isArray(response?.categories) ? response.categories.length : 0),
    }
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
   * Xóa category
   */
  async deleteCategory(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/categories/${id}`)
  }

  /**
   * Lấy categories theo type
   */
  async getCategoriesByType(type: 'income' | 'expense' | 'transfer'): Promise<Category[]> {
    const { categories } = await this.getCategories()
    return categories.filter(c => c.type === type && c.is_active)
  }

  /**
   * Lấy income categories
   */
  async getIncomeCategories(): Promise<Category[]> {
    return this.getCategoriesByType('income')
  }

  /**
   * Lấy expense categories
   */
  async getExpenseCategories(): Promise<Category[]> {
    return this.getCategoriesByType('expense')
  }

  /**
   * Lấy parent categories (không có parent_id)
   */
  async getParentCategories(): Promise<Category[]> {
    const { categories } = await this.getCategories()
    return categories.filter(c => !c.parent_id && c.is_active)
  }

  /**
   * Lấy subcategories của một parent
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    const { categories } = await this.getCategories()
    return categories.filter(c => c.parent_id === parentId && c.is_active)
  }

  /**
   * Build category tree structure
   */
  async getCategoryTree(): Promise<(Category & { children: Category[] })[]> {
    const { categories } = await this.getCategories()
    const activeCategories = categories.filter(c => c.is_active)
    
    // Get parent categories
    const parents = activeCategories.filter(c => !c.parent_id)
    
    // Map children to parents
    return parents.map(parent => ({
      ...parent,
      children: activeCategories.filter(c => c.parent_id === parent.id),
    }))
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService()
export default categoriesService

