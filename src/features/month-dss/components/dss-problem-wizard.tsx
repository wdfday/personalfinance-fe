"use client"

import { useState } from "react"
import { Problem0AutoScorePage } from "./problem0-autoscore-page"
import { Problem1GoalsPage } from "./problem1-goals-page"
import { Problem2DebtPage } from "./problem2-debt-page"
// Step 3 tradeoff removed - no longer used
// import { Problem3TradeoffPage } from "./problem3-tradeoff-page"
import { Problem4AllocationPage } from "./problem4-allocation-page"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

// Goal shape đến từ month-dss page (analytics) – khác với DTO ở các Problem*
interface WizardGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  priority: string
  status: string
}

interface Debt {
  id: string
  name: string
  current_balance: number
  interest_rate: number
  minimum_payment: number
}

interface DSSProblemWizardProps {
  readonly goals: WizardGoal[]
  readonly debts: Debt[]
  readonly monthStr: string
  readonly monthId: string
  readonly totalDebtBudget: number
  readonly monthlyIncome: number
  readonly constraints: any[]
  readonly onComplete: () => void
}

export function DSSProblemWizard({
  goals,
  debts,
  monthStr,
  monthId,
  totalDebtBudget,
  monthlyIncome,
  constraints,
  onComplete
}: DSSProblemWizardProps) {
  const hasGoals = (goals || []).some(g => g.status === 'active')
  const hasDebts = (debts || []).length > 0
  
  // Determine which problems are available
  // Start with 0 (Auto Score) if goals exist
  // Step 3 tradeoff removed - workflow is now: 0, 1, 2, 3 (Budget Allocation)
  const availableProblems = [
    hasGoals ? 0 : null,       // P0: Auto Score (only if has goals)
    hasGoals ? 1 : null,       // P1: Goals (only if has goals)
    hasDebts ? 2 : null,       // P2: Debts (only if has debts)
    3                           // P3: Budget Allocation (always show, Step 3 trong workflow mới)
  ].filter(p => p !== null) as number[]

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [completedProblems, setCompletedProblems] = useState<number[]>([])

  const currentProblem = availableProblems[currentProblemIndex]
  const totalProblems = availableProblems.length
  
  // Tính totalFixedCost từ constraints (chỉ tính các constraint được chọn và có minimum_amount)
  const totalFixedCost = (constraints || [])
    .filter((c: any) => c.minimum_amount && c.minimum_amount > 0)
    .reduce((sum: number, c: any) => sum + (Number(c.minimum_amount) || 0), 0)

  const goToNext = () => {
    const problem = availableProblems[currentProblemIndex]
    if (!completedProblems.includes(problem)) {
      setCompletedProblems([...completedProblems, problem])
    }
    setCurrentProblemIndex(prev => Math.min(prev + 1, totalProblems - 1))
  }

  const goToBack = () => {
    setCurrentProblemIndex(prev => Math.max(prev - 1, 0))
  }

  const handleComplete = () => {
    if (!completedProblems.includes(3)) {
      setCompletedProblems([...completedProblems, 3])
    }
    onComplete()
  }

  const renderProblem = () => {
    switch (currentProblem) {
      case 0:
        return (
          <Problem0AutoScorePage
            goals={goals}
            monthId={monthId}
            monthStr={monthStr}
            monthlyIncome={monthlyIncome}
            totalFixedCost={totalFixedCost}
            onNext={goToNext}
            onBack={goToBack}
          />
        )
      case 1:
        return (
          <Problem1GoalsPage
            goals={goals}
            monthId={monthId}
            monthStr={monthStr}
            onNext={goToNext}
            onBack={goToBack}
          />
        )
      case 2:
        return (
          <Problem2DebtPage
            debts={debts}
            monthStr={monthStr}
            monthId={monthId}
            totalDebtBudget={totalDebtBudget}
            monthlyIncome={monthlyIncome}
            totalFixedCost={totalFixedCost}
            onNext={goToNext}
            onBack={goToBack}
          />
        )
      case 3:
        // Step 3: Budget Allocation (tradeoff step removed)
        return (
          <Problem4AllocationPage 
            monthId={monthId} 
            monthStr={monthStr} 
            monthlyIncome={monthlyIncome}
            constraints={constraints}
            goals={goals}
            debts={debts}
            goalAllocationPct={50}
            debtAllocationPct={50}
            onBack={goToBack} 
            onComplete={handleComplete} 
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold">Planning</h2>
            <p className="text-muted-foreground">
              Step {currentProblemIndex + 1} of {totalProblems}
              {` (Method ${currentProblem})`}
            </p>
          </div>
          <div className="flex gap-2">
            {availableProblems.map((problemNum, idx) => (
              <div
                key={problemNum}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  completedProblems.includes(problemNum)
                    ? 'bg-primary text-primary-foreground'
                    : idx === currentProblemIndex
                    ? 'bg-primary/20 text-primary ring-2 ring-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {completedProblems.includes(problemNum) ? <CheckCircle2 className="h-5 w-5" /> : problemNum}
              </div>
            ))}
          </div>
        </div>
        <Progress value={(completedProblems.length / totalProblems) * 100} className="h-1" />
      </div>

      {/* Current Problem - full width */}
      <div className="w-full">
        {renderProblem()}
      </div>
    </div>
  )
}
