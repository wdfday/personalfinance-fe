import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewGoalDebtTradeoff, applyGoalDebtTradeoff } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, TrendingUp, Wallet, CheckCircle2, PieChart, Settings } from "lucide-react"

interface Problem3Props {
  monthId: string
  monthStr: string
  onNext: () => void
  onBack: () => void
}

export function Problem3TradeoffPage({ monthId, monthStr, onNext, onBack }: Problem3Props) {
  const dispatch = useAppDispatch()
  const { goalDebtTradeoff } = useAppSelector(state => state.dssWorkflow)
  
  // User preferences (for preview)
  const [preferences, setPreferences] = useState({
    psychological_weight: 0.3,
    priority: 'balanced' as 'debt_first' | 'balanced' | 'goals_first',
    accept_investment_risk: true,
    risk_tolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive'
  })

  // Selected allocation (after preview, for apply)
  const [allocation, setAllocation] = useState([50]) // 0 = 100% Debt, 100 = 100% Goals
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  // Update allocation when user selects a strategy from preview results
  useEffect(() => {
    if (goalDebtTradeoff.preview?.recommended_strategy) {
      const recommended = goalDebtTradeoff.preview.strategies.find(
        s => s.strategy === goalDebtTradeoff.preview?.recommended_strategy
      )
      if (recommended) {
        setAllocation([recommended.ratio.savings_percent * 100])
        setSelectedStrategy(recommended.strategy)
      }
    }
  }, [goalDebtTradeoff.preview])

  const goalPercent = allocation[0]
  const debtPercent = 100 - goalPercent

  const handlePreview = async () => {
    // Preview with user preferences (backend collects Goals & Debts from Step 1 & 2)
    await dispatch(previewGoalDebtTradeoff({
      monthStr,
      data: {
        month_id: monthId,
        preferences
      }
    }))
  }

  const handleApply = async () => {
    // Apply with selected allocation %
    const result = await dispatch(applyGoalDebtTradeoff({
      monthStr,
      data: {
        month_id: monthId,
        goal_allocation_percent: goalPercent,
        debt_allocation_percent: debtPercent
      }
    }))

    if (result.meta.requestStatus === 'fulfilled') {
      onNext()
    }
  }

  // Helper to format currency (mock calculation for UI display)
  // Real calculation happens on backend, this is just for immediate feedback on slider move
  // Ideally we would trigger a debounced preview on slider change, but for now we rely on the button
  
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Problem 3</Badge>
              </div>
              <CardTitle className="text-2xl">Goal-Debt Tradeoff</CardTitle>
              <CardDescription>Balance between saving for goals and paying off debt</CardDescription>
            </div>
            {goalDebtTradeoff.preview && (
              <Badge variant="secondary" className="text-sm">
                Recommended: {goalDebtTradeoff.preview.recommended_goal_allocation}% Goals
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Preferences (before preview) */}
          {!goalDebtTradeoff.preview && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                <h3 className="font-semibold">Your Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={preferences.priority} 
                    onValueChange={(val) => setPreferences({...preferences, priority: val as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debt_first">Debt First</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="goals_first">Goals First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select 
                    value={preferences.risk_tolerance} 
                    onValueChange={(val) => setPreferences({...preferences, risk_tolerance: val as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Slider Control (after preview) */}
          {goalDebtTradeoff.preview && (
            <div className="space-y-6 py-4">
            <div className="flex justify-between items-end">
              <div className="text-left w-1/3">
                <div className="font-bold text-xl text-red-600">{debtPercent}%</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="w-4 h-4" /> Debt Repayment
                </div>
              </div>
              
              <div className="text-center w-1/3 font-medium text-muted-foreground pb-1">
                Allocation Split
              </div>

              <div className="text-right w-1/3">
                <div className="font-bold text-xl text-green-600">{goalPercent}%</div>
                <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                  Goal Savings <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Slider
              defaultValue={[50]}
              value={allocation}
              min={0}
              max={100}
              step={5}
              onValueChange={setAllocation}
              className="py-4"
            />
            
            <p className="text-center text-sm text-muted-foreground">
              Adjust the slider to prioritize debt reduction or goal achievement.
            </p>
            </div>
          )}

          {/* Action: Run Simulation */}
          {!goalDebtTradeoff.preview && (
            <Button 
              onClick={handlePreview} 
              disabled={goalDebtTradeoff.loading} 
              className="w-full"
              size="lg"
            >
              {goalDebtTradeoff.loading ? "Analyzing Trade-offs..." : "Analyze Trade-off Strategies"}
              <PieChart className="ml-2 h-4 w-4" />
            </Button>
          )}

          {/* Simulation Results */}
          {goalDebtTradeoff.preview && (
            <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold flex items-center">
                 <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                 Projected Impact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Debt Free Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {goalDebtTradeoff.preview.scenarios.find(s => s.name === "Current Selection")?.debt_percent 
                        ? "+ 2 months" // Mock data until backend returns specific impact metrics per scenario
                        : "No Change"
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">vs. Minimum Payment</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Goal Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                       High
                    </div>
                    <p className="text-xs text-muted-foreground">Based on current priority</p>
                  </CardContent>
                </Card>
              </div>

              {/* Scenarios List */}
              <div className="space-y-2 mt-4">
                 <h4 className="text-sm font-semibold mb-2">Analyzed Scenarios:</h4>
                 {goalDebtTradeoff.preview.scenarios.map((scenario) => (
                   <div 
                      key={scenario.name} 
                      className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                        scenario.goal_percent === goalPercent ? 'bg-primary/5 border-primary' : 'bg-muted/50'
                      }`}
                   >
                     <span className="font-medium">{scenario.name}</span>
                     <span className="text-muted-foreground">
                       {scenario.debt_percent}% Debt / {scenario.goal_percent}% Goals
                     </span>
                   </div>
                 ))}
              </div>

              {/* Apply Action */}
              <div className="pt-4">
                <Button onClick={handleApply} disabled={goalDebtTradeoff.loading} className="w-full" size="lg">
                  {goalDebtTradeoff.loading ? "Applying..." : "Confirm Allocation & Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 pt-4">
            <Button variant="ghost" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Debt Strategy
            </Button>
            {!goalDebtTradeoff.preview && (
              <Button variant="ghost" onClick={handlePreview} className="flex-1 opacity-50">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
