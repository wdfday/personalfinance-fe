// Goal Service
import { apiClient } from '../client'
import type { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types/goals'

export const goalsService = {
  async getAll(): Promise<{ items: Goal[]; total: number }> {
    return apiClient.get('/goals')
  },

  async getById(id: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${id}`)
  },

  async create(data: CreateGoalRequest): Promise<Goal> {
    return apiClient.post<Goal>('/goals', data)
  },

  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    return apiClient.put<Goal>(`/goals/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/goals/${id}`)
  },

  async contribute(id: string, amount: number): Promise<Goal> {
    return apiClient.post<Goal>(`/goals/${id}/contribute`, { amount })
  },

  async archive(id: string): Promise<Goal> {
    return apiClient.post<Goal>(`/goals/${id}/archive`, {})
  },

  async unarchive(id: string): Promise<Goal> {
    return apiClient.post<Goal>(`/goals/${id}/unarchive`, {})
  },
}

export default goalsService
