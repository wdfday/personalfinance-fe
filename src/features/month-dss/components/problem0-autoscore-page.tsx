import { useEffect, useMemo, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewAutoScoring, setCustomWeights as setCustomWeightsRedux } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, BarChart2, CheckCircle2, Sliders } from "lucide-react"

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
  onNext: () => void
}

export function Problem0AutoScorePage({ goals, monthId, monthStr, monthlyIncome, onNext }: Problem0Props) {
  const dispatch = useAppDispatch()
  const { autoScoring } = useAppSelector(state => state.dssWorkflow)
  const hasRunRef = useRef(false) // Prevent duplicate calls
  
  // Custom criteria weights (default to equal weights)
  const defaultWeights = useMemo(() => ({
    feasibility: 0.25,
    impact: 0.25,
    importance: 0.25,
    urgency: 0.25,
  }), [])
  
  const [customWeights, setCustomWeights] = useState(defaultWeights)
  const [showWeightControls, setShowWeightControls] = useState(false)
  
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
        }))
        }
      }))
    }
  }, [activeGoals.length, dispatch, monthId, monthStr, monthlyIncome, autoScoring.loading, autoScoring.results])
  
  // Reset hasRunRef when monthlyIncome changes to allow re-run
  useEffect(() => {
    hasRunRef.current = false;
  }, [monthlyIncome])

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
                  
                  {(['feasibility', 'impact', 'importance', 'urgency'] as const).map((criterion) => {
                    const labels = {
                      feasibility: 'Khả thi',
                      impact: 'Ảnh hưởng',
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
                              // Calculate remaining weight for other criteria
                              const others = Object.keys(prev).filter(k => k !== criterion) as Array<keyof typeof prev>
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
                    Tổng: {((customWeights.feasibility + customWeights.impact + customWeights.importance + customWeights.urgency) * 100).toFixed(0)}%
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
                  const totalScore = result ? 
                    (result.scores.feasibility.score * customWeights.feasibility +
                     result.scores.impact.score * customWeights.impact +
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
                            <div>
                              <span className="font-medium">Ảnh hưởng:</span>
                              <span className="ml-1 text-purple-600 font-semibold">{(result.scores.impact.score * 10).toFixed(1)}/10</span>
                            </div>
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
                            <div><strong>Impact:</strong> {result.scores.impact.reason}</div>
                            <div><strong>Importance:</strong> {result.scores.importance.reason}</div>
                            <div><strong>Urgency:</strong> {result.scores.urgency.reason}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-4">
                <Button onClick={onNext} className="w-full" size="lg">
                  Proceed to Prioritization
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
