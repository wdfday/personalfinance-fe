/**
 * Goals Service
 * Quản lý mục tiêu tài chính
 */

import { baseApiClient } from './base'

// Types
export interface Goal {
  id: string
  user_id: number
  name: string
  description: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string
  status: 'active' | 'completed' | 'cancelled' | 'paused'
  priority: 'low' | 'medium' | 'high'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateGoalRequest {
  name: string
  description: string
  target_amount: number
  currency: string
  target_date: string
  priority: 'low' | 'medium' | 'high'
  category: string
}

export interface UpdateGoalRequest {
  name?: string
  description?: string
  target_amount?: number
  current_amount?: number
  currency?: string
  target_date?: string
  status?: 'active' | 'completed' | 'cancelled' | 'paused'
  priority?: 'low' | 'medium' | 'high'
  category?: string
  is_active?: boolean
}

export interface GoalListResponse {
  goals: Goal[]
  total: number
}

class GoalsService {
  /**
   * Lấy danh sách tất cả goals
   */
  async getGoals(): Promise<GoalListResponse> {
    const goals = await baseApiClient.get<Goal[]>('/goals')
    return {
      goals: Array.isArray(goals) ? goals : [],
      total: Array.isArray(goals) ? goals.length : 0,
    }
  }

  /**
   * Lấy thông tin một goal
   */
  async getGoal(id: string): Promise<Goal> {
    return baseApiClient.get<Goal>(`/goals/${id}`)
  }

  /**
   * Tạo goal mới
   */
  async createGoal(data: CreateGoalRequest): Promise<Goal> {
    return baseApiClient.post<Goal>('/goals', data)
  }

  /**
   * Cập nhật goal
   */
  async updateGoal(id: string, data: UpdateGoalRequest): Promise<Goal> {
    return baseApiClient.put<Goal>(`/goals/${id}`, data)
  }

  /**
   * Xóa goal
   */
  async deleteGoal(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/goals/${id}`)
  }

  /**
   * Lấy active goals
   */
  async getActiveGoals(): Promise<Goal[]> {
    const { goals } = await this.getGoals()
    return goals.filter(g => g.is_active && g.status === 'active')
  }

  /**
   * Lấy goals theo priority
   */
  async getGoalsByPriority(priority: 'low' | 'medium' | 'high'): Promise<Goal[]> {
    const { goals } = await this.getGoals()
    return goals.filter(g => g.priority === priority)
  }

  /**
   * Tính progress percentage
   */
  getGoalProgress(goal: Goal): number {
    if (goal.target_amount === 0) return 0
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  /**
   * Kiểm tra xem goal đã hoàn thành chưa
   */
  isGoalCompleted(goal: Goal): boolean {
    return goal.current_amount >= goal.target_amount
  }

  /**
   * Tính số tiền còn thiếu
   */
  getRemainingAmount(goal: Goal): number {
    return Math.max(goal.target_amount - goal.current_amount, 0)
  }

  /**
   * Tính số ngày còn lại
   */
  getDaysRemaining(goal: Goal): number {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const diffTime = targetDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

// Export singleton instance
export const goalsService = new GoalsService()
export default goalsService

