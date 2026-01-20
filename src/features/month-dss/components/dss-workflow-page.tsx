"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowUpRight, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  TrendingDown,
  Target,
  ChevronRight
} from "lucide-react"
import { cashflowForecastService, type ForecastResult } from "@/services/api/services/cashflow-forecast.service"
import { previewDebtStrategy, applyDebtStrategy } from "../dssWorkflowSlice"

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
  priority: string
  status: string
  monthly_contribution?: number
  category?: string
}

interface Debt {
  id: string
  name: string
  current_balance: number
  interest_rate: number
  minimum_payment: number
}

interface DSSWorkflowPageProps {
  goals: Goal[]
  debts: Debt[]
  monthStr: string
  monthId: string
  monthlyIncome: number
  monthlyExpenses: number
  currentCash: number
  totalDebtBudget: number
}

export function DSSWorkflowPage({
  goals,
  debts,
  monthStr,
  monthId,
  monthlyIncome,
  monthlyExpenses,
  currentCash,
  totalDebtBudget
}: DSSWorkflowPageProps) {
  const dispatch = useAppDispatch()
  const { debtStrategy } = useAppSelector(state => state.dssWorkflow)
  
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [completedProblems, setCompletedProblems] = useState<number[]>([])

  const activeGoals = goals.filter(g => g.status === 'active')

  // Load cashflow forecast - DISABLED (API not ready)
  // TODO: Enable when backend route is registered
  /*
  useEffect(() => {
    const loadForecast = async () => {
      if (monthlyIncome <= 0) return
      
      setLoadingForecast(true)
      try {
        const response = await cashflowForecastService.calculateForecast({
          user_id: 'current',
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
          current_cash: currentCash,
          months_ahead: 6,
        })
        setForecast(response)
      } catch (error: any) {
        // Silently fail if cashflow API not available (404)
        // This is expected if backend routes not registered yet
        if (error.message?.includes('404')) {
          console.log('Cashflow forecast API not available, skipping...')
        } else {
          console.error('Failed to load forecast:', error)
        }
      } finally {
        setLoadingForecast(false)
      }
    }

    loadForecast()
  }, [monthlyIncome, monthlyExpenses, currentCash])
  */

  const handlePreviewDebt = async () => {
    if (!debts || debts.length === 0) {
      console.warn('No debts to preview')
      return
    }
    
    await dispatch(previewDebtStrategy({
      monthStr,
      data: {
        month_id: monthId,
        debts: debts.map(d => ({
          debt_id: d.id,
          name: d.name,
          current_balance: d.current_balance,
          interest_rate: d.interest_rate,
          minimum_payment: d.minimum_payment,
        })),
        total_debt_budget: totalDebtBudget,
      }
    }))
  }

  const handleApplyDebt = async () => {
    if (!selectedStrategy) return
    
    const result = await dispatch(applyDebtStrategy({
      monthStr,
      data: {
        month_id: monthId,
        selected_strategy: selectedStrategy,
      }
    }))

    if (result.meta.requestStatus === 'fulfilled') {
      setCompletedProblems([...completedProblems, 2])
    }
  }

  const markProblemComplete = (problemNum: number) => {
    if (!completedProblems.includes(problemNum)) {
      setCompletedProblems([...completedProblems, problemNum])
    }
  }

  const getProgress = (goal: Goal) => {
    const current = goal.current_amount || 0
    const target = goal.target_amount || 1 // Avoid division by zero
    return (current / target) * 100
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">DSS Workflow</h1>
            <p className="text-muted-foreground">Complete 4 steps to optimize your budget</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  completedProblems.includes(num)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {completedProblems.includes(num) ? <CheckCircle2 className="h-5 w-5" /> : num}
              </div>
            ))}
          </div>
        </div>
        <Progress value={(completedProblems.length / 4) * 100} className="mt-3 h-1" />
      </div>

      {/* Problem 1: Cashflow & Goals Overview */}
      <section id="problem-1" className="scroll-mt-20">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Problem 1</Badge>
                  {completedProblems.includes(1) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">Financial Overview & Goals</CardTitle>
                <CardDescription>Review your cashflow forecast and active goals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cashflow Forecast */}
            {forecast && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">6-Month Cashflow Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stability Score</p>
                      <p className="text-2xl font-bold">{forecast.stability_score.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <Badge variant={
                        forecast.risk_level === 'low' ? 'default' :
                        forecast.risk_level === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {forecast.risk_level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profile</p>
                      <p className="font-semibold">{forecast.profile_type}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {forecast.monthly_forecast.map((month) => (
                      <div key={month.month} className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">M{month.month}</div>
                        <div className="h-20 bg-muted rounded relative overflow-hidden">
                          <div
                            className={`absolute bottom-0 w-full ${
                              month.expected_cash > 0 ? 'bg-primary' : 'bg-destructive'
                            }`}
                            style={{ height: `${Math.min(100, Math.abs(month.expected_cash) / currentCash * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-center font-medium">
                          ${(month.expected_cash / 1000).toFixed(1)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals Grid */}
            <div>
              <h3 className="font-semibold mb-3">Active Goals ({activeGoals.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${(goal.current_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={goal.priority === 'high' ? 'destructive' : 'default'}>
                          {goal.priority || 'medium'}
                        </Badge>
                      </div>
                      <Progress value={getProgress(goal)} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => markProblemComplete(1)}
              disabled={completedProblems.includes(1)}
              className="w-full"
            >
              {completedProblems.includes(1) ? 'Completed ✓' : 'Mark as Reviewed'}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Problem 2: Debt Strategy */}
      <section id="problem-2" className="scroll-mt-20">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Problem 2</Badge>
                  {completedProblems.includes(2) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">Debt Repayment Strategy</CardTitle>
                <CardDescription>Choose the optimal strategy to pay off debts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Debt Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold">
                  ${(debts || []).reduce((sum, d) => sum + (d.current_balance || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min. Payment</p>
                <p className="text-2xl font-bold">
                  ${(debts || []).reduce((sum, d) => sum + (d.minimum_payment || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Budget</p>
                <p className="text-2xl font-bold text-primary">${totalDebtBudget.toLocaleString()}</p>
              </div>
            </div>

            {/* Preview Button */}
            {!debtStrategy.preview && (
              <Button onClick={handlePreviewDebt} disabled={debtStrategy.loading} className="w-full" size="lg">
                {debtStrategy.loading ? "Analyzing..." : "Preview Strategies"}
              </Button>
            )}

            {/* Strategy Cards */}
            {debtStrategy.preview && !debtStrategy.loading && (
              <div className="space-y-3">
                {debtStrategy.preview.scenarios.map((scenario) => {
                  const isSelected = selectedStrategy === scenario.strategy
                  const isRecommended = scenario.strategy === debtStrategy.preview?.recommended_strategy

                  return (
                    <Card
                      key={scenario.strategy}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedStrategy(scenario.strategy)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {scenario.strategy.charAt(0).toUpperCase() + scenario.strategy.slice(1)}
                              {isRecommended && <Badge>Recommended</Badge>}
                              {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Interest</p>
                            <p className="font-bold">${scenario.total_interest.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payoff Time</p>
                            <p className="font-bold">{scenario.months_to_debt_free} months</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="font-bold">${scenario.monthly_payment.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                <Button
                  onClick={handleApplyDebt}
                  disabled={!selectedStrategy || debtStrategy.loading}
                  className="w-full"
                  size="lg"
                >
                  {debtStrategy.loading ? "Applying..." : `Apply ${selectedStrategy || 'Strategy'}`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Problem 3: Goal-Debt Tradeoff */}
      <section id="problem-3" className="scroll-mt-20">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Problem 3</Badge>
                  {completedProblems.includes(3) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">Goal-Debt Tradeoff</CardTitle>
                <CardDescription>Balance between saving for goals and paying off debt</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Component coming soon...
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Problem 4: Budget Allocation */}
      <section id="problem-4" className="scroll-mt-20">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Problem 4</Badge>
                  {completedProblems.includes(4) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">Budget Allocation</CardTitle>
                <CardDescription>Optimize spending across all categories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Component coming soon...
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
