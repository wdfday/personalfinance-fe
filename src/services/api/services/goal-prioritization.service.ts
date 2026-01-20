// Goal Prioritization Service
import { apiClient } from '../client'
import type { DirectRatingInput, AHPOutput, GoalForRating } from '../types/goal-prioritization'
import type { Goal } from '../types/goals'

export const goalPrioritizationService = {
  convertGoalToRating(goal: Goal): GoalForRating {
    return {
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date || '',
      type: goal.category,
      priority: goal.priority,
    }
  },
  async prioritizeGoals(data: DirectRatingInput): Promise<AHPOutput> {
    return apiClient.post<AHPOutput>('/analytics/goal-prioritization/prioritize', data)
  },

  async autoScore(goals: any[]): Promise<any> {
    return apiClient.post('/analytics/goal-prioritization/auto-score', { goals })
  }
}

export default goalPrioritizationService
