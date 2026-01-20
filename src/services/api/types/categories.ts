// Category Types - matches server/internal/module/cashflow/category/dto

export interface Category {
  id: string
  user_id?: string
  name: string
  description?: string
  type: CategoryType
  parent_id?: string
  level: number
  icon?: string
  color?: string
  is_default: boolean
  is_active: boolean
  monthly_budget?: number
  transaction_count?: number
  total_amount?: number
  display_order: number
  created_at: string
  updated_at: string
  deleted_at?: string
  parent?: Category
  children?: Category[]
}

export type CategoryType = 'income' | 'expense' | 'transfer'

export interface CreateCategoryRequest {
  name: string
  description?: string
  type: CategoryType
  parent_id?: string
  icon?: string
  color?: string
  monthly_budget?: number
  display_order?: number
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  is_active?: boolean
}

export interface CategoryListResponse {
  categories: Category[]
  count: number
}
