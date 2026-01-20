"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { runBudgetAllocation, simulateDebtStrategy, prioritizeGoals } from "@/features/analytics/analyticsSlice"
import { fetchConstraints } from "@/features/budget-constraints/budgetConstraintsSlice"
import { fetchGoals } from "@/features/goals/goalsSlice"
import { fetchDebts } from "@/features/debts/debtsSlice"

import { selectCurrentMonth } from "@/features/calendar/month/monthSlice"
import { fetchIncomeProfiles } from "@/features/income/incomeSlice"
import monthService from "@/services/api/services/month.service"



// Steps
import { MonthInputStep } from "@/features/month-dss/components/month-input-step"
import { DSSProblemWizard } from "@/features/month-dss/components/dss-problem-wizard"
import { MonthAnalyticsStep } from "@/features/month-dss/components/month-analytics-step"
import { MonthClosingStep } from "@/features/month-dss/components/month-closing-step"
import { FinalizeDSSButton } from "@/features/month-dss/components/finalize-dss-button"

export default function MonthDSSPage() {
  const dispatch = useAppDispatch()
  
  // Selectors
  const { constraints } = useAppSelector((state) => state.budgetConstraints)
  const { goals } = useAppSelector((state) => state.goals)
  const { debts } = useAppSelector((state) => state.debts)
  const incomeState = useAppSelector((state) => state.income)
  const currentMonth = useAppSelector(selectCurrentMonth)
  
  // Selectors
  const user = useAppSelector((state) => state.auth.authInfo)

  const [result, setResult] = useState<any>(null)

  // Wizard State
  type Step = 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<Step>(1)
  
  // Data State
  const [income, setIncome] = useState<number>(0)
  const [monthId, setMonthId] = useState<string | null>(null)
  const [monthStr, setMonthStr] = useState<string>('current')
  const [isMonthReady, setIsMonthReady] = useState(false)
  
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([])
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([])

  // Initial Fetch - Get/create month FIRST + fetch reference data
  useEffect(() => {
      const initialize = async () => {
        console.log('🚀 Initializing page...')
        
        try {
          // 1. Get or create current month (apiClient already unwraps .data)
          console.log('📅 GET /months/current...')
          const monthData = await monthService.getMonthView('current')
          console.log('📦 Month data:', monthData)
          
          if (monthData?.month_id) {
            setMonthId(monthData.month_id)
            setMonthStr(monthData.month)
            console.log('✅ Month ready:', monthData.month, monthData.month_id)
          } else {
            console.error('❌ Invalid response - no month_id')
          }
        } catch (error) {
          console.error('❌ Failed to get/create month:', error)
        } finally {
          // 2. Fetch reference data
          dispatch(fetchConstraints({}))
          dispatch(fetchGoals())
          dispatch(fetchDebts())
          dispatch(fetchIncomeProfiles())
          
          // 3. ALWAYS set ready
          console.log('🏁 Setting isMonthReady = true')
          setIsMonthReady(true)
        }
      }
      
      initialize()
  }, [dispatch])
  

  // Smart Income Default
  useEffect(() => {
      if (income === 0 && incomeState.items.length > 0) {
          const recurringTotal = incomeState.items
            .filter(item => item.is_active && item.is_recurring)
            .reduce((sum, item) => sum + Number(item.amount), 0)
          
          if (recurringTotal > 0) {
             setIncome(recurringTotal)
          }
      }
  }, [incomeState.items, income])


  // Sync Fixed Expenses based on selected constraints - Calculate total only
  const fixedExpenses = (constraints || [])
        .filter(c => selectedConstraintIds.includes(c.id))
        .reduce((sum, c) => sum + Number(c.minimum_amount || 0), 0)

  // Auto-select active constraints
  useEffect(() => {
      if (constraints.length > 0) {
           if (selectedConstraintIds.length === 0 && fixedExpenses === 0) {
               // @ts-ignore
              const active = constraints.filter(c => c.is_active).map(c => c.id)
              setSelectedConstraintIds(active)
           }
      }
  }, [constraints])


  // Local constraints state (captured from MonthInputStep)
  const [localConstraints, setLocalConstraints] = useState<any[]>([])

  // Capture constraints from Step 1
  useEffect(() => {
    if (constraints?.length > 0 && localConstraints.length === 0) {
      setLocalConstraints(constraints)
    }
  }, [constraints])

  const handleRunOptimization = async () => {
    if (income <= 0 || !user) return
    if (!monthId) {
      console.error('❌ Month not initialized yet')
      return
    }
    
    try {
        console.log('🚀 Running DSS analytics preview...')
        console.log('📊 User input:', {
          monthId,
          monthStr,
          income,
          constraints: selectedConstraintIds.length,
          goals: selectedGoalIds.length,
          debts: selectedDebtIds.length
        })
        
        // Use localConstraints if available, otherwise fallback to Redux state
        const activeConstraints = localConstraints.length > 0 ? localConstraints : constraints

        // 1. Prepare Budget Allocation Input (P1)
        const mandatoryExpenses = activeConstraints
            .filter(c => selectedConstraintIds.includes(c.id) && !c.is_flexible)
            .map(c => ({
                category_id: c.category_id,
                name: c.category_name || c.description || 'Unknown',
                amount: c.minimum_amount,
                priority: c.priority || 1
            }))

        const flexibleExpenses = activeConstraints
            .filter(c => selectedConstraintIds.includes(c.id) && c.is_flexible)
            .map(c => ({
                category_id: c.category_id,
                name: c.category_name || c.description || 'Unknown',
                min_amount: c.minimum_amount,
                max_amount: c.maximum_amount || c.minimum_amount * 1.5, // Default range if not set
                priority: c.priority || 2
            }))
            
        const debtInputs = debts
            .filter(d => selectedDebtIds.includes(d.id))
            .map(d => ({
                debt_id: d.id,
                name: d.name,
                balance: d.current_balance,
                interest_rate: d.interest_rate / 100, // Convert percentage to decimal
                minimum_payment: d.minimum_payment
            }))

        const goalInputs = goals
            .filter(g => selectedGoalIds.includes(g.id))
            .map(g => ({
                goal_id: g.id,
                name: g.name,
                type: (g as any).type || 'savings',
                priority: typeof g.priority === 'string' ? g.priority : 'medium',
                remaining_amount: (g.targetAmount || 0) - (g.currentAmount || 0),
                suggested_contribution: 0 // Let model decide
            }))

        // 2. Prepare Debt Strategy Input (P2)
        const debtInfos = debts
            .filter(d => selectedDebtIds.includes(d.id))
            .map(d => ({
                id: d.id,
                name: d.name,
                type: 'loan', // Default
                balance: d.current_balance,
                interest_rate: d.interest_rate / 100,
                minimum_payment: d.minimum_payment,
            }))

        // 3. Prepare Goal Prioritization Input (P3)
        const goalRatings = goals
            .filter(g => selectedGoalIds.includes(g.id))
            .map(g => ({
                goal_id: g.id,
                name: g.name,
                ratings: {
                    urgency: 5, // Defaults
                    importance: 5,
                    roi: 5,
                    effort: 5
                }
            }))

        // Use current date if month info is missing
        const currentYear = new Date().getFullYear();
        const currentMonthNum = new Date().getMonth() + 1;

        // Execute all analytics in parallel
        const [budgetRes, debtRes, goalRes] = await Promise.all([
            dispatch(runBudgetAllocation({
                user_id: user.id,
                year: currentYear,
                month: currentMonthNum,
                total_income: income,
                mandatory_expenses: mandatoryExpenses,
                flexible_expenses: flexibleExpenses,
                debts: debtInputs,
                goals: goalInputs,
                use_all_scenarios: true
            })).unwrap(),
            
            debtInfos.length > 0 ? dispatch(simulateDebtStrategy({
                user_id: user.id,
                debts: debtInfos,
                total_debt_budget: fixedExpenses * 0.2, // Estimate, allows user to adjust later
                preferred_strategy: "avalanche"
            })).unwrap() : Promise.resolve(null),

            goalRatings.length > 0 ? dispatch(prioritizeGoals({
                user_id: user.id,
                goals: goalRatings
            })).unwrap() : Promise.resolve(null)
        ])

        setResult({
            budget: budgetRes,
            debt: debtRes,
            goals: goalRes
        })
        
    } catch (err) {
        console.error("Optimization failed:", err)
        // Toast error here
    }
  }

  // Navigation handlers
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4) as any)
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1) as any)
  const goToStep = (step: 1 | 2 | 3 | 4) => setCurrentStep(step)
  
  const handleRecalculate = () => {
    // Reset result and go back to Step 1
    setResult(null)
    setCurrentStep(1)
  }
  
  const renderStep = () => {
      // ✅ CRITICAL: Ensure month is initialized before rendering any step
      if (!isMonthReady || !monthId) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 animate-in fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Initializing Month...</h3>
              <p className="text-sm text-muted-foreground">
                Setting up DSS Workflow for {monthStr || 'current month'}
              </p>
            </div>
          </div>
        )
      }

      switch(currentStep) {
          case 1:
              return (
                  <MonthInputStep 
                      income={income}
                      
                      constraints={constraints}
                      selectedConstraintIds={selectedConstraintIds}
                      setSelectedConstraintIds={setSelectedConstraintIds}
                      onConstraintsChanged={setLocalConstraints} // Capture changes
                      
                      goals={goals}
                      selectedGoalIds={selectedGoalIds}
                      setSelectedGoalIds={setSelectedGoalIds}
                      
                      debts={debts}
                      selectedDebtIds={selectedDebtIds}
                      setSelectedDebtIds={setSelectedDebtIds}
                      
                      onNext={() => {
                          if (!result && income > 0) handleRunOptimization()
                          nextStep()
                      }}
                  />
              )
          case 2:
               return (
                  <>
                    <DSSProblemWizard
                      goals={goals as any} // Goals are managed by Redux/Selections
                      debts={debts}
                      monthStr={monthStr} // Use initialized month
                      monthId={monthId}   // Use initialized month ID
                      totalDebtBudget={(debts || [])
                        .filter(d => selectedDebtIds.includes(d.id))
                        .reduce((sum, d) => sum + d.minimum_payment, 0)
                      }
                      monthlyIncome={income}
                      constraints={localConstraints.length > 0 ? localConstraints : constraints}
                      onComplete={() => {
                        // After completing DSS preview wizard, show finalize button
                        // User will click finalize before moving to analytics
                      }}
                    />
                    
                    {/* Finalize DSS Button - shows after all previews done */}
                    <div className="mt-8">
                      <FinalizeDSSButton
                        monthStr={monthStr}
                        monthId={monthId}
                        onComplete={nextStep}
                      />
                    </div>
                  </>
               )
          case 3:
              return (
                  <MonthAnalyticsStep 
                      onNext={nextStep}
                      onRecalculate={handleRecalculate}
                  />
              )
          case 4:
              return (
                  <MonthClosingStep 
                      onBack={prevStep}
                      onRestart={handleRecalculate}
                  />
              )
          default:
              return null
      }
  }

  return (
    <div className="w-full space-y-8 pb-10 p-6 flex flex-col min-h-[80vh]">
      
      <div className="flex w-full justify-center gap-4">
          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-7xl min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
              {renderStep()}
          </div>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 justify-center w-full mt-8" aria-label="Step navigation">
           {[1, 2, 3, 4].map(step => (
               <button
                  key={step}
                  type="button" 
                  aria-label={`Step ${step}${currentStep === step ? ' (current)' : ''}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${currentStep === step ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                  onClick={() => goToStep(step as Step)}
               />
           ))}
      </div>

    </div>
  )
}
