"use client"

import { useState } from "react"
import { Problem0AutoScorePage } from "./problem0-autoscore-page"
import { Problem1GoalsPage } from "./problem1-goals-page"
import { Problem2DebtPage } from "./problem2-debt-page"
import { Problem3TradeoffPage } from "./problem3-tradeoff-page"
import { Problem4AllocationPage } from "./problem4-allocation-page"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
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
  readonly goals: Goal[]
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
  const availableProblems = [
    hasGoals ? 0 : null,       // P0: Auto Score (only if has goals)
    hasGoals ? 1 : null,       // P1: Goals (only if has goals)
    hasDebts ? 2 : null,       // P2: Debts (only if has debts)
    (hasGoals && hasDebts) ? 3 : null,  // P3: Tradeoff (only if has both)
    4                           // P4: Always show
  ].filter(p => p !== null) as number[]

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [completedProblems, setCompletedProblems] = useState<number[]>([])

  const currentProblem = availableProblems[currentProblemIndex]
  const totalProblems = availableProblems.length

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
    if (!completedProblems.includes(4)) {
      setCompletedProblems([...completedProblems, 4])
    }
    onComplete()
  }

  const renderProblem = () => {
    switch (currentProblem) {
      case 0:
        return <Problem0AutoScorePage goals={goals} monthId={monthId} monthStr={monthStr} monthlyIncome={monthlyIncome} onNext={goToNext} />
      case 1:
        return <Problem1GoalsPage goals={goals} monthId={monthId} monthStr={monthStr} onNext={goToNext} />
      case 2:
        return (
          <Problem2DebtPage
            debts={debts}
            monthStr={monthStr}
            monthId={monthId}
            totalDebtBudget={totalDebtBudget}
            onNext={goToNext}
            onBack={goToBack}
          />
        )
      case 3:
        return <Problem3TradeoffPage monthId={monthId} monthStr={monthStr} onNext={goToNext} onBack={goToBack} />
      case 4:
        return (
          <Problem4AllocationPage 
            monthId={monthId} 
            monthStr={monthStr} 
            monthlyIncome={monthlyIncome}
            constraints={constraints}
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
            <h2 className="text-2xl font-bold">DSS Workflow</h2>
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

      {/* Current Problem */}
      <div className="container mx-auto max-w-4xl">
        {renderProblem()}
      </div>
    </div>
  )
}
