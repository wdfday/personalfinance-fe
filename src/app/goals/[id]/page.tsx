"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchGoals } from "@/features/goals/goalsSlice"
import { GoalDetail } from "@/features/goals/components/goal-detail"
import { EditGoalModal } from "@/features/goals/components/edit-goal-modal"
import type { Goal } from "@/services/api/types/goals"

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { goals } = useAppSelector((state) => state.goals)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const goalId = params.id as string

  useEffect(() => {
    if (goals.length === 0) {
      dispatch(fetchGoals())
    }
  }, [dispatch, goals.length])

  useEffect(() => {
    if (goalId && goals.length > 0) {
      const foundGoal = goals.find((g) => g.id === goalId)
      if (foundGoal) {
        setGoal(foundGoal)
      } else {
        // Goal not found, redirect back
        router.push("/goals")
      }
    }
  }, [goalId, goals, router])

  const handleBack = () => {
    router.push("/goals")
  }

  const handleEdit = (goalToEdit: Goal) => {
    setSelectedGoal(goalToEdit)
    setIsEditModalOpen(true)
  }

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading goal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GoalDetail
        goal={goal}
        onClose={handleBack}
        onEdit={handleEdit}
      />
      <EditGoalModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        goal={selectedGoal}
      />
    </div>
  )
}
