import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewBudgetAllocation, applyBudgetAllocation } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, PieChart, BarChart3, TrendingUp, AlertCircle } from "lucide-react"

interface Problem4Props {
  monthId: string
  monthStr: string
  monthlyIncome: number
  constraints: any[]
  goalAllocationPct: number  // From Step 3
  debtAllocationPct: number  // From Step 3
  onBack: () => void
  onComplete: () => void
}

export function Problem4AllocationPage({ 
  monthId, 
  monthStr, 
  monthlyIncome,
  constraints,
  goalAllocationPct,
  debtAllocationPct,
  onBack, 
  onComplete 
}: Problem4Props) {
  const dispatch = useAppDispatch()
  const { budgetAllocation } = useAppSelector(state => state.dssWorkflow)

  // Trigger preview automatically on mount if not already done
  useEffect(() => {
    // Always refresh preview if input data changes, or if not loaded
    const shouldPreview = !budgetAllocation.preview || budgetAllocation.preview.month_id !== monthId
    
    if (shouldPreview && !budgetAllocation.loading) {
      dispatch(previewBudgetAllocation({
        monthStr,
        data: {
          month_id: monthId,
          total_income: monthlyIncome,
          goal_allocation_pct: goalAllocationPct, // From Step 3
          debt_allocation_pct: debtAllocationPct, // From Step 3
          constraints: constraints.map(c => ({
            category_id: c.category_id,
            category_name: c.category_name,
            min_amount: c.minimum_amount,
            max_amount: c.maximum_amount || c.minimum_amount,
            flexibility: c.is_flexible ? 'flexible' : 'fixed',
            priority: c.priority || 5,
            is_ad_hoc: c.is_ad_hoc || false,
            description: c.description
          }))
          // Backend collects Goals & Debts from Step 1 & 2
        }
      }))
    }
  }, [dispatch, monthStr, monthId, monthlyIncome, constraints])

  const handleApply = async (scenarioName: string) => {
    // Find selected scenario to get its allocations
    const selectedScenario = budgetAllocation.preview?.scenarios.find(
      s => s.scenario_name === scenarioName
    )
    
    if (!selectedScenario) return

    // Build allocations map from scenario
    const allocations: Record<string, number> = {}
    selectedScenario.category_allocations.forEach(cat => {
      allocations[cat.category_id] = cat.amount
    })

    const result = await dispatch(applyBudgetAllocation({
      monthStr,
      data: {
        month_id: monthId,
        selected_scenario: scenarioName,
        allocations // Send full allocations map
      }
    }))

    if (result.meta.requestStatus === 'fulfilled') {
      onComplete()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Problem 4</Badge>
              </div>
              <CardTitle className="text-2xl">Final Budget Allocation</CardTitle>
              <CardDescription>
                Review and select the optimal budget allocation based on your priorities, strategies, and trade-offs.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {budgetAllocation.loading && (
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
               <PieChart className="w-12 h-12 mb-4 text-green-500 opacity-50" />
               <p>Calculating optimal allocations...</p>
             </div>
          )}

          {budgetAllocation.error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{budgetAllocation.error}</p>
              <Button variant="link" onClick={() => window.location.reload()} className="ml-auto">Retry</Button>
            </div>
          )}

          {!budgetAllocation.loading && budgetAllocation.preview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {budgetAllocation.preview.scenarios.map((scenario) => (
                 <Card key={scenario.scenario_name} className="flex flex-col overflow-hidden border-2 hover:border-green-500/50 transition-colors">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                        <Badge variant="secondary">Score: 98/100</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 py-4">
                      {/* Simplified category preview - ideally show top 5 categories */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Total Allocated</span>
                          <span className="font-bold">
                            ${scenario.category_allocations.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 text-xs text-muted-foreground">
                          {scenario.category_allocations.length} categories funded
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 pt-4">
                      <Button onClick={() => handleApply(scenario.scenario_name)} className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Apply Plan
                      </Button>
                    </CardFooter>
                 </Card>
               ))}
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex gap-2 mt-8">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Review Trade-offs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
