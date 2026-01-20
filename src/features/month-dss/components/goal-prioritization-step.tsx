"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowUpRight, ArrowDownRight, Target, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { cashflowForecastService, type ForecastResult } from "@/services/api/services/cashflow-forecast.service"

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

interface GoalPrioritizationStepProps {
  goals: Goal[]
  monthlyIncome: number
  monthlyExpenses: number
  currentCash: number
  onNext: () => void
}

export function GoalPrioritizationStep({ 
  goals, 
  monthlyIncome,
  monthlyExpenses,
  currentCash,
  onNext 
}: GoalPrioritizationStepProps) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [loadingForecast, setLoadingForecast] = useState(false)
  
  const activeGoals = goals.filter(g => g.status === 'active')

  // Load cashflow forecast
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
      } catch (error) {
        console.error('Failed to load forecast:', error)
      } finally {
        setLoadingForecast(false)
      }
    }

    loadForecast()
  }, [monthlyIncome, monthlyExpenses, currentCash])

  const getMonthsToGoal = (goal: Goal) => {
    if (!goal.target_date) return null
    const target = new Date(goal.target_date)
    const now = new Date()
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
    return Math.max(0, months)
  }

  const getRequiredMonthly = (goal: Goal) => {
    const remaining = goal.target_amount - goal.current_amount
    const months = getMonthsToGoal(goal)
    if (!months || months === 0) return remaining
    return remaining / months
  }

  const getRiskLevel = (forecast: ForecastResult) => {
    if (forecast.risk_level === 'low') return { color: 'text-green-600', bg: 'bg-green-50', label: 'Low Risk' }
    if (forecast.risk_level === 'medium') return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium Risk' }
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'High Risk' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Step 1: Financial Overview & Goals</h2>
        <p className="text-muted-foreground mt-2">
          Review your cashflow forecast and active goals before proceeding
        </p>
      </div>

      {/* Cashflow Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Cashflow Forecast (6 Months)</CardTitle>
                <CardDescription>AI-powered financial stability analysis</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getRiskLevel(forecast).color}`}>
                  {getRiskLevel(forecast).label}
                </div>
                <div className="text-2xl font-bold mt-1">{forecast.stability_score.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Stability</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-medium">
                {forecast.profile_type}
              </Badge>
            </div>

            {/* Monthly Forecast Graph */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Expected Cash Position</p>
              <div className="grid grid-cols-6 gap-2">
                {forecast.monthly_forecast.map((month) => (
                  <div key={month.month} className="space-y-1">
                    <div className="text-xs text-center text-muted-foreground">M{month.month}</div>
                    <div className="h-24 bg-muted rounded relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full transition-all ${
                          month.expected_cash > 0 ? 'bg-primary' : 'bg-destructive'
                        }`}
                        style={{ 
                          height: `${Math.min(100, Math.abs(month.expected_cash) / currentCash * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-center font-medium">
                      ${(month.expected_cash / 1000).toFixed(1)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {forecast.recommendations && forecast.recommendations.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {forecast.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goals Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Goals ({activeGoals.length})</CardTitle>
          <CardDescription>Your current financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active goals found. Create goals to get personalized recommendations.
            </p>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100
                const monthsRemaining = getMonthsToGoal(goal)
                const requiredMonthly = getRequiredMonthly(goal)
                const isOnTrack = goal.monthly_contribution ? goal.monthly_contribution >= requiredMonthly : false

                return (
                  <Card key={goal.id} className="overflow-hidden">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{goal.name}</h3>
                            <Badge variant={
                              goal.priority === 'high' ? 'destructive' :
                              goal.priority === 'medium' ? 'default' : 'secondary'
                            } className="text-xs">
                              {goal.priority}
                            </Badge>
                            {goal.category && (
                              <Badge variant="outline" className="text-xs">
                                {goal.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}</span>
                            </div>
                            {goal.target_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
                          {isOnTrack !== null && (
                            <div className={`text-xs ${isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
                              {isOnTrack ? 'On Track' : 'Behind'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <Progress value={Math.min(progress, 100)} className="h-2 mb-3" />

                      {/* Details */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold">
                            ${(goal.target_amount - goal.current_amount).toLocaleString()}
                          </p>
                        </div>
                        {monthsRemaining !== null && (
                          <>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Time Left</p>
                              <p className="font-semibold">{monthsRemaining} months</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Required/month</p>
                              <p className="font-semibold text-primary">
                                ${requiredMonthly.toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Current Contribution */}
                      {goal.monthly_contribution && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Contribution</span>
                            <span className="font-semibold">${goal.monthly_contribution.toLocaleString()}/month</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Continue to Debt Strategy →
        </Button>
      </div>
    </div>
  )
}
