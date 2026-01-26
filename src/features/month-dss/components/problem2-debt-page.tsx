"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ArrowLeft, ArrowRight, TrendingDown } from "lucide-react"
import { previewDebtStrategy, applyDebtStrategy, setAllocationParams } from "../dssWorkflowSlice"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

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
  monthlyIncome: number
  totalFixedCost: number // Tổng fixed costs (constraints) để tính available income
  onNext: () => void
  onBack: () => void
}

export function Problem2DebtPage({ debts, monthStr, monthId, totalDebtBudget, monthlyIncome, totalFixedCost, onNext, onBack }: Problem2Props) {
  const dispatch = useAppDispatch()
  const { debtStrategy, allocationParams } = useAppSelector(state => state.dssWorkflow)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [visibleDebtIds, setVisibleDebtIds] = useState<string[] | null>(null)
  const hasPreviewedRef = useRef(false) // Track if preview has been run at least once
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null) // For debouncing
  
  // Tính available income sau khi trừ fixed costs (chỉ để hiển thị, không dùng để tính allocation)
  const availableIncome = monthlyIncome - totalFixedCost
  
  // Tính default debt allocation từ min payments (dựa trên monthlyIncome theo yêu cầu)
  const totalMinPayment = debts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0)
  const defaultDebtAllocationPct = monthlyIncome > 0 ? (totalMinPayment / monthlyIncome) * 100 : 0
  
  // Allocation params để thử số tiền cấp phát
  // Goal: default 20%, Debt: default = min_payment/monthlyIncome
  // LƯU Ý: Tất cả allocation % đều tính dựa trên monthlyIncome, không phải availableIncome
  const [goalAllocationPct, setGoalAllocationPct] = useState(
    allocationParams.goalAllocationPct > 0 ? allocationParams.goalAllocationPct : 20
  )
  const [debtAllocationPct, setDebtAllocationPct] = useState(
    allocationParams.debtAllocationPct > 0 ? allocationParams.debtAllocationPct : defaultDebtAllocationPct
  )
  
  // Update Redux với default debt allocation nếu chưa có
  useEffect(() => {
    if (allocationParams.debtAllocationPct === 0 && defaultDebtAllocationPct > 0) {
      dispatch(setAllocationParams({
        goalAllocationPct: allocationParams.goalAllocationPct > 0 ? allocationParams.goalAllocationPct : 20,
        debtAllocationPct: defaultDebtAllocationPct
      }))
      setDebtAllocationPct(defaultDebtAllocationPct)
    }
  }, [defaultDebtAllocationPct, allocationParams.debtAllocationPct, allocationParams.goalAllocationPct, dispatch])
  
  const maxAllocationPct = 100 // Tối đa 100% có thể phân bổ (tính dựa trên monthlyIncome)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0)

  // Build chart data từ payment_plans của strategy được chọn
  // Chỉ build chart khi có revolving debts (payment_plans), không build cho fixed_payments
  const chartData = useMemo(() => {
    if (!debtStrategy.preview || !debtStrategy.preview.strategy_comparison) return []

    // Lấy payment_plans từ strategy được chọn, hoặc recommended strategy nếu chưa chọn
    const selectedStrategyName = selectedStrategy || debtStrategy.preview.recommended_strategy
    const selectedScenario = debtStrategy.preview.strategy_comparison.find(
      (sc: any) => sc.strategy === selectedStrategyName
    )

    if (!selectedScenario || !selectedScenario.payment_plans || selectedScenario.payment_plans.length === 0) {
      return []
    }

    const plans = selectedScenario.payment_plans as any[]
    // Khởi tạo visibleDebtIds mặc định = tất cả debts có plan
    if (!visibleDebtIds) {
      setVisibleDebtIds(plans.map(p => p.debt_id))
    }

    const monthMap = new Map<number, any>()

    plans.forEach(plan => {
      const debtKey = plan.debt_name as string
      ;(plan.timeline || []).forEach((snap: any) => {
        const m = snap.month as number
        if (!monthMap.has(m)) {
          monthMap.set(m, { month: m })
        }
        const entry = monthMap.get(m)
        entry[debtKey] = snap.end_balance ?? snap.start_balance
      })
    })

    return Array.from(monthMap.values()).sort((a, b) => a.month - b.month)
  }, [debtStrategy.preview, selectedStrategy, visibleDebtIds])

  const debtChartConfig = useMemo(() => {
    if (!debtStrategy.preview || !debtStrategy.preview.strategy_comparison) return {}

    // Lấy payment_plans từ strategy được chọn, hoặc recommended strategy nếu chưa chọn
    const selectedStrategyName = selectedStrategy || debtStrategy.preview.recommended_strategy
    const selectedScenario = debtStrategy.preview.strategy_comparison.find(
      (sc: any) => sc.strategy === selectedStrategyName
    )

    const plans = selectedScenario?.payment_plans || []
    const config: Record<string, { label: string; color: string }> = {}
    const palette = ['#2563eb', '#16a34a', '#f97316', '#ec4899', '#22c55e']
    plans.forEach((p: any, idx: number) => {
      config[p.debt_name] = {
        label: p.debt_name,
        color: palette[idx % palette.length],
      }
    })
    return config
  }, [debtStrategy.preview, selectedStrategy])

  const handlePreviewDebt = async (skipValidation = false) => {
    if (!debts || debts.length === 0) return
    
    // Validation: tổng allocation không được vượt quá available income
    if (!skipValidation) {
      const totalAllocationAmount = monthlyIncome * (goalAllocationPct / 100) + monthlyIncome * (debtAllocationPct / 100)
      if (totalAllocationAmount > availableIncome) {
        // Tự động điều chỉnh nếu vượt quá available income
        const scale = availableIncome / totalAllocationAmount
        const adjustedGoal = goalAllocationPct * scale
        const adjustedDebt = debtAllocationPct * scale
        setGoalAllocationPct(adjustedGoal)
        setDebtAllocationPct(adjustedDebt)
        return
      }
    }
    
    // Update allocation params trong Redux
    dispatch(setAllocationParams({ 
      goalAllocationPct, 
      debtAllocationPct 
    }))
    
    await dispatch(previewDebtStrategy({
      monthStr,
      data: {
        month_id: monthId,
        // Debts + budget đã được cache trong InitializeDSS
        goal_allocation_pct: goalAllocationPct,
        debt_allocation_pct: debtAllocationPct,
      },
      useAllocationParams: false, // Đã gửi trực tiếp trong data
    }))
    
    hasPreviewedRef.current = true
  }
  
  // Handler để đảm bảo tổng không vượt quá max
  const handleGoalAllocationChange = (value: number) => {
    const newGoal = value
    const remaining = maxAllocationPct - debtAllocationPct
    const adjustedGoal = Math.min(newGoal, remaining)
    setGoalAllocationPct(adjustedGoal)
    
    // Auto-refresh preview nếu đã preview trước đó (debounced)
    if (hasPreviewedRef.current) {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
      previewTimeoutRef.current = setTimeout(() => {
        handlePreviewDebt(true) // Skip validation vì đã validate trong handler
      }, 500) // Debounce 500ms
    }
  }
  
  const handleDebtAllocationChange = (value: number) => {
    const newDebt = value
    const remaining = maxAllocationPct - goalAllocationPct
    const adjustedDebt = Math.min(newDebt, remaining)
    setDebtAllocationPct(adjustedDebt)
    
    // Auto-refresh preview nếu đã preview trước đó (debounced)
    if (hasPreviewedRef.current) {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
      previewTimeoutRef.current = setTimeout(() => {
        handlePreviewDebt(true) // Skip validation vì đã validate trong handler
      }, 500) // Debounce 500ms
    }
  }
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
    }
  }, [])

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
      <Card>
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
          
          {/* Allocation Params Input */}
          <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Thử số tiền cấp phát cho Goal & Debt</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Điều chỉnh % thu nhập dành cho goals và debts để xem ảnh hưởng đến chiến lược trả nợ
              </p>
            </div>
            
            {/* Available Income Info */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="flex justify-between">
                <span className="text-blue-900">Thu nhập khả dụng (sau khi trừ fixed costs):</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-blue-700 font-bold">{formatCurrency(availableIncome)} / tháng</span>
                <span className="text-blue-700">(Tối đa có thể phân bổ: {formatCurrency(availableIncome)})</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Goal Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Goals</Label>
                  <Badge variant="outline" className="text-sm font-bold">
                    {goalAllocationPct.toFixed(1)}%
                  </Badge>
                </div>
                <Slider
                  value={[goalAllocationPct]}
                  onValueChange={(value) => handleGoalAllocationChange(value[0])}
                  min={0}
                  max={maxAllocationPct}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {formatCurrency(monthlyIncome * (goalAllocationPct / 100))} / tháng
                </div>
              </div>
              
              {/* Debt Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Debts</Label>
                  <Badge variant="outline" className="text-sm font-bold">
                    {debtAllocationPct.toFixed(1)}%
                  </Badge>
                </div>
                <Slider
                  value={[debtAllocationPct]}
                  onValueChange={(value) => handleDebtAllocationChange(value[0])}
                  min={0}
                  max={maxAllocationPct}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {formatCurrency(monthlyIncome * (debtAllocationPct / 100))} / tháng
                </div>
              </div>
            </div>
            
            {/* Validation Message */}
            {(() => {
              const totalAllocationAmount = monthlyIncome * (goalAllocationPct / 100) + monthlyIncome * (debtAllocationPct / 100)
              const totalAllocationPct = goalAllocationPct + debtAllocationPct
              const isValid = totalAllocationAmount <= availableIncome
              
              return (
                <>
                  {!isValid && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      ⚠️ Tổng allocation ({formatCurrency(totalAllocationAmount)}) vượt quá thu nhập khả dụng ({formatCurrency(availableIncome)})
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Tổng: {totalAllocationPct.toFixed(1)}% ({formatCurrency(totalAllocationAmount)}) / {formatCurrency(availableIncome)} khả dụng
                    {isValid && (
                      <span className="text-green-600 ml-2">✓ Hợp lệ</span>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
          
          {/* Debt Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Debt</p>
              <p className="text-2xl font-bold">
                {formatCurrency((debts || []).reduce((sum, d) => sum + (d.current_balance || 0), 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Min. Payment</p>
              <p className="text-2xl font-bold">
                {formatCurrency((debts || []).reduce((sum, d) => sum + (d.minimum_payment || 0), 0))}
              </p>
            </div>
          </div>

          {/* Preview Button */}
          {!debtStrategy.preview && (
            <Button 
              onClick={() => handlePreviewDebt(false)} 
              disabled={debtStrategy.loading} 
              className="w-full" 
              size="lg"
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              {debtStrategy.loading ? "Analyzing..." : "Preview Strategies"}
            </Button>
          )}
          
          {/* Refresh Preview Button - hiển thị khi đã có preview */}
          {debtStrategy.preview && !debtStrategy.loading && (
            <Button 
              onClick={() => handlePreviewDebt(false)} 
              disabled={debtStrategy.loading} 
              variant="outline"
              className="w-full"
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              {debtStrategy.loading ? "Refreshing..." : "Refresh Preview với Allocation Mới"}
            </Button>
          )}

          {/* Strategy Cards */}
          {debtStrategy.preview && !debtStrategy.loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debtStrategy.preview.strategy_comparison
                .filter((scenario) => scenario.strategy === 'avalanche' || scenario.strategy === 'snowball')
                .map((scenario) => {
                const isSelected = selectedStrategy === scenario.strategy
                const isRecommended = scenario.strategy === debtStrategy.preview?.recommended_strategy
                const strategyName = scenario.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'

                return (
                  <Card
                    key={scenario.strategy}
                    className={`cursor-pointer border transition-all ${
                      isSelected ? 'border-primary ring-2 ring-primary shadow-md bg-primary/5' : 'hover:border-primary/40'
                    } ${isRecommended ? 'border-primary border-2' : ''}`}
                    onClick={() => setSelectedStrategy(scenario.strategy)}
                  >
                    <CardContent className="py-4 space-y-3">
                      {/* Strategy Name */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">{strategyName}</h3>
                          {isRecommended && <Badge variant="secondary" className="text-xs">Rec</Badge>}
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                      </div>
                      
                      {/* Metrics - improved layout */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phân bổ/tháng:</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(monthlyIncome * (debtAllocationPct / 100))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Interest:</span>
                          <span className="font-semibold">{formatCurrency(scenario.total_interest)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Thời gian:</span>
                          <span className="font-semibold">{scenario.months} tháng</span>
                        </div>
                      </div>

                      {/* Debt breakdown - hiển thị phân bổ từng debt */}
                      {scenario.payment_plans && scenario.payment_plans.length > 0 && (
                        <div className="pt-3 border-t space-y-2">
                          <div className="text-muted-foreground font-medium text-sm mb-2">Phân bổ từng debt:</div>
                          {scenario.payment_plans.map((plan: any) => (
                            <div key={plan.debt_id} className="flex justify-between items-center py-1">
                              <span className="text-muted-foreground truncate flex-1 mr-2 text-sm" title={plan.debt_name}>
                                {plan.debt_name}
                              </span>
                              <span className="font-semibold text-primary whitespace-nowrap text-sm">
                                {formatCurrency(plan.monthly_payment || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}


          {/* Burn-down chart: chỉ hiển thị khi có revolving debts (payment_plans) */}
          {debtStrategy.preview && 
           debtStrategy.preview.payment_plans && 
           debtStrategy.preview.payment_plans.length > 0 && 
           chartData.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Debt balance over time (chọn chiến lược ở trên, biểu đồ theo từng khoản nợ)
              </p>
              <ChartContainer config={debtChartConfig} className="w-full h-72 rounded-md border bg-background" chartWidth={600} chartHeight={288}>
                <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tickLine={false} />
                  <YAxis tickLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelKey="month"
                        formatter={(value: number) =>
                          new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
                        }
                      />
                    }
                  />
                  <ChartLegend />
                  {Object.keys(debtChartConfig).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={debtChartConfig[key].color}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
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
