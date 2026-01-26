"use client"

import { useEffect, useState } from "react"
import { Goal } from "@/services/api/types/goals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Target, Calendar, TrendingUp, Plus, RotateCcw } from "lucide-react"
import { goalsService } from "@/services/api/services/goals.service"
import { GoalContributionChart } from "./goal-contribution-chart"
import { CreateContributionModal } from "./create-contribution-modal"
import { ContributeOutModal } from "./contribute-out-modal"
import { toast } from "sonner"

interface GoalContribution {
  id: string
  goalId: string
  accountId: string
  userId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  currency: string
  note?: string
  source: string
  reversingContributionId?: string
  createdAt: string
}

interface GoalDetailProps {
  goal: Goal
  onClose: () => void
  onEdit?: (goal: Goal) => void
}

export function GoalDetail({ goal, onClose, onEdit }: GoalDetailProps) {
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isContributeOutModalOpen, setIsContributeOutModalOpen] = useState(false)

  const fetchContributions = async () => {
    setLoading(true)
    try {
      const response = await goalsService.getContributions(goal.id)
      // Sort by date (newest first)
      const sorted = response.contributions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
      setContributions(sorted)
    } catch (error) {
      console.error("Failed to fetch contributions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (goal.id) {
      fetchContributions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.id])

  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  const remaining = goal.targetAmount - goal.currentAmount
  const totalContributions = contributions
    .filter(c => c.type === 'deposit')
    .reduce((sum, c) => sum + c.amount, 0)

  const handleReverseContribution = async (contribution: GoalContribution) => {
    if (contribution.type !== 'deposit') {
      toast.error("Chỉ có thể hoàn tác contribution loại deposit")
      return
    }

    if (!confirm(`Bạn có chắc muốn tạo withdrawal để hoàn tác contribution này?`)) {
      return
    }

    try {
      // Create withdrawal (reverse) contribution
      await goalsService.withdraw(goal.id, contribution.amount, `Hoàn tác: ${contribution.note || "Contribution"}`, contribution.id)
      toast.success("Đã tạo withdrawal hoàn tác thành công!")
      fetchContributions()
    } catch (error) {
      toast.error("Lỗi tạo withdrawal hoàn tác: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5" />
              {goal.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={goal.status === "active" ? "default" : "secondary"}>
                {goal.status.toUpperCase()}
              </Badge>
              {goal.targetDate && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(goal.targetDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm tiền
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsContributeOutModalOpen(true)}>
            <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
            Rút tiền
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Progress</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold">{formatCurrency(remaining, goal.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contributions</span>
                    <span className="font-semibold">{contributions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{formatCurrency(totalContributions, goal.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{goal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{goal.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Behavior</span>
                <span className="font-medium capitalize">{goal.behavior || "flexible"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{goal.currency}</span>
              </div>
              {goal.description && (
                <div className="pt-2 border-t">
                  <div className="text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{goal.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chart & List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <GoalContributionChart goalId={goal.id} currency={goal.currency} />

          {/* Contributions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Contributions ({contributions.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsContributeOutModalOpen(true)}>
                    <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                    Rút
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : contributions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No contributions found for this goal.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {contributions.map((contribution) => {
                    const isDeposit = contribution.type === 'deposit'
                    return (
                      <div key={contribution.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                              isDeposit
                                ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {isDeposit ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingUp className="h-5 w-5 rotate-180" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {contribution.note || (isDeposit ? "Deposit" : "Withdrawal")}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span title={`Tạo lúc: ${new Date(contribution.createdAt).toLocaleString('vi-VN')}`}>
                                {new Date(contribution.createdAt).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {contribution.source && (
                                <Badge variant="outline" className="text-xs">
                  {contribution.source}
                </Badge>
              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`font-semibold text-base shrink-0 ${
                              isDeposit ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isDeposit ? "+" : "-"}
                            {formatCurrency(contribution.amount, contribution.currency)}
                          </div>
                          {isDeposit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleReverseContribution(contribution)}
                              title="Tạo withdrawal hoàn tác"
                            >
                              <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Contribution Modal */}
      <CreateContributionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        goal={goal}
        onSuccess={fetchContributions}
      />

      {/* Contribute Out Modal */}
      <ContributeOutModal
        isOpen={isContributeOutModalOpen}
        onClose={() => setIsContributeOutModalOpen(false)}
        goal={goal}
        onSuccess={fetchContributions}
      />
    </div>
  )
}
