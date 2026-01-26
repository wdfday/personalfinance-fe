"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export function ProjectedOutcomesCard() {
  const { goals } = useAppSelector((s) => s.goals)
  const { debts } = useAppSelector((s) => s.debts)

  const projectedOutcomes = useMemo(() => {
    // Calculate monthly savings from active goals
    const monthlySavings = goals
      .filter((g) => g.status === "active")
      .reduce((s, g) => {
        const remaining = (g.targetAmount || 0) - (g.currentAmount || 0)
        if (remaining <= 0 || !g.targetDate) return s
        const deadline = new Date(g.targetDate)
        const now = new Date()
        const monthsLeft = Math.max(
          1,
          Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        )
        return s + remaining / monthsLeft
      }, 0)

    // Calculate monthly debt reduction (payment - interest)
    const totalDebtPayment = debts
      .filter((d) => d.status === "active")
      .reduce((s, d) => s + (d.minimum_payment || 0), 0)

    const avgInterest = debts
      .filter((d) => d.status === "active")
      .reduce(
        (s, d) => s + ((d.current_balance || 0) * (d.interest_rate || 0)) / 100 / 12,
        0
      )

    const monthlyDebtReduction = totalDebtPayment - avgInterest

    // Find emergency fund goal
    const emergencyGoal = goals.find(
      (g) =>
        g.status === "active" &&
        (g.name?.toLowerCase().includes("emergency") ||
          g.name?.toLowerCase().includes("khẩn cấp"))
    )

    let monthsToEmergencyFund: number | null = null
    if (emergencyGoal && monthlySavings > 0) {
      const remaining = (emergencyGoal.targetAmount || 0) - (emergencyGoal.currentAmount || 0)
      if (remaining > 0) {
        monthsToEmergencyFund = Math.ceil(remaining / monthlySavings)
      }
    }

    return {
      monthlySavings,
      monthlyDebtReduction,
      monthsToEmergencyFund,
    }
  }, [goals, debts])

  // Don't show if no data
  if (projectedOutcomes.monthlySavings === 0 && projectedOutcomes.monthlyDebtReduction === 0) {
    return null
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-400">Projected Outcomes</CardTitle>
        <CardDescription>Nếu bạn tuân theo kế hoạch hiện tại...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 text-center">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(projectedOutcomes.monthlySavings)}
            </p>
            <p className="text-sm text-muted-foreground">Tiết kiệm hàng tháng</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(projectedOutcomes.monthlyDebtReduction)}
            </p>
            <p className="text-sm text-muted-foreground">Giảm nợ hàng tháng</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            {projectedOutcomes.monthsToEmergencyFund != null ? (
              <>
                <p className="text-2xl font-bold text-purple-600">
                  {projectedOutcomes.monthsToEmergencyFund} tháng
                </p>
                <p className="text-sm text-muted-foreground">Đến Emergency Fund</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-sm text-muted-foreground">Không có mục tiêu quỹ khẩn cấp</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
