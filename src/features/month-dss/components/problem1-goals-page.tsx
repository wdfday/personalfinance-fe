import { useEffect, useMemo, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewGoalPrioritization } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Target, TrendingUp, CheckCircle2 } from "lucide-react"

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

interface Problem1Props {
  goals: Goal[]
  monthId: string
  monthStr: string
  onNext: () => void
  onBack: () => void
}

export function Problem1GoalsPage({ goals, monthId, monthStr, onNext, onBack }: Problem1Props) {
  const dispatch = useAppDispatch()
  const { goalPrioritization, autoScoring } = useAppSelector(state => state.dssWorkflow)
  const hasRunRef = useRef(false)
  const lastWeightsKeyRef = useRef<string>('')
  
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])

  // Build stable key from customWeights to detect real changes (avoid object reference churn)
  // NOTE: Impact is temporarily disabled
  const customWeights = autoScoring.customWeights
  const weightsKey = customWeights
    ? `${customWeights.feasibility}|${customWeights.importance}|${customWeights.urgency}`
    : ''

  // Auto-run preview: only on mount (no preview yet) OR when weights actually changed. Avoid loop after apply/continue.
  useEffect(() => {
    if (activeGoals.length < 2 || goalPrioritization.loading) return

    const isFirstRun = !goalPrioritization.preview && !hasRunRef.current
    const weightsChanged = weightsKey && weightsKey !== lastWeightsKeyRef.current

    if (!isFirstRun && !weightsChanged) return

    hasRunRef.current = true
    lastWeightsKeyRef.current = weightsKey || lastWeightsKeyRef.current

    // NOTE: Impact is temporarily disabled - set to 0
    const criteriaWeights = customWeights ? {
      feasibility: customWeights.feasibility,
      impact: 0, // Temporarily disabled
      importance: customWeights.importance,
      urgency: customWeights.urgency,
    } : undefined

    dispatch(previewGoalPrioritization({
      monthStr,
      data: {
        month_id: monthId,
        criteria_weights: criteriaWeights,
        goals: activeGoals.map(g => {
          const autoScore = autoScoring.results?.goals.find(r => r.goal_id === g.id)
          return {
            id: g.id,
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            target_date: g.targetDate || new Date().toISOString(),
            type: g.category || 'other',
            priority: g.priority,
            ...(autoScore && {
              feasibility_score: autoScore.scores.feasibility.score,
              // impact_score: autoScore.scores.impact?.score || 0, // Temporarily disabled
              importance_score: autoScore.scores.importance.score,
              urgency_score: autoScore.scores.urgency.score,
            })
          }
        })
      }
    }))
  }, [
    activeGoals,
    monthId,
    monthStr,
    weightsKey,
    !!goalPrioritization.preview,
    goalPrioritization.loading,
    dispatch
  ])

  const getProgress = (goal: Goal) => {
    const current = goal.currentAmount || 0
    const target = goal.targetAmount || 1
    return (current / target) * 100
  }

  // Function to manually re-run preview with current weights
  const handleRerunPreview = () => {
    if (activeGoals.length < 2 || goalPrioritization.loading) return
    
    const customWeights = autoScoring.customWeights
    // NOTE: Impact is temporarily disabled - set to 0
    const criteriaWeights = customWeights ? {
      feasibility: customWeights.feasibility,
      impact: 0, // Temporarily disabled
      importance: customWeights.importance,
      urgency: customWeights.urgency,
    } : undefined
    
    console.log('🔄 Re-running preview with weights:', criteriaWeights)
    
    dispatch(previewGoalPrioritization({
      monthStr,
      data: {
        month_id: monthId,
        criteria_weights: criteriaWeights,
        goals: activeGoals.map(g => {
          const autoScore = autoScoring.results?.goals.find(r => r.goal_id === g.id)
          return {
            id: g.id,
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            target_date: g.targetDate || new Date().toISOString(),
            type: g.category || 'other',
            priority: g.priority,
            ...(autoScore && {
              feasibility_score: autoScore.scores.feasibility.score,
              // impact_score: autoScore.scores.impact?.score || 0, // Temporarily disabled
              importance_score: autoScore.scores.importance.score,
              urgency_score: autoScore.scores.urgency.score,
            })
          }
        })
      }
    }))
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Problem 1</Badge>
              </div>
              <CardTitle className="text-2xl">Financial Goal Prioritization</CardTitle>
              <CardDescription>
                Determine the relative importance of your active goals using AHP (Analytic Hierarchy Process).
                {autoScoring.customWeights && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Using custom weights: Feasibility {Math.round(autoScoring.customWeights.feasibility * 100)}%, 
                    {/* Impact {Math.round(autoScoring.customWeights.impact * 100)}%, */} 
                    Importance {Math.round(autoScoring.customWeights.importance * 100)}%, 
                    Urgency {Math.round(autoScoring.customWeights.urgency * 100)}%
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Loading State */}
          {goalPrioritization.loading && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <TrendingUp className="h-8 w-8 animate-bounce mb-2" />
              <p>Đang phân tích độ ưu tiên mục tiêu...</p>
            </div>
          )}

          {/* Error State */}
          {goalPrioritization.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Lỗi:</strong> {goalPrioritization.error}
            </div>
          )}

          {/* Trường hợp ít mục tiêu */}
          {activeGoals.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
              Hiện tại bạn chưa chọn mục tiêu nào cho tháng này. Hãy quay lại bước trước để chọn ít nhất 1 mục tiêu,
              hoặc nhấn <strong>Tiếp tục</strong> để bỏ qua bước ưu tiên mục tiêu.
            </div>
          )}

          {activeGoals.length === 1 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 space-y-2">
              <p>
                Chỉ có <strong>01 mục tiêu</strong> đang hoạt động, vì vậy độ ưu tiên là hiển nhiên: 
                mục tiêu này sẽ được xem là ưu tiên cao nhất (100%).
              </p>
              <div className="mt-2 p-3 bg-white rounded border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{activeGoals[0].name}</span>
                  <Badge variant="default">Priority 1</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Results: Ranked Goals */}
          {goalPrioritization.preview && activeGoals.length >= 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  Thứ tự ưu tiên được đề xuất
                </h3>
                {autoScoring.customWeights && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRerunPreview}
                    disabled={goalPrioritization.loading}
                  >
                    🔄 Re-run với trọng số mới
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {goalPrioritization.preview.ranking.map((ranked, index) => {
                  const originalGoal = activeGoals.find(g => g.id === ranked.alternative_id)
                  if (!originalGoal) return null
                  
                  const priorityColors = ['bg-yellow-50 border-yellow-200', 'bg-blue-50 border-blue-200', 'bg-gray-50 border-gray-200']
                  const rankColors = ['bg-yellow-500 text-white', 'bg-blue-500 text-white', 'bg-gray-500 text-white']
                  
                  return (
                    <div key={ranked.alternative_id} className={`p-4 rounded-lg border ${priorityColors[index] || 'bg-muted/20'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${rankColors[index] || 'bg-primary'} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base mb-1">{ranked.alternative_name}</div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Mục tiêu: {originalGoal.targetAmount?.toLocaleString('vi-VN')} đ</div>
                            <div>Hiện tại: {originalGoal.currentAmount?.toLocaleString('vi-VN')} đ</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={getProgress(originalGoal)} className="h-2 flex-1" />
                              <span className="text-xs font-medium">{getProgress(originalGoal).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant={index === 0 ? "default" : "secondary"} className="mb-2">
                            {index === 0 ? '🏆 Cao nhất' : `#${index + 1}`}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Điểm AHP: <span className="font-semibold">{(ranked.priority * 10).toFixed(1)}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation luôn hiển thị, kể cả khi không có/ít goal */}
          <div className="pt-6 flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <Button onClick={onNext} className="flex-1" size="lg">
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
