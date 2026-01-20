"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, ArrowRight, TrendingDown } from "lucide-react"
import { previewDebtStrategy, applyDebtStrategy } from "../dssWorkflowSlice"

interface Debt {
  id: string
  name: string
  current_balance: number
  interest_rate: number
  minimum_payment: number
}

interface Problem2Props {
  debts: Debt[]
  monthStr: string
  monthId: string
  totalDebtBudget: number
  onNext: () => void
  onBack: () => void
}

export function Problem2DebtPage({ debts, monthStr, monthId, totalDebtBudget, onNext, onBack }: Problem2Props) {
  const dispatch = useAppDispatch()
  const { debtStrategy } = useAppSelector(state => state.dssWorkflow)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const handlePreviewDebt = async () => {
    if (!debts || debts.length === 0) return
    
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
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Problem 2</Badge>
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
              <TrendingDown className="mr-2 h-4 w-4" />
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
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleApplyDebt}
              disabled={!selectedStrategy || debtStrategy.loading}
              className="flex-1"
              size="lg"
            >
              {debtStrategy.loading ? "Applying..." : "Apply & Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
