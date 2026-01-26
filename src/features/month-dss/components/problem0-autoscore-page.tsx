import { useEffect, useMemo, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewAutoScoring, setCustomWeights as setCustomWeightsRedux, setAllocationParams } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, BarChart2, CheckCircle2, Sliders } from "lucide-react"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  priority: string
  status: string
  category?: string
}

interface Problem0Props {
  goals: Goal[]
  monthId: string
  monthStr: string
  monthlyIncome: number
  totalFixedCost: number // Tổng fixed costs (constraints) để tính available income
  onNext: () => void
  onBack: () => void
}

export function Problem0AutoScorePage({ goals, monthId, monthStr, monthlyIncome, totalFixedCost, onNext, onBack }: Problem0Props) {
  const dispatch = useAppDispatch()
  const { autoScoring, allocationParams } = useAppSelector(state => state.dssWorkflow)
  const hasRunRef = useRef(false) // Prevent duplicate calls
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0)
  
  // Custom criteria weights (default to equal weights)
  // NOTE: Impact is temporarily disabled - redistribute to 3 criteria
  const defaultWeights = useMemo(() => ({
    feasibility: 1.0 / 3.0, // ~0.333
    impact: 0, // Temporarily disabled
    importance: 1.0 / 3.0, // ~0.333
    urgency: 1.0 / 3.0, // ~0.333
  }), [])
  
  const [customWeights, setCustomWeights] = useState(defaultWeights)
  const [showWeightControls, setShowWeightControls] = useState(false)
  
  // Goal allocation percentage (default 20%)
  const [goalAllocationPct, setGoalAllocationPct] = useState(
    allocationParams.goalAllocationPct > 0 ? allocationParams.goalAllocationPct : 20
  )
  // Debt allocation percentage (sẽ được tính từ min_payment/income ở Step 2)
  const [debtAllocationPct, setDebtAllocationPct] = useState(
    allocationParams.debtAllocationPct > 0 ? allocationParams.debtAllocationPct : 0
  )
  
  // Tính available income sau khi trừ fixed costs
  const availableIncome = monthlyIncome - totalFixedCost
  const maxAllocationPct = availableIncome > 0 ? (availableIncome / monthlyIncome) * 100 : 0
  
  // Sync custom weights when results arrive
  useEffect(() => {
    if (autoScoring.results?.default_criteria_weights) {
      const weights = autoScoring.results.default_criteria_weights
      const newWeights = {
        feasibility: weights.feasibility || 0.25,
        impact: weights.impact || 0.25,
        importance: weights.importance || 0.25,
        urgency: weights.urgency || 0.25,
      }
      setCustomWeights(newWeights)
      dispatch(setCustomWeightsRedux(newWeights)) // Save to Redux
    }
  }, [autoScoring.results?.default_criteria_weights, dispatch])
  
  // Sync custom weights to Redux whenever they change
  useEffect(() => {
    dispatch(setCustomWeightsRedux(customWeights))
  }, [customWeights, dispatch])
  
  // Memoize activeGoals to prevent re-computation on every render
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])

  // DEBUG
  console.log('🔍 Problem0 State:', {
    loading: autoScoring.loading,
    hasResults: !!autoScoring.results,
    results: autoScoring.results,
    error: autoScoring.error,
    activeGoalsCount: activeGoals.length,
    monthlyIncome,
    hasRunRef: hasRunRef.current,
  })

  useEffect(() => {
    // Auto-run preview on mount if not already loaded
    const shouldRun = activeGoals.length > 0 && 
      !autoScoring.results && 
      !autoScoring.loading && 
      monthlyIncome > 0 &&
      !hasRunRef.current
      
    console.log('🔍 Should run preview?', {
      shouldRun,
      hasActiveGoals: activeGoals.length > 0,
      hasResults: !!autoScoring.results,
      isLoading: autoScoring.loading,
      hasIncome: monthlyIncome > 0,
      hasRun: hasRunRef.current,
    })
    
    if (shouldRun) {
      console.log('🚀 Dispatching previewAutoScoring with goals:', activeGoals);
      hasRunRef.current = true
      
      // Update allocation params trong Redux
      dispatch(setAllocationParams({ 
        goalAllocationPct: goalAllocationPct, 
        debtAllocationPct: allocationParams.debtAllocationPct 
      }))
      
      dispatch(previewAutoScoring({
        monthStr,
        data: {
          month_id: monthId,
          monthly_income: monthlyIncome,
          goals: activeGoals.map(g => ({
          id: g.id,
          name: g.name,
          target_amount: g.targetAmount,
          current_amount: g.currentAmount,
          target_date: g.targetDate,
          type: g.category || 'other',
          priority: g.priority,
          })),
          goal_allocation_pct: goalAllocationPct, // Gửi allocation param
        },
        useAllocationParams: false, // Đã gửi trực tiếp trong data
      }))
    }
  }, [activeGoals.length, dispatch, monthId, monthStr, monthlyIncome, autoScoring.loading, autoScoring.results])
  
  // Reset hasRunRef when monthlyIncome or goalAllocationPct changes to allow re-run
  useEffect(() => {
    hasRunRef.current = false;
  }, [monthlyIncome, goalAllocationPct])
  
  // Update Redux với default goal allocation nếu chưa có
  useEffect(() => {
    if (allocationParams.goalAllocationPct === 0) {
      dispatch(setAllocationParams({
        goalAllocationPct: 20,
        debtAllocationPct: allocationParams.debtAllocationPct
      }))
      setGoalAllocationPct(20)
    }
  }, [allocationParams.goalAllocationPct, allocationParams.debtAllocationPct, dispatch])
  
  // Update Redux khi allocation params thay đổi
  useEffect(() => {
    dispatch(setAllocationParams({ 
      goalAllocationPct, 
      debtAllocationPct 
    }))
  }, [goalAllocationPct, debtAllocationPct, dispatch])
  
  // Handle goal allocation change
  const handleGoalAllocationChange = (newPct: number) => {
    const adjusted = Math.min(newPct, maxAllocationPct - debtAllocationPct)
    setGoalAllocationPct(Math.max(0, adjusted))
  }
  
  // Handle debt allocation change
  const handleDebtAllocationChange = (newPct: number) => {
    const adjusted = Math.min(newPct, maxAllocationPct - goalAllocationPct)
    setDebtAllocationPct(Math.max(0, adjusted))
  }
  
  // Re-run preview khi user thay đổi allocation (chỉ khi đã có results)
  const handleAllocationChangeWithPreview = (newPct: number) => {
    const adjusted = Math.min(newPct, maxAllocationPct - debtAllocationPct)
    setGoalAllocationPct(Math.max(0, adjusted))
    
    // Re-run preview với allocation mới (nếu đã có results trước đó)
    if (activeGoals.length > 0 && monthlyIncome > 0 && autoScoring.results) {
      hasRunRef.current = false
      dispatch(previewAutoScoring({
        monthStr,
        data: {
          month_id: monthId,
          monthly_income: monthlyIncome,
          goals: activeGoals.map(g => ({
            id: g.id,
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            target_date: g.targetDate,
            type: g.category || 'other',
            priority: g.priority,
          })),
          goal_allocation_pct: adjusted,
        },
        useAllocationParams: false,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Problem 0</Badge>
              </div>
              <CardTitle className="text-2xl">Initial Goal Assessment</CardTitle>
              <CardDescription>
                AI-driven analysis of your current goals to calculate a feasibility score.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Allocation Params Input */}
          <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">Thử số tiền cấp phát cho Goal & Debt</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Điều chỉnh % thu nhập dành cho goals và debts để xem ảnh hưởng đến feasibility score
                </p>
              </div>
            </div>
            
            {/* Available Income Info */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="flex justify-between">
                <span className="text-blue-900">Thu nhập khả dụng (sau khi trừ fixed costs):</span>
                <span className="font-bold text-blue-900">{maxAllocationPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-blue-700">{formatCurrency(availableIncome)} / tháng</span>
                <span className="text-blue-700">(Tối đa: {formatCurrency(monthlyIncome * (maxAllocationPct / 100))})</span>
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
                  onValueChange={(value) => {
                    handleGoalAllocationChange(value[0])
                    // Re-run preview nếu đã có results
                    if (autoScoring.results) {
                      handleAllocationChangeWithPreview(value[0])
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleDebtAllocationChange(value[0])
                  }}
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
            {goalAllocationPct + debtAllocationPct > maxAllocationPct && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ⚠️ Tổng allocation ({goalAllocationPct + debtAllocationPct}%) vượt quá thu nhập khả dụng ({maxAllocationPct.toFixed(1)}%)
              </div>
            )}
            
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Tổng: {(goalAllocationPct + debtAllocationPct).toFixed(1)}% / {maxAllocationPct.toFixed(1)}% khả dụng
              {goalAllocationPct + debtAllocationPct <= maxAllocationPct && (
                <span className="text-green-600 ml-2">✓ Hợp lệ</span>
              )}
            </div>
          </div>
          
          {/* Debug Info */}
          {!autoScoring.loading && !autoScoring.results && !autoScoring.error && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p><strong>Debug Info:</strong></p>
              <pre>{JSON.stringify({
                loading: autoScoring.loading,
                hasResults: !!autoScoring.results,
                error: autoScoring.error,
                activeGoals: activeGoals.length,
                monthlyIncome,
                hasRunRef: hasRunRef.current,
              }, null, 2)}</pre>
            </div>
          )}
          
          {autoScoring.loading && (
             <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
               <BarChart2 className="h-8 w-8 animate-bounce mb-2" />
               <p>Calculating goal feasibility scores...</p>
             </div>
          )}

          {autoScoring.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {autoScoring.error}
             </div>
          )}

          {/* Results */}
          {autoScoring.results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center">
                 <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                 Goal Assessment Scores
              </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWeightControls(!showWeightControls)}
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  {showWeightControls ? 'Ẩn' : 'Điều chỉnh'} trọng số
                </Button>
              </div>

              {/* Weight Controls */}
              {showWeightControls && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <div className="text-sm font-medium text-blue-900 mb-3">
                    Điều chỉnh độ ưu tiên các tiêu chí đánh giá:
                  </div>
                  
                  {(['feasibility', 'importance', 'urgency'] as const).map((criterion) => {
                    const labels = {
                      feasibility: 'Khả thi',
                      // impact: 'Ảnh hưởng', // Temporarily disabled
                      importance: 'Quan trọng',
                      urgency: 'Cấp bách',
                    }
                    
                    return (
                      <div key={criterion} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">
                            {labels[criterion]}
                          </label>
                          <span className="text-sm text-muted-foreground">
                            {(customWeights[criterion] * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Slider
                          value={[customWeights[criterion] * 100]}
                          onValueChange={(value) => {
                            const newWeight = value[0] / 100
                            setCustomWeights(prev => {
                              // Calculate remaining weight for other criteria (excluding impact)
                              const others = (['feasibility', 'importance', 'urgency'] as const).filter(k => k !== criterion)
                              const otherSum = others.reduce((sum, k) => sum + prev[k], 0)
                              const remainingWeight = 1 - newWeight
                              
                              // Distribute remaining weight proportionally
                              const newWeights = { ...prev, [criterion]: newWeight }
                              if (otherSum > 0) {
                                others.forEach(k => {
                                  newWeights[k] = (prev[k] / otherSum) * remainingWeight
                                })
                              }
                              
                              return newWeights
                            })
                          }}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )
                  })}
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Tổng: {((customWeights.feasibility + customWeights.importance + customWeights.urgency) * 100).toFixed(0)}%
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setCustomWeights(defaultWeights)}
                  >
                    Đặt lại mặc định
                  </Button>
                </div>
              )}
              
              <div className="grid gap-4">
                {activeGoals.map(goal => {
                  const result = autoScoring.results?.goals.find(r => r.goal_id === goal.id)
                  
                  // Calculate total score from individual criteria (use custom weights)
                  // NOTE: Impact is temporarily disabled
                  const totalScore = result ? 
                    (result.scores.feasibility.score * customWeights.feasibility +
                     // result.scores.impact.score * customWeights.impact + // Temporarily disabled
                     result.scores.importance.score * customWeights.importance +
                     result.scores.urgency.score * customWeights.urgency) : 0
                  
                  const score = totalScore * 100 // Convert to percentage
                  
                  return (
                    <div key={goal.id} className="p-4 bg-muted/20 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <div className="font-semibold text-base">{goal.name}</div>
                           <p className="text-sm text-muted-foreground mt-1">
                             Mục tiêu: {goal.targetAmount?.toLocaleString('vi-VN')} đ | Hiện tại: {goal.currentAmount?.toLocaleString('vi-VN')} đ
                           </p>
                        </div>
                        <Badge variant={score > 70 ? "default" : score > 40 ? "secondary" : "destructive"}>
                           Điểm: {score.toFixed(0)}%
                            </Badge>
                      </div>
                      
                      <Progress value={score} className="h-2" />
                      
                      {result && (
                        <div className="text-xs space-y-1.5 pt-2 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Khả thi:</span>
                              <span className="ml-1 text-blue-600 font-semibold">{(result.scores.feasibility.score * 10).toFixed(1)}/10</span>
                            </div>
                            {/* Impact temporarily disabled */}
                            {/* <div>
                              <span className="font-medium">Ảnh hưởng:</span>
                              <span className="ml-1 text-purple-600 font-semibold">{(result.scores.impact?.score * 10 || 0).toFixed(1)}/10</span>
                            </div> */}
                            <div>
                              <span className="font-medium">Quan trọng:</span>
                              <span className="ml-1 text-orange-600 font-semibold">{(result.scores.importance.score * 10).toFixed(1)}/10</span>
                            </div>
                            <div>
                              <span className="font-medium">Cấp bách:</span>
                              <span className="ml-1 text-red-600 font-semibold">{(result.scores.urgency.score * 10).toFixed(1)}/10</span>
                            </div>
                          </div>
                          <div className="text-muted-foreground space-y-1 pt-2">
                            <div><strong>Feasibility:</strong> {result.scores.feasibility.reason}</div>
                            {/* <div><strong>Impact:</strong> {result.scores.impact?.reason || 'N/A'}</div> */}
                            <div><strong>Importance:</strong> {result.scores.importance.reason}</div>
                            <div><strong>Urgency:</strong> {result.scores.urgency.reason}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
                <Button onClick={onNext} className="flex-1" size="lg">
                  Tiếp tục
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
