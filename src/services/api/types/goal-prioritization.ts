// Goal Prioritization Types
export interface GoalForRating {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  type: string
  priority: string
}

export interface DirectRatingInput {
  user_id: string
  monthly_income: number
  criteria_ratings: Record<string, number>
  goals: GoalForRating[]
}

export interface AHPOutput {
  scores: Record<string, number>
  rankings: string[]
  consistency_ratio: number
  is_consistent: boolean
}
