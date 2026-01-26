"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchConstraints } from "@/features/budget-constraints/budgetConstraintsSlice"
import { fetchGoals } from "@/features/goals/goalsSlice"
import { fetchDebts } from "@/features/debts/debtsSlice"

import { selectCurrentMonth } from "@/features/calendar/month/monthSlice"
import { fetchIncomeProfiles } from "@/features/income/incomeSlice"
import monthService from "@/services/api/services/month.service"
import { dssWorkflowService } from "@/services/api/services/dss-workflow.service"
import { resetLocalDSSState } from "@/features/month-dss/dssWorkflowSlice"
import { toast } from "sonner"



// Steps
import { MonthInputStep } from "@/features/month-dss/components/month-input-step"
import { DSSProblemWizard } from "@/features/month-dss/components/dss-problem-wizard"
import { MonthAnalyticsStep } from "@/features/month-dss/components/month-analytics-step"
import { MonthClosingStep } from "@/features/month-dss/components/month-closing-step"
import { FinalizeDSSButton } from "@/features/month-dss/components/finalize-dss-button"

export default function MonthDSSPage() {
  const dispatch = useAppDispatch()
  
  // Selectors
  const { constraints: rawConstraints } = useAppSelector((state) => state.budgetConstraints)
  const { goals: rawGoals } = useAppSelector((state) => state.goals)
  const { debts: rawDebts } = useAppSelector((state) => state.debts)
  const incomeState = useAppSelector((state) => state.income)
  const currentMonth = useAppSelector(selectCurrentMonth)
  
  // Selectors
  const user = useAppSelector((state) => state.auth.authInfo)

  // Defensive defaults: data có thể undefined lúc initial load
  const constraints = rawConstraints || []
  const goals = rawGoals || []
  const debts = rawDebts || []

  const [result, setResult] = useState<any>(null)

  // Wizard State
  type Step = 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<Step>(1)
  
  // Data State
  const [income, setIncome] = useState<number>(0)
  const [monthId, setMonthId] = useState<string | null>(null)
  const [monthStr, setMonthStr] = useState<string>('current')
  const [isMonthReady, setIsMonthReady] = useState(false)
  const [monthStatus, setMonthStatus] = useState<string>('OPEN')
  
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([])
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([])

  // Tháng hiện tại theo lịch (YYYY-MM). Không dùng /months/current vì backend trả về tháng OPEN (vd 2025-12) thay vì tháng thật.
  const getCalendarCurrentMonthStr = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  // Initial Fetch - Get/create month FIRST + fetch reference data
  useEffect(() => {
      const initialize = async () => {
        console.log('🚀 Initializing page...')
        const calendarCurrent = getCalendarCurrentMonthStr()
        
        try {
          // 1. Lấy tháng hiện tại theo lịch (YYYY-MM), tự động tạo nếu chưa có
          console.log('📅 GET /months/' + calendarCurrent + '...')
          const monthData = await monthService.getMonthViewOrCreate(calendarCurrent)
          console.log('📦 Month data:', monthData)
          
          if (monthData?.month_id) {
            setMonthId(monthData.month_id)
            setMonthStr(monthData.month)
            setMonthStatus(monthData.status || 'OPEN')
            console.log('✅ Month ready:', monthData.month, monthData.month_id)
            console.log('📦 DSS Workflow data:', monthData.dss_workflow)
            console.log('📦 Categories:', monthData.categories?.length || 0)
            
            // 2. Determine initial step based on month data
            const isCurrentMonth = monthData.month === calendarCurrent
            
            // Check if DSS workflow exists:
            // - Có dss_workflow field và is_complete = true
            // - HOẶC có categories với assigned amounts (đã finalize DSS)
            const hasDSSWorkflow = (monthData.dss_workflow != null && monthData.dss_workflow.is_complete) ||
                                   (monthData.categories && monthData.categories.length > 0 && 
                                    monthData.categories.some((cat: any) => cat.assigned > 0))
            
            console.log('🔍 Step determination:', {
              isCurrentMonth,
              hasDSSWorkflow,
              hasDSSWorkflowField: monthData.dss_workflow != null,
              dss_workflow_complete: monthData.dss_workflow?.is_complete,
              categoriesCount: monthData.categories?.length || 0,
              budgeted: monthData.budgeted,
              hasAssignedCategories: monthData.categories?.some((cat: any) => cat.assigned > 0)
            })
            
            if (hasDSSWorkflow && isCurrentMonth) {
              // Có DSS workflow và là tháng hiện tại -> Step 3 (Analytics)
              console.log('📊 Month has DSS workflow (current month) -> Step 3')
              setCurrentStep(3)
            } else if (hasDSSWorkflow && !isCurrentMonth) {
              // Có DSS workflow nhưng là tháng trước -> Step 4 (Closing)
              console.log('📊 Month has DSS workflow (previous month) -> Step 4')
              setCurrentStep(4)
            } else {
              // Không có DSS workflow -> Step 1 (Input)
              console.log('📊 Month has no DSS workflow -> Step 1')
              setCurrentStep(1)
            }
          } else {
            console.error('❌ Invalid response - no month_id')
          }
        } catch (error) {
          console.error('❌ Failed to get/create month:', error)
        } finally {
          // 3. Fetch reference data
      dispatch(fetchConstraints({}))
      dispatch(fetchGoals())
      dispatch(fetchDebts())
      dispatch(fetchIncomeProfiles())
      
          // 4. ALWAYS set ready
          console.log('🏁 Setting isMonthReady = true')
          setIsMonthReady(true)
        }
      }
      
      initialize()
  }, [dispatch])
  

  // Helper function to convert income amount to monthly equivalent based on frequency
  const calculateMonthlyEquivalent = (amount: number, frequency: string): number => {
    switch (frequency?.toLowerCase()) {
      case "weekly":
        return amount * 52 / 12 // 52 weeks per year / 12 months
      case "bi-weekly":
      case "biweekly":
        return amount * 26 / 12 // 26 bi-weeks per year / 12 months
      case "monthly":
        return amount
      case "quarterly":
        return amount / 3
      case "yearly":
      case "annual":
        return amount / 12
      case "one-time":
        return 0 // One-time income doesn't contribute to recurring monthly
      default:
        // Default to monthly if frequency not recognized
        return amount
    }
  }

  // Smart Income Default - Calculate from ALL active income profiles (not just recurring)
  // Convert each to monthly equivalent based on frequency
  useEffect(() => {
      if (income === 0 && incomeState.items.length > 0) {
          const totalMonthlyIncome = incomeState.items
            .filter(item => item.is_active) // Include all active income profiles
            .reduce((sum, item) => {
              const monthlyEquivalent = calculateMonthlyEquivalent(
                Number(item.amount || 0), 
                item.frequency || "monthly"
              )
              return sum + monthlyEquivalent
            }, 0)
          
          if (totalMonthlyIncome > 0) {
             setIncome(totalMonthlyIncome)
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

  // Auto-select all debts by default (user có thể bỏ tick sau)
  useEffect(() => {
    if (debts.length > 0 && selectedDebtIds.length === 0) {
      setSelectedDebtIds(debts.map(d => d.id))
    }
  }, [debts])


  // Local constraints state (captured from MonthInputStep)
  const [localConstraints, setLocalConstraints] = useState<any[]>([])

  // Capture constraints from Step 1
  useEffect(() => {
    if (constraints?.length > 0 && localConstraints.length === 0) {
      setLocalConstraints(constraints)
    }
  }, [constraints])

  // State to track if DSS is initialized
  const [isDSSInitialized, setIsDSSInitialized] = useState(false)

  // Khởi tạo DSS workflow (Initialize API)
  const handleRunOptimization = async (): Promise<boolean> => {
    // Chỉ chặn nếu thiếu month, còn lại để BE validate
    if (!monthId || !monthStr) {
      console.error('❌ Month not initialized yet')
      toast.error('Chưa khởi tạo month')
      return false
    }

    // Nếu đã init rồi thì không gọi lại, cho qua luôn
    if (isDSSInitialized) {
      return true
    }
    
    try {
        console.log('🚀 Initializing DSS workflow...')

        // Reset toàn bộ DSS local state (autoScoring, step1-4) trước khi init session mới
        dispatch(resetLocalDSSState())
        
        // Use localConstraints if available, otherwise fallback to Redux state
        const activeConstraints = localConstraints.length > 0 ? localConstraints : constraints

        // Prepare goals for DSS
        const goalInputs = (goals || [])
            .filter(g => selectedGoalIds.includes(g.id))
            .map(g => ({
                id: g.id,
                name: g.name,
                target_amount: g.targetAmount || 0,
                current_amount: g.currentAmount || 0,
                target_date: g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : undefined,
                type: (g as any).type || 'savings',
                priority: typeof g.priority === 'string' ? g.priority : 'medium',
            }))

        // Prepare debts for DSS
        const debtInputs = (debts || [])
            .filter(d => selectedDebtIds.includes(d.id))
            .map(d => {
                const debtInput: {
                    id: string
                    name: string
                    current_balance: number
                    interest_rate: number
                    minimum_payment: number
                    behavior?: string
                } = {
                    id: d.id,
                    name: d.name,
                    current_balance: d.current_balance,
                    interest_rate: d.interest_rate,
                    minimum_payment: d.minimum_payment,
                }
                // Luôn gửi behavior field nếu có (backend sẽ default "installment" nếu không có)
                if (d.behavior) {
                    debtInput.behavior = d.behavior // "revolving", "installment", "interest_only"
                }
                return debtInput
            })
        
        console.log('📦 Debt inputs for DSS:', debtInputs.map(d => ({
            id: d.id,
            name: d.name,
            behavior: d.behavior || 'undefined (will default to installment)'
        })))

        // Prepare constraints for DSS
        const constraintInputs = (activeConstraints || [])
            .filter(c => selectedConstraintIds.includes(c.id))
            .map(c => ({
                id: c.id,
                name: c.category_name || c.description || 'Unknown',
                category_id: c.category_id,
                minimum_amount: c.minimum_amount || 0,
                maximum_amount: c.maximum_amount,
                is_flexible: c.is_flexible || false,
                priority: c.priority,
            }))

        // ✅ Validate: selected constraints must have category_id (UUID) to avoid BE crash
        const invalidConstraints = constraintInputs.filter((c) => !c.category_id)
        if (invalidConstraints.length > 0) {
          console.error('❌ Invalid constraints (missing category_id):', invalidConstraints)
          toast.error('Có khoản chi chưa chọn danh mục (category). Vui lòng sửa trước khi Run Analysis.')
          return false
        }

        console.log('📊 DSS Initialize Input:', {
          monthStr,
          income,
          goals: goalInputs.length,
          debts: debtInputs.length,
          constraints: constraintInputs.length
        })

        // Call Initialize DSS API
        const response = await dssWorkflowService.initializeDSS(monthStr, {
            monthly_income: income,
            goals: goalInputs,
                debts: debtInputs,
            constraints: constraintInputs,
        })

        console.log('✅ DSS Initialized:', response)
        toast.success(`DSS đã khởi tạo! ${response.goal_count} goals, ${response.debt_count} debts, ${response.constraint_count} constraints`)
        
        setIsDSSInitialized(true)
        setResult({ initialized: true, ...response })
        return true
    } catch (err: any) {
        console.error("DSS Initialize failed:", err)
        toast.error(err?.response?.data?.message || 'Khởi tạo DSS thất bại')
        return false
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

      // Goals / debts đã chọn cho DSS
      const selectedGoals = (goals || []).filter(g => selectedGoalIds.includes(g.id))

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
                      
                      onNext={async () => {
                          const ok = await handleRunOptimization()
                          if (ok) {
                          nextStep()
                          }
                      }}
                  />
              )
          case 2:
               return (
                  <DSSProblemWizard
                    goals={selectedGoals as any} // chỉ truyền goals đã chọn
                    debts={debts}
                    monthStr={monthStr} // Use initialized month
                    monthId={monthId}   // Use initialized month ID
                    totalDebtBudget={(debts || [])
                      .filter(d => selectedDebtIds.includes(d.id))
                      .reduce((sum, d) => sum + d.minimum_payment, 0)
                    }
                    monthlyIncome={income}
                    constraints={localConstraints.length > 0 ? localConstraints : constraints}
                    onComplete={nextStep}
                  />
               )
          case 3:
              return (
                  <MonthAnalyticsStep 
                      monthId={monthId!}
                      monthStr={monthStr}
                      onNext={nextStep}
                      onRecalculate={handleRecalculate}
                  />
              )
          case 4:
              return (
                  <MonthClosingStep 
                      monthId={monthId!}
                      monthStr={monthStr}
                      onBack={prevStep}
                      onRestart={handleRecalculate}
                      isClosed={monthStatus === 'CLOSED'}
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
      <div className="flex gap-2 justify-center w-full mt-8 print:hidden" aria-label="Step navigation">
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
