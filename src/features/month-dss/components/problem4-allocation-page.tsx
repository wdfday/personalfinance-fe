import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { previewBudgetAllocation, finalizeDSS } from "../dssWorkflowSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, CheckCircle2, PieChart, BarChart3, TrendingUp, AlertCircle, Settings, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { CategoryPickerPopover } from "@/components/categories/category-picker-popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Problem4Props {
  monthId: string
  monthStr: string
  monthlyIncome: number
  constraints: any[]
  goals?: any[]  // Goals for editing allocations
  debts?: any[]  // Debts for editing allocations
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
  goals = [],
  debts = [],
  goalAllocationPct,
  debtAllocationPct,
  onBack, 
  onComplete 
}: Problem4Props) {
  const dispatch = useAppDispatch()
  const { budgetAllocation, goalPrioritization, debtStrategy } = useAppSelector(state => state.dssWorkflow)
  const { categories } = useAppSelector((state) => state.categories)
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editableAllocations, setEditableAllocations] = useState<Record<string, number>>({})
  const [editableGoalFundings, setEditableGoalFundings] = useState<Record<string, number>>({}) // goalId -> amount
  const [editableDebtPayments, setEditableDebtPayments] = useState<Record<string, number>>({}) // debtId -> amount
  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({})
  const [newCategoryId, setNewCategoryId] = useState<string>("")
  const [newCategoryAmount, setNewCategoryAmount] = useState(0)
  
  // Custom scenario parameters state
  const [customParams, setCustomParams] = useState<Record<string, {
    goalContributionFactor: number
    flexibleSpendingLevel: number
    emergencyFundPercent: number
    goalsPercent: number
    flexiblePercent: number
  }>>({})

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const scenarioLabel: Record<string, string> = {
    safe: 'Safe',
    balanced: 'Balanced',
  }

  // Initialize default parameters
  useEffect(() => {
    if (Object.keys(customParams).length === 0) {
      setCustomParams({
        safe: {
          goalContributionFactor: 0.7,
          flexibleSpendingLevel: 0.0,
          emergencyFundPercent: 0.60,
          goalsPercent: 0.05,
          flexiblePercent: 0.05,
        },
        balanced: {
          goalContributionFactor: 1.0,
          flexibleSpendingLevel: 0.5,
          emergencyFundPercent: 0.40,
          goalsPercent: 0.20,
          flexiblePercent: 0.10,
        },
      })
    }
  }, [])

  // Trigger preview automatically on mount if not already done
  const handlePreview = () => {
    const scenarioOverrides = Object.entries(customParams).map(([scenarioType, params]) => ({
      scenario_type: scenarioType as 'safe' | 'balanced',
      goal_contribution_factor: params.goalContributionFactor,
      flexible_spending_level: params.flexibleSpendingLevel,
      emergency_fund_percent: params.emergencyFundPercent,
      goals_percent: params.goalsPercent,
      flexible_percent: params.flexiblePercent,
    }))

    dispatch(previewBudgetAllocation({
      monthStr,
      data: {
        month_id: monthId,
        goal_allocation_pct: goalAllocationPct,
        debt_allocation_pct: debtAllocationPct,
        scenario_overrides: scenarioOverrides,
      }
    }))
  }

  useEffect(() => {
    const shouldPreview = !budgetAllocation.preview
    if (shouldPreview && !budgetAllocation.loading) {
      handlePreview()
    }
  }, [dispatch, monthStr, monthId, monthlyIncome, constraints])

  // Mặc định chọn "balanced" khi preview load xong
  useEffect(() => {
    if (budgetAllocation.preview?.scenarios?.length && selectedScenario === null) {
      const preferred = budgetAllocation.preview.scenarios.find(s => s.scenario_type === 'balanced')
      setSelectedScenario(preferred?.scenario_type ?? budgetAllocation.preview.scenarios[0].scenario_type)
    }
  }, [budgetAllocation.preview, selectedScenario])

  // Copy allocations from selected scenario to editable state
  useEffect(() => {
    if (selectedScenario && budgetAllocation.preview) {
      const scenario = budgetAllocation.preview.scenarios.find(s => s.scenario_type === selectedScenario)
      if (scenario) {
        // Copy category allocations
        const allocations: Record<string, number> = {}
        scenario.category_allocations.forEach(cat => {
          allocations[cat.category_id] = cat.amount
        })
        setEditableAllocations(allocations)

        // Copy goal allocations
        const goalFundings: Record<string, number> = {}
        const goalAllocations = (scenario as any).goal_allocations || []
        goalAllocations.forEach((goal: any) => {
          goalFundings[goal.goal_id] = goal.amount
        })
        setEditableGoalFundings(goalFundings)

        // Copy debt allocations
        const debtPayments: Record<string, number> = {}
        const debtAllocations = (scenario as any).debt_allocations || []
        debtAllocations.forEach((debt: any) => {
          const debtId = debt.debt_id
          // Find original debt to check behavior
          const originalDebt = debts.find((d: any) => (d.id || d.debt_id) === debtId)
          const debtBehavior = originalDebt?.behavior || originalDebt?.behavior_type || 'revolving'
          const isFixed = debtBehavior === 'installment' || debtBehavior === 'interest_only'
          // For fixed debts, always use minimum payment
          debtPayments[debtId] = isFixed ? (originalDebt?.minimum_payment || debt.amount) : debt.amount
        })
        setEditableDebtPayments(debtPayments)
      }
    }
  }, [selectedScenario, budgetAllocation.preview])

  const handleApply = async () => {
    if (!selectedScenario || Object.keys(editableAllocations).length === 0) return

    // Calculate total allocations
    const totalCategories = Object.values(editableAllocations).reduce((sum, amt) => sum + amt, 0)
    const totalGoals = Object.values(editableGoalFundings).reduce((sum, amt) => sum + amt, 0)
    const totalDebts = Object.values(editableDebtPayments).reduce((sum, amt) => sum + amt, 0)
    const totalAllocated = totalCategories + totalGoals + totalDebts

    // Constraint: Total cannot exceed monthly income
    if (totalAllocated > monthlyIncome) {
      toast.error("Total allocations exceed monthly income", {
        description: `Total: ${formatCurrency(totalAllocated)} > Income: ${formatCurrency(monthlyIncome)}`
      })
      return
    }

    // Filter out new categories (they need to be created separately)
    // Only send allocations for existing categories (valid UUIDs)
    const validAllocations: Record<string, number> = {}
    Object.entries(editableAllocations).forEach(([categoryId, amount]) => {
      // Only include if it's a valid UUID (not a new-xxx temp ID)
      if (!categoryId.startsWith('new-') && amount > 0) {
        validAllocations[categoryId] = amount
      }
    })

    if (Object.keys(validAllocations).length === 0) {
      toast.error("Please add at least one valid category allocation")
      return
    }

    // Build goal fundings from editable state
    const goalFundings = goals.map((goal: any) => {
      const goalId = goal.id || goal.goal_id
      const amount = editableGoalFundings[goalId] || 0
      return {
        goal_id: goalId,
        suggested_amount: amount,
        user_adjusted_amount: amount > 0 ? amount : undefined,
      }
    }).filter(g => g.suggested_amount > 0)

    // Build debt payments from editable state
    const debtPayments = debts.map((debt: any) => {
      const debtId = debt.id || debt.debt_id
      const debtBehavior = debt.behavior || debt.behavior_type || 'revolving'
      const isFixed = debtBehavior === 'installment' || debtBehavior === 'interest_only'
      // For fixed debts, always use minimum payment
      const amount = isFixed ? (debt.minimum_payment || 0) : (editableDebtPayments[debtId] || debt.minimum_payment || 0)
      return {
        debt_id: debtId,
        minimum_payment: debt.minimum_payment || 0,
        suggested_payment: amount,
        user_adjusted_payment: isFixed ? undefined : (amount > (debt.minimum_payment || 0) ? amount : undefined),
      }
    }).filter(d => d.suggested_payment > 0)

    // Build goal priorities from Redux state or default
    const goalPriorities = goalPrioritization.preview?.ranking?.map((g, index) => ({
      goal_id: g.alternative_id,
      priority: g.priority || (1 - index * 0.1), // Default priority if not set
      method: 'ahp',
    })) || goals.map((goal: any, index: number) => ({
      goal_id: goal.id || goal.goal_id,
      priority: 1 - index * 0.1,
      method: 'manual',
    }))

    try {
      await dispatch(finalizeDSS({
        monthStr,
        data: {
          use_auto_scoring: false,
          goal_priorities: goalPriorities,
          debt_strategy: debtStrategy.selectedStrategy || undefined,
          tradeoff_choice: undefined,
          budget_allocations: validAllocations, // Category allocations from user
          goal_fundings: goalFundings, // Goal allocations from user
          debt_payments: debtPayments, // Debt allocations from user
          notes: `Finalized from ${scenarioLabel[selectedScenario]} scenario`,
        }
      })).unwrap()

      toast.success("✅ DSS Workflow Finalized!", {
        description: "All allocations saved. Budgets created and saved to database."
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error: any) {
      console.error('Failed to finalize DSS:', error)
      toast.error("❌ Failed to finalize DSS", {
        description: error || "Please try again"
      })
    }
  }

  const handleAllocationChange = (categoryId: string, amount: number) => {
    setEditableAllocations(prev => ({
      ...prev,
      [categoryId]: amount
    }))
  }

  const handleAddNewCategory = () => {
    if (!newCategoryId || newCategoryAmount <= 0) {
      toast.error("Vui lòng chọn danh mục và nhập số tiền")
      return
    }
    // Check if category already exists in allocations
    if (editableAllocations[newCategoryId]) {
      toast.error("Danh mục này đã được thêm vào")
      return
    }
    setEditableAllocations(prev => ({
      ...prev,
      [newCategoryId]: newCategoryAmount
    }))
    const selectedCategory = categories?.find(c => c.id === newCategoryId)
    if (selectedCategory) {
      setNewCategoryNames(prev => ({
        ...prev,
        [newCategoryId]: selectedCategory.name
      }))
    }
    setNewCategoryId("")
    setNewCategoryAmount(0)
    toast.success("Đã thêm danh mục")
  }

  const handleRemoveCategory = (categoryId: string) => {
    setEditableAllocations(prev => {
      const newAllocs = { ...prev }
      delete newAllocs[categoryId]
      return newAllocs
    })
    setNewCategoryNames(prev => {
      const newNames = { ...prev }
      delete newNames[categoryId]
      return newNames
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Final Budget Allocation</CardTitle>
              <CardDescription className="text-xs">
                Select scenario and adjust allocations
              </CardDescription>
            </div>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Scenarios
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Customize Scenario Parameters</DialogTitle>
                  <DialogDescription>
                    Adjust parameters for Safe and Balanced scenarios. Changes will be applied when you preview.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {(['safe', 'balanced'] as const).map((scenarioType) => {
                    const params = customParams[scenarioType] || {
                      goalContributionFactor: scenarioType === 'safe' ? 0.7 : 1.0,
                      flexibleSpendingLevel: scenarioType === 'safe' ? 0.0 : 0.5,
                      emergencyFundPercent: scenarioType === 'safe' ? 0.60 : 0.40,
                      goalsPercent: scenarioType === 'safe' ? 0.05 : 0.20,
                      flexiblePercent: scenarioType === 'safe' ? 0.05 : 0.10,
                    }
                    const label = scenarioLabel[scenarioType]

                    return (
                      <Card key={scenarioType}>
                        <CardHeader>
                          <CardTitle className="text-lg">{label} Scenario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Goal Contribution Factor: {(params.goalContributionFactor * 100).toFixed(0)}%</Label>
                            <Slider
                              value={[params.goalContributionFactor]}
                              onValueChange={([value]) => {
                                setCustomParams(prev => ({
                                  ...prev,
                                  [scenarioType]: { ...prev[scenarioType], goalContributionFactor: value }
                                }))
                              }}
                              min={0}
                              max={2}
                              step={0.1}
                            />
                            <p className="text-xs text-muted-foreground">
                              Multiplier for suggested goal contributions (0.0 = 0%, 1.0 = 100%, 2.0 = 200%)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Flexible Spending Level: {(params.flexibleSpendingLevel * 100).toFixed(0)}%</Label>
                            <Slider
                              value={[params.flexibleSpendingLevel]}
                              onValueChange={([value]) => {
                                setCustomParams(prev => ({
                                  ...prev,
                                  [scenarioType]: { ...prev[scenarioType], flexibleSpendingLevel: value }
                                }))
                              }}
                              min={0}
                              max={1}
                              step={0.1}
                            />
                            <p className="text-xs text-muted-foreground">
                              0% = minimum, 100% = maximum flexible spending
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Emergency Fund: {(params.emergencyFundPercent * 100).toFixed(0)}% of surplus</Label>
                            <Slider
                              value={[params.emergencyFundPercent]}
                              onValueChange={([value]) => {
                                setCustomParams(prev => ({
                                  ...prev,
                                  [scenarioType]: { ...prev[scenarioType], emergencyFundPercent: value }
                                }))
                              }}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Goals: {(params.goalsPercent * 100).toFixed(0)}% of surplus</Label>
                            <Slider
                              value={[params.goalsPercent]}
                              onValueChange={([value]) => {
                                setCustomParams(prev => ({
                                  ...prev,
                                  [scenarioType]: { ...prev[scenarioType], goalsPercent: value }
                                }))
                              }}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Flexible Spending: {(params.flexiblePercent * 100).toFixed(0)}% of surplus</Label>
                            <Slider
                              value={[params.flexiblePercent]}
                              onValueChange={([value]) => {
                                setCustomParams(prev => ({
                                  ...prev,
                                  [scenarioType]: { ...prev[scenarioType], flexiblePercent: value }
                                }))
                              }}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              Total: {((params.emergencyFundPercent + params.goalsPercent + params.flexiblePercent) * 100).toFixed(0)}% of surplus
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      handlePreview()
                      setShowSettings(false)
                      toast.success("Scenarios updated! Previewing with new parameters...")
                    }} className="flex-1">
                      Apply & Preview
                    </Button>
                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            <div className="space-y-4">
              {/* Scenario Selection Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Scenario</Label>
                <div className="flex gap-2">
                  {budgetAllocation.preview.scenarios
                    .filter(s => s.scenario_type === 'safe' || s.scenario_type === 'balanced')
                    .map((scenario) => (
                      <Button
                        key={scenario.scenario_type}
                        variant={selectedScenario === scenario.scenario_type ? "default" : "outline"}
                        onClick={() => setSelectedScenario(scenario.scenario_type)}
                        className="flex-1"
                      >
                        {scenarioLabel[scenario.scenario_type]}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Selected Scenario Summary Card */}
              {selectedScenario && (() => {
                const scenario = budgetAllocation.preview.scenarios.find(s => s.scenario_type === selectedScenario)
                if (!scenario) return null
                const { summary } = scenario
                const savingsRate = (summary.savings_rate || 0).toFixed(1)
                return (
                  <Card className="border-primary/20">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Allocation</p>
                          <p className="text-sm font-semibold">{formatCurrency(summary.total_allocated)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Savings</p>
                          <p className="text-sm font-semibold text-purple-600">{savingsRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Surplus</p>
                          <p className={`text-sm font-semibold ${(summary.surplus || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.surplus || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Editable Allocations Form - 2 Columns */}
              {selectedScenario && Object.keys(editableAllocations).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Column 1: Budget (Categories) */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Budget</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Categories</Label>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {Object.entries(editableAllocations)
                            .sort(([idA, _], [idB, __]) => {
                              const nameA = budgetAllocation.preview?.scenarios
                                .find(s => s.scenario_type === selectedScenario)
                                ?.category_allocations.find(c => c.category_id === idA)?.category_name 
                                || newCategoryNames[idA] || 'Unknown'
                              const nameB = budgetAllocation.preview?.scenarios
                                .find(s => s.scenario_type === selectedScenario)
                                ?.category_allocations.find(c => c.category_id === idB)?.category_name 
                                || newCategoryNames[idB] || 'Unknown'
                              return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' })
                            })
                            .map(([categoryId, amount]) => {
                            const category = budgetAllocation.preview?.scenarios
                              .find(s => s.scenario_type === selectedScenario)
                              ?.category_allocations.find(c => c.category_id === categoryId)
                            const categoryFromRedux = categories?.find(c => c.id === categoryId)
                            const categoryName = category?.category_name || newCategoryNames[categoryId] || categoryFromRedux?.name || 'Unknown'
                            const isNew = categoryId.startsWith('new-')

                            return (
                              <div key={categoryId} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <Label className="text-xs text-muted-foreground truncate block">{categoryName}</Label>
                                  <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => handleAllocationChange(categoryId, parseFloat(e.target.value) || 0)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                {isNew && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveCategory(categoryId)}
                                    className="text-destructive h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Add New Category */}
                      <div className="border-t pt-3 space-y-2">
                        <Label className="text-xs font-semibold">Add Category</Label>
                        <div className="flex gap-2">
                          <CategoryPickerPopover
                            categories={categories || []}
                            value={newCategoryId}
                            onChange={(categoryId) => {
                              setNewCategoryId(categoryId)
                              const selectedCategory = categories?.find(c => c.id === categoryId)
                              if (selectedCategory) {
                                setNewCategoryNames(prev => ({
                                  ...prev,
                                  [categoryId]: selectedCategory.name
                                }))
                              }
                            }}
                            placeholder="Chọn danh mục..."
                            className="flex-1 h-8 text-sm"
                            categoryType="expense"
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={newCategoryAmount || ''}
                            onChange={(e) => setNewCategoryAmount(parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-sm"
                          />
                          <Button onClick={handleAddNewCategory} size="sm" className="h-8">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Column 2: Goals & Debts */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Goals & Debts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Goal Allocations */}
                      {goals && goals.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Goals
                          </Label>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {[...goals]
                              .sort((a, b) => {
                                const nameA = (a.name || '').toLowerCase()
                                const nameB = (b.name || '').toLowerCase()
                                return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' })
                              })
                              .map((goal: any) => {
                              const goalId = goal.id || goal.goal_id
                              const amount = editableGoalFundings[goalId] || 0
                              return (
                                <div key={goalId} className="flex items-center gap-2">
                                  <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground truncate block">{goal.name}</Label>
                                    <Input
                                      type="number"
                                      value={amount}
                                      onChange={(e) => setEditableGoalFundings(prev => ({
                                        ...prev,
                                        [goalId]: parseFloat(e.target.value) || 0
                                      }))}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Debt Allocations */}
                      {debts && debts.length > 0 && (
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Debts
                          </Label>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {[...debts]
                              .sort((a, b) => {
                                const nameA = (a.name || '').toLowerCase()
                                const nameB = (b.name || '').toLowerCase()
                                return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' })
                              })
                              .map((debt: any) => {
                              const debtId = debt.id || debt.debt_id
                              const debtBehavior = debt.behavior || debt.behavior_type || 'revolving'
                              const isFixed = debtBehavior === 'installment' || debtBehavior === 'interest_only'
                              const amount = editableDebtPayments[debtId] || debt.minimum_payment || 0
                              return (
                                <div key={debtId} className="flex items-center gap-2">
                                  <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground truncate block">
                                      {debt.name}
                                      {isFixed && (
                                        <span className="ml-1 text-xs text-muted-foreground">(Fixed)</span>
                                      )}
                                    </Label>
                                    <Input
                                      type="number"
                                      value={amount}
                                      onChange={(e) => setEditableDebtPayments(prev => ({
                                        ...prev,
                                        [debtId]: parseFloat(e.target.value) || 0
                                      }))}
                                      disabled={isFixed}
                                      className="h-8 text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {isFixed ? (
                                        <span className="text-muted-foreground">Fixed payment: {formatCurrency(debt.minimum_payment || 0)}</span>
                                      ) : (
                                        <span>Min: {formatCurrency(debt.minimum_payment || 0)}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {(!goals || goals.length === 0) && (!debts || debts.length === 0) && (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          No goals or debts to allocate
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Total Summary with Constraint */}
              {selectedScenario && Object.keys(editableAllocations).length > 0 && (() => {
                const totalCategories = Object.values(editableAllocations).reduce((sum, amt) => sum + amt, 0)
                const totalGoals = Object.values(editableGoalFundings).reduce((sum, amt) => sum + amt, 0)
                const totalDebts = Object.values(editableDebtPayments).reduce((sum, amt) => sum + amt, 0)
                const totalAllocated = totalCategories + totalGoals + totalDebts
                const remaining = monthlyIncome - totalAllocated
                const exceedsLimit = totalAllocated > monthlyIncome
                
                return (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Total Allocated</span>
                          <span className={`text-base font-bold ${exceedsLimit ? 'text-red-600' : 'text-blue-600'}`}>
                            {formatCurrency(totalAllocated)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Monthly Income</span>
                          <span className="font-medium">{formatCurrency(monthlyIncome)}</span>
                        </div>
                        {exceedsLimit && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            ⚠️ Exceeds income by {formatCurrency(totalAllocated - monthlyIncome)}
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1">
                          <div>
                            <span>Categories</span>
                            <div className="font-medium">{formatCurrency(totalCategories)}</div>
                          </div>
                          {goals && goals.length > 0 && (
                            <div>
                              <span>Goals</span>
                              <div className="font-medium">{formatCurrency(totalGoals)}</div>
                            </div>
                          )}
                          {debts && debts.length > 0 && (
                            <div>
                              <span>Debts</span>
                              <div className="font-medium">{formatCurrency(totalDebts)}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-semibold">Remaining</span>
                          <span className={`text-sm font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(remaining)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <Button variant="outline" onClick={onBack} className="flex-1" disabled={budgetAllocation.loading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
              disabled={!selectedScenario || Object.keys(editableAllocations).length === 0 || budgetAllocation.loading}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
