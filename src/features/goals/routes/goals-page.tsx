"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchGoals, archiveGoal, deleteGoal } from "@/features/goals/goalsSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, Target, MoreVertical, Archive } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
// Note: GoalPrioritizationModal temporarily disabled due to AHPOutput type mismatch
// import { GoalPrioritizationModal } from "@/features/goals/components/goal-prioritization-modal"
import { CreateGoalModal } from "@/features/goals/components/create-goal-modal"
import { EditGoalModal } from "@/features/goals/components/edit-goal-modal"
// import { goalPrioritizationService } from "@/services/api/services/goal-prioritization.service"
import type { Goal } from "@/services/api/types/goals"

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const { goals, isLoading, error } = useAppSelector((state) => state.goals)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  // Action handlers
  const handleArchive = async (id: string, name: string) => {
    try {
      await dispatch(archiveGoal(id)).unwrap()
      toast({
        title: "Goal archived",
        description: `"${name}" has been archived successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return
    }

    try {
      await dispatch(deleteGoal(id)).unwrap()
      toast({
        title: "Goal deleted",
        description: `"${name}" has been deleted permanently.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Note: Goal prioritization temporarily disabled
  // const goalsForRating = goals.map(goal => goalPrioritizationService.convertGoalToRating(goal))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => dispatch(fetchGoals())}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
        <div className="flex gap-2">
          {/* Note: AI prioritization temporarily disabled
          {goals.length >= 2 && (
            <GoalPrioritizationModal
              goals={goalsForRating}
              userId="019bb5c5-9c50-72c0-9790-9560effa7331"
            />
          )}
          */}
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          // Use backend-calculated values instead of recalculating
          const progressPercentage = goal.progressPercentage ?? getProgressPercentage(goal.currentAmount, goal.targetAmount)
          const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : 0
          const isOverdue = daysRemaining < 0 && goal.status === 'active'

          return (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  {goal.name}
                </CardTitle>
                <div className="flex space-x-1">
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(goal.priority)}>
                    {goal.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                      </span>
                    </div>
                    <Progress value={progressPercentage} />
                    <div className="text-center text-xs text-muted-foreground">
                      {progressPercentage.toFixed(1)}% complete
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="capitalize">{goal.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Behavior</span>
                      <span className="capitalize">{goal.behavior || 'flexible'}</span>
                    </div>
                    {goal.targetDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target Date</span>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {goal.targetDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Days Remaining</span>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedGoal(goal)
                          setIsEditModalOpen(true)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(goal.id, goal.name)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(goal.id, goal.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                Set your first financial goal to start planning for the future.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateGoalModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditGoalModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        goal={selectedGoal}
      />
    </div>
  )
}

