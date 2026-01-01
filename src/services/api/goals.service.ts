/**
 * Goals Service
 * Quản lý mục tiêu tài chính
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalSummary,
  GoalProgress,
  GoalFilters,
  ContributeToGoalRequest,
} from '@/types/api'

export interface GoalListResponse {
  items: Goal[]
  total: number
}

// Re-export types for backward compatibility
export type { Goal, CreateGoalRequest, UpdateGoalRequest, GoalSummary, GoalProgress }

class GoalsService {
  /**
   * Lấy danh sách goals với filters
   */
  async getGoals(filters?: GoalFilters): Promise<GoalListResponse> {
    const data = await baseApiClient.get<Goal[]>('/goals', filters)
    // Handle case where data might be wrapped or just an array
    const goals = Array.isArray(data) ? data : (data as any)?.items || []
    return {
      items: goals,
      total: goals.length
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
   * Xóa goal (soft delete)
   */
  async deleteGoal(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/goals/${id}`)
  }

  /**
   * Đóng góp vào goal
   */
  async contributeToGoal(id: string, data: ContributeToGoalRequest): Promise<Goal> {
    return baseApiClient.post<Goal>(`/goals/${id}/contribute`, data)
  }

  /**
   * Lấy goal progress
   */
  async getGoalProgress(id: string): Promise<GoalProgress> {
    return baseApiClient.get<GoalProgress>(`/goals/${id}/progress`)
  }

  /**
   * Lấy goal summary
   */
  async getGoalSummary(): Promise<GoalSummary> {
    return baseApiClient.get<GoalSummary>('/goals/summary')
  }

  /**
   * Đánh dấu goal hoàn thành
   */
  async completeGoal(id: string): Promise<Goal> {
    return baseApiClient.post<Goal>(`/goals/${id}/complete`)
  }

  /**
   * Tạm dừng goal
   */
  async pauseGoal(id: string): Promise<Goal> {
    return baseApiClient.post<Goal>(`/goals/${id}/pause`)
  }

  /**
   * Tiếp tục goal
   */
  async resumeGoal(id: string): Promise<Goal> {
    return baseApiClient.post<Goal>(`/goals/${id}/resume`)
  }
}

// Export singleton instance
export const goalsService = new GoalsService()
export default goalsService
