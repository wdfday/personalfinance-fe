import { useEffect, useMemo, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewGoalPrioritization } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Target, TrendingUp, CheckCircle2 } from "lucide-react"

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
}

export function Problem1GoalsPage({ goals, monthId, monthStr, onNext }: Problem1Props) {
  const dispatch = useAppDispatch()
  const { goalPrioritization, autoScoring } = useAppSelector(state => state.dssWorkflow)
  const hasRunRef = useRef(false)
  
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])

  // DEBUG
  console.log('🔍 Problem1 State:', {
    loading: goalPrioritization.loading,
    hasPreview: !!goalPrioritization.preview,
    preview: goalPrioritization.preview,
    error: goalPrioritization.error,
  })

  // Auto-run preview on mount
  useEffect(() => {
    if (
      activeGoals.length > 0 && 
      !goalPrioritization.preview && 
      !goalPrioritization.loading &&
      !hasRunRef.current
    ) {
      console.log('🚀 Auto-running goal prioritization preview...')
      hasRunRef.current = true
      
      // Convert custom weights (0-1) to criteria ratings (1-10)
      const customWeights = autoScoring.customWeights
      const criteriaRatings = customWeights ? {
        feasibility: Math.round(customWeights.feasibility * 10),
        impact: Math.round(customWeights.impact * 10),
        importance: Math.round(customWeights.importance * 10),
        urgency: Math.round(customWeights.urgency * 10),
      } : undefined
      
      console.log('📊 Sending criteria ratings:', criteriaRatings)
      
      dispatch(previewGoalPrioritization({
        monthStr,
        data: {
          month_id: monthId,
          criteria_ratings: criteriaRatings, // Pass custom weights from Step 0
          goals: activeGoals.map(g => {
            // Use auto-scoring results if available
            const autoScore = autoScoring.results?.goals.find(r => r.goal_id === g.id)
            
            return {
              id: g.id, // Backend expects 'id', not 'goal_id'
              name: g.name,
              target_amount: g.targetAmount,
              current_amount: g.currentAmount,
              target_date: g.targetDate || new Date().toISOString(),
              type: g.category || 'other',
              priority: g.priority,
              // Include auto-scoring if available
              ...(autoScore && {
                feasibility_score: autoScore.scores.feasibility.score,
                impact_score: autoScore.scores.impact.score,
                importance_score: autoScore.scores.importance.score,
                urgency_score: autoScore.scores.urgency.score,
              })
            }
          })
        }
      }))
    }
  }, [activeGoals.length, dispatch, monthId, monthStr, goalPrioritization.loading, goalPrioritization.preview, autoScoring.results])

  const getProgress = (goal: Goal) => {
    const current = goal.currentAmount || 0
    const target = goal.targetAmount || 1
    return (current / target) * 100
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

          {/* Results: Ranked Goals */}
          {goalPrioritization.preview && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center">
                 <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                 Thứ tự ưu tiên được đề xuất
              </h3>
              
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

              <div className="pt-4">
                <Button onClick={onNext} className="w-full" size="lg">
                  Xác nhận & Tiếp tục
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
