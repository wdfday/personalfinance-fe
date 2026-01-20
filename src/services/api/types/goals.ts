// Goal Types - matches server/internal/module/cashflow/goal/dto

export interface Goal {
  id: string
  userId: string
  accountId?: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  currency: string
  startDate: string
  targetDate?: string
  behavior: GoalBehavior
  category: GoalCategory
  priority: GoalPriority
  status: GoalStatus
  notes?: string
  monthlyContribution?: number
  progressPercentage?: number
  remainingAmount?: number
  onTrack?: boolean
  createdAt: string
  updatedAt: string
}

export type GoalBehavior = 'aggressive' | 'flexible' | 'willing' | 'recurring'
export type GoalCategory = 'emergency' | 'savings' | 'investment' | 'purchase' | 'retirement' | 'education' | 'travel' | 'other'
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface CreateGoalRequest {
  accountId?: string
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  currency?: string
  startDate?: string
  targetDate?: string
  behavior?: GoalBehavior
  category?: GoalCategory
  priority?: GoalPriority
  notes?: string
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  status?: GoalStatus
}
