"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { previewDebtStrategy, applyDebtStrategy } from "../dssWorkflowSlice"
import { AlertCircle, CheckCircle2, TrendingDown, Calendar, DollarSign, ChevronDown, ChevronUp } from "lucide-react"

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
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set())

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Debt</p>
              <p className="text-2xl font-bold">{totalDebt.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Min. Payment</p>
              <p className="text-2xl font-bold">{totalMinPayment.toLocaleString('vi-VN')} đ</p>
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

          {/* Reasoning and Key Facts */}
          {(debtStrategy.preview.reasoning || debtStrategy.preview.key_facts?.length) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {debtStrategy.preview.reasoning && (
                  <p className="font-semibold mb-2">{debtStrategy.preview.reasoning}</p>
                )}
                {debtStrategy.preview.key_facts && debtStrategy.preview.key_facts.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {debtStrategy.preview.key_facts.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debtStrategy.preview.strategy_comparison
              .filter((scenario) => scenario.strategy === 'avalanche' || scenario.strategy === 'snowball')
              .map((scenario) => {
              const isRecommended = scenario.strategy === debtStrategy.preview?.recommended_strategy
              const isSelected = selectedStrategy === scenario.strategy
              const isExpanded = expandedStrategies.has(scenario.strategy)
              const paymentPlans = scenario.payment_plans || []

              const toggleExpand = (e: React.MouseEvent) => {
                e.stopPropagation()
                const newExpanded = new Set(expandedStrategies)
                if (isExpanded) {
                  newExpanded.delete(scenario.strategy)
                } else {
                  newExpanded.add(scenario.strategy)
                }
                setExpandedStrategies(newExpanded)
              }

              const strategyName = scenario.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'

              return (
                <Card
                  key={scenario.strategy}
                  className={`transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary shadow-md' : ''
                  } ${isRecommended ? 'border-primary border-2' : ''}`}
                  onClick={() => setSelectedStrategy(scenario.strategy)}
                >
                  <CardContent className="py-4 space-y-3">
                    {/* Strategy Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{strategyName}</h3>
                        {isRecommended && (
                          <Badge variant="secondary" className="text-xs">Rec</Badge>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>

                    {/* Metrics - improved layout */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phân bổ/tháng:</span>
                        <span className="font-bold text-primary">
                          {(scenario.monthly_allocation || 0).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Interest:</span>
                        <span className="font-semibold">{scenario.total_interest.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Thời gian:</span>
                        <span className="font-semibold">{scenario.months} tháng</span>
                      </div>
                    </div>

                    {/* Debt breakdown - hiển thị phân bổ từng debt */}
                    {paymentPlans.length > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        <div className="text-muted-foreground font-medium text-sm mb-2">Phân bổ từng debt:</div>
                        {paymentPlans.map((plan: any) => (
                          <div key={plan.debt_id} className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground truncate flex-1 mr-2 text-sm" title={plan.debt_name}>
                              {plan.debt_name}
                            </span>
                            <span className="font-semibold text-primary whitespace-nowrap text-sm">
                              {(plan.monthly_payment || 0).toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View Plans button if available */}
                    {paymentPlans.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleExpand}
                        className="w-full text-xs h-8 mt-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Ẩn chi tiết
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Xem chi tiết
                          </>
                        )}
                      </Button>
                    )}

                    {/* Pros/Cons and Payment Plans - Expandable */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Payment Plans:</h4>
                        {paymentPlans.map((plan) => (
                          <Card key={plan.debt_id} className="bg-muted/50">
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">{plan.debt_name}</p>
                                    <p className="text-xs text-muted-foreground">Debt ID: {plan.debt_id}</p>
                                  </div>
                                  <Badge variant="outline">
                                    Payoff: Month {plan.payoff_month}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Monthly Payment</p>
                                    <p className="font-semibold">{plan.monthly_payment.toLocaleString('vi-VN')} ₫</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Extra Payment</p>
                                    <p className="font-semibold text-primary">{plan.extra_payment.toLocaleString('vi-VN')} ₫</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Total Interest</p>
                                    <p className="font-semibold">{plan.total_interest.toLocaleString('vi-VN')} ₫</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
