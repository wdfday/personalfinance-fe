"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { previewDebtStrategy, applyDebtStrategy } from "../dssWorkflowSlice"
import { AlertCircle, CheckCircle2, TrendingDown, Calendar, DollarSign } from "lucide-react"

interface Debt {
  id: string
  name: string
  current_balance: number
  interest_rate: number
  minimum_payment: number
}

interface DebtStrategyStepProps {
  debts: Debt[]
  monthStr: string
  monthId: string
  totalDebtBudget: number
  onNext: () => void
  onBack: () => void
}

export function DebtStrategyStep({
  debts,
  monthStr,
  monthId,
  totalDebtBudget,
  onNext,
  onBack
}: DebtStrategyStepProps) {
  const dispatch = useAppDispatch()
  const { debtStrategy } = useAppSelector(state => state.dssWorkflow)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const handlePreview = async () => {
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

  const handleApply = async () => {
    if (!selectedStrategy) return

    const result = await dispatch(applyDebtStrategy({
      monthStr,
      data: {
        month_id: monthId,
        selected_strategy: selectedStrategy,
      }
    }))

    if (result.meta.requestStatus === 'fulfilled') {
      onNext()
    }
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.current_balance, 0)
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Step 2: Debt Repayment Strategy</h2>
        <p className="text-muted-foreground mt-2">
          Choose the best strategy to pay off your debts
        </p>
      </div>

      {/* Debt Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Debt</p>
              <p className="text-2xl font-bold">${totalDebt.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Min. Payment</p>
              <p className="text-2xl font-bold">${totalMinPayment.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Budget</p>
              <p className="text-2xl font-bold text-primary">${totalDebtBudget.toLocaleString()}</p>
            </div>
          </div>

          {totalDebtBudget < totalMinPayment && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your debt budget (${totalDebtBudget}) is less than minimum payments (${totalMinPayment}).
                Please increase your budget.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Debts List */}
      <div className="grid gap-3">
        {debts.map((debt) => (
          <Card key={debt.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold">{debt.name}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Balance: ${debt.current_balance.toLocaleString()}</span>
                    <span>APR: {(debt.interest_rate * 100).toFixed(2)}%</span>
                    <span>Min: ${debt.minimum_payment.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Button */}
      {!debtStrategy.preview && (
        <Button
          onClick={handlePreview}
          disabled={debtStrategy.loading || debts.length === 0}
          size="lg"
          className="w-full"
        >
          {debtStrategy.loading ? "Analyzing..." : "Preview Strategies"}
        </Button>
      )}

      {/* Loading State */}
      {debtStrategy.loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Error State */}
      {debtStrategy.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{debtStrategy.error}</AlertDescription>
        </Alert>
      )}

      {/* Strategy Results */}
      {debtStrategy.preview && !debtStrategy.loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Strategy Comparison</h3>
            <Badge variant="outline">
              Recommended: {debtStrategy.preview.recommended_strategy}
            </Badge>
          </div>

          <div className="grid gap-4">
            {debtStrategy.preview.scenarios.map((scenario) => {
              const isRecommended = scenario.strategy === debtStrategy.preview?.recommended_strategy
              const isSelected = selectedStrategy === scenario.strategy

              return (
                <Card
                  key={scenario.strategy}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${isRecommended ? 'border-primary' : ''}`}
                  onClick={() => setSelectedStrategy(scenario.strategy)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {scenario.strategy.charAt(0).toUpperCase() + scenario.strategy.slice(1)}
                          {isRecommended && (
                            <Badge variant="default">Recommended</Badge>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {scenario.strategy === 'avalanche' && 'Pay highest interest rate first'}
                          {scenario.strategy === 'snowball' && 'Pay smallest balance first'}
                          {scenario.strategy === 'hybrid' && 'Balanced approach'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>Total Interest</span>
                        </div>
                        <p className="text-lg font-bold">
                          ${scenario.total_interest.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Time to Payoff</span>
                        </div>
                        <p className="text-lg font-bold">
                          {scenario.months_to_debt_free} months
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingDown className="h-3 w-3" />
                          <span>Monthly Payment</span>
                        </div>
                        <p className="text-lg font-bold">
                          ${scenario.monthly_payment.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Apply Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              size="lg"
            >
              ← Back
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedStrategy || debtStrategy.loading}
              size="lg"
              className="flex-1"
            >
              {debtStrategy.loading ? "Applying..." : `Apply ${selectedStrategy || 'Strategy'} →`}
            </Button>
          </div>
        </div>
      )}

      {/* Applied Success */}
      {debtStrategy.applied && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Strategy applied successfully! Proceeding to next step...
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
