"use client"

import { useEffect, useState, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { executeBudgetAllocation, selectScenario, clearResult } from "@/features/analytics/budgetAllocationSlice"
import { fetchConstraints } from "@/features/budget-constraints/budgetConstraintsSlice"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { fetchGoals } from "@/features/goals/goalsSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calculator,
    Loader2,
    TrendingUp,
    Wallet,
    Target,
    CreditCard,
    PiggyBank,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    BarChart3
} from "lucide-react"
import { BudgetAllocationRequest, AllocationScenario } from "@/services/api/budget-allocation.service"
// Note: goalPrioritization temporarily disabled - AHPOutput types need sync with backend
// import { prioritizeGoalsAuto, AHPOutput, GoalForRating } from "@/services/api/goalPrioritization.service"

// Temporary type definitions until proper sync
type AHPOutput = {
    scores?: Record<string, number>
    rankings?: string[]
    ranking?: Array<{ alternative_id: string; rank: number; priority: number; alternative_name: string }>
    alternative_priorities?: Record<string, number>
    criteria_weights?: Record<string, number>
    consistency_ratio: number
    is_consistent: boolean
}

type GoalForRating = {
    id: string
    name: string
    target_amount: number
    current_amount: number
    target_date: string
    type: 'emergency' | 'savings' | 'investment' | 'purchase' | 'retirement' | 'education' | 'travel' | 'other'
    priority: 'critical' | 'high' | 'medium' | 'low'
}

type Step = 'input' | 'ahp' | 'result'

export default function BudgetAllocationPage() {
    const dispatch = useAppDispatch()
    const { result, selectedScenario, isLoading, error } = useAppSelector((state) => state.budgetAllocation)
    const { constraints } = useAppSelector((state) => state.budgetConstraints)
    const { categories } = useAppSelector((state) => state.categories)
    const { goals } = useAppSelector((state) => state.goals)

    const [totalIncome, setTotalIncome] = useState<string>("30000000")
    const [step, setStep] = useState<Step>('input')
    const [ahpResult, setAhpResult] = useState<AHPOutput | null>(null)
    const [ahpLoading, setAhpLoading] = useState(false)
    const [ahpError, setAhpError] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchConstraints())
        dispatch(fetchCategories())
        dispatch(fetchGoals())
    }, [dispatch])

    // Build category name map
    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name
            return acc
        }, {} as Record<string, string>)
    }, [categories])

    // Convert goals to AHP format
    const goalsForAHP: GoalForRating[] = useMemo(() => {
        return goals.map(g => ({
            id: g.id,
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            target_date: g.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            type: (g.type as GoalForRating['type']) || 'savings',
            priority: g.priority as GoalForRating['priority'],
        }))
    }, [goals])

    // Deduplicate constraints for calculation
    const uniqueConstraints = useMemo(() => {
        const seen = new Set()
        return constraints.filter(c => {
            const key = c.category_id // simple key
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    }, [constraints])

    // Calculate satisfaction levels for each goal
    const goalSatisfactionLevels = useMemo(() => {
        const incomeAmount = parseFloat(totalIncome) || 30000000

        // Calculate mandatory expenses from constraints
        const totalMandatory = uniqueConstraints
            .filter(c => !c.is_flexible)
            .reduce((sum, c) => sum + c.minimum_amount, 0)
        const totalFlexibleMin = uniqueConstraints
            .filter(c => c.is_flexible)
            .reduce((sum, c) => sum + c.minimum_amount, 0)

        const availableForGoals = Math.max(0, incomeAmount - totalMandatory - totalFlexibleMin) * 0.7

        // Get AHP weights
        const totalAhpWeight = goals.reduce((sum, g) => {
            return sum + (ahpResult?.alternative_priorities?.[g.id] || (1 / Math.max(1, goals.length)))
        }, 0)

        return goals.map(g => {
            const ahpWeight = ahpResult?.alternative_priorities?.[g.id] || (1 / Math.max(1, goals.length))
            const remainingAmount = g.remainingAmount || (g.targetAmount - g.currentAmount)

            // Calculate deadline
            const targetDate = g.targetDate ? new Date(g.targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            const monthsLeft = Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))

            // Required monthly to meet deadline
            const requiredMonthly = Math.ceil(remainingAmount / monthsLeft)

            // Proportional allocation based on AHP
            const proportionalAllocation = availableForGoals * (ahpWeight / Math.max(0.01, totalAhpWeight))

            // Satisfaction levels
            const satisfactionLevels = {
                deadline: {
                    amount: requiredMonthly,
                    percent: Math.min(100, (requiredMonthly / remainingAmount) * 100),
                    canMeet: proportionalAllocation >= requiredMonthly,
                },
                proportional: {
                    amount: proportionalAllocation,
                    percent: Math.min(100, (proportionalAllocation / remainingAmount) * 100),
                },
                minimum: {
                    amount: 100000,
                    percent: Math.min(100, (100000 / remainingAmount) * 100),
                },
            }

            return {
                goalId: g.id,
                goalName: g.name,
                remainingAmount,
                monthsLeft,
                ahpWeight: ahpWeight * 100, // as percentage
                satisfactionLevels,
                isAhpCalculated: !!ahpResult,
            }
        })
    }, [goals, uniqueConstraints, totalIncome, ahpResult])

    // Run AHP prioritization
    const handleRunAHP = async () => {
        if (goals.length < 2) {
            setAhpError("Cần ít nhất 2 mục tiêu để chạy AHP")
            return
        }

        setAhpLoading(true)
        setAhpError(null)
        try {
            const result = await prioritizeGoalsAuto({
                user_id: '00000000-0000-0000-0000-000000000001',
                monthly_income: parseFloat(totalIncome) || 30000000,
                goals: goalsForAHP,
            })
            setAhpResult(result)
            setStep('ahp')
        } catch (err) {
            setAhpError(err instanceof Error ? err.message : 'Lỗi khi chạy AHP')
        } finally {
            setAhpLoading(false)
        }
    }

    // Convert constraints to allocation input format using AHP weights
    const buildAllocationRequest = (): BudgetAllocationRequest => {
        const mandatoryExpenses = constraints
            .filter(c => !c.is_flexible)
            .map(c => ({
                category_id: c.category_id,
                name: categoryMap[c.category_id] || `Category ${c.category_id.slice(0, 8)}`,
                amount: c.minimum_amount,
                priority: c.priority,
            }))

        const flexibleExpenses = constraints
            .filter(c => c.is_flexible)
            .map(c => ({
                category_id: c.category_id,
                name: categoryMap[c.category_id] || `Category ${c.category_id.slice(0, 8)}`,
                min_amount: c.minimum_amount,
                max_amount: c.maximum_amount || c.minimum_amount * 1.5,
                priority: c.priority,
            }))
        // Calculate total mandatory expenses
        const totalMandatory = mandatoryExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalFlexibleMin = flexibleExpenses.reduce((sum, e) => sum + e.min_amount, 0)

        // Estimate available for goals (income - mandatory - min flexible)
        const incomeAmount = parseFloat(totalIncome) || 30000000
        const availableForGoals = Math.max(0, incomeAmount - totalMandatory - totalFlexibleMin) * 0.7 // 70% for goals

        // Convert goals with AHP priorities - distribute proportionally
        const totalAhpWeight = goals.reduce((sum, g) => {
            return sum + (ahpResult?.alternative_priorities?.[g.id] || (1 / goals.length))
        }, 0)

        const goalInputs = goals.map(g => {
            const ahpPriority = ahpResult?.alternative_priorities?.[g.id] || (1 / goals.length)
            const ranking = ahpResult?.ranking?.find(r => r.alternative_id === g.id)
            const remainingAmount = g.remainingAmount || (g.targetAmount - g.currentAmount)

            // Calculate months until deadline
            const targetDate = g.targetDate ? new Date(g.targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            const monthsLeft = Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))

            // Minimum monthly contribution to meet deadline
            const minMonthlyForDeadline = Math.ceil(remainingAmount / monthsLeft)

            // Proportional share based on AHP weight
            const proportionalShare = Math.ceil(availableForGoals * (ahpPriority / totalAhpWeight))

            // Use the higher of: proportional share or minimum needed for deadline (but capped at remaining)
            const suggestedContribution = Math.min(
                Math.max(proportionalShare, minMonthlyForDeadline * 0.5), // At least 50% of what's needed
                remainingAmount
            )

            return {
                goal_id: g.id,
                name: g.name,
                type: g.type || 'savings',
                priority: getPriorityFromRank(ranking?.rank || 999, goals.length),
                remaining_amount: remainingAmount,
                suggested_contribution: Math.max(suggestedContribution, 100000), // Minimum 100k per goal
            }
        })

        // Skip debts for now (per user request)
        const debtInputs: { debt_id: string; name: string; balance: number; interest_rate: number; minimum_payment: number }[] = []

        return {
            user_id: '00000000-0000-0000-0000-000000000001',
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            total_income: parseFloat(totalIncome) || 0,
            use_all_scenarios: true,
            mandatory_expenses: mandatoryExpenses,
            flexible_expenses: flexibleExpenses,
            debts: debtInputs,
            goals: goalInputs,
        }
    }

    // Helper to convert AHP rank to priority level
    const getPriorityFromRank = (rank: number, total: number): 'critical' | 'high' | 'medium' | 'low' => {
        const percentile = rank / total
        if (percentile <= 0.25) return 'critical'
        if (percentile <= 0.5) return 'high'
        if (percentile <= 0.75) return 'medium'
        return 'low'
    }

    const handleExecute = async () => {
        const request = buildAllocationRequest()
        await dispatch(executeBudgetAllocation(request))
        setStep('result')
    }

    const handleReset = () => {
        dispatch(clearResult())
        setAhpResult(null)
        setStep('input')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' ₫'
    }

    const getScenarioColor = (type: string) => {
        switch (type) {
            case 'safe': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'balanced': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Input Step
    if (step === 'input') {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-primary" />
                        Phân bổ ngân sách thông minh
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sử dụng thuật toán Goal Programming để phân bổ ngân sách tối ưu dựa trên ràng buộc của bạn
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Income Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Thu nhập hàng tháng
                            </CardTitle>
                            <CardDescription>Nhập tổng thu nhập của bạn trong tháng này</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="income">Thu nhập (VND)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    value={totalIncome}
                                    onChange={(e) => setTotalIncome(e.target.value)}
                                    placeholder="30000000"
                                    className="text-lg"
                                />
                                <p className="text-sm text-muted-foreground">
                                    = {formatCurrency(parseFloat(totalIncome) || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Constraints Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Ràng buộc ngân sách
                            </CardTitle>
                            <CardDescription>
                                {constraints.length} ràng buộc được sử dụng từ cài đặt của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {constraints.length === 0 ? (
                                <p className="text-muted-foreground">
                                    Chưa có ràng buộc. Vui lòng thêm ràng buộc trong trang Budgets.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {constraints.slice(0, 5).map((c) => (
                                        <div key={c.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span>{categoryMap[c.category_id] || `Category ${c.category_id.slice(0, 8)}`}</span>
                                                <Badge variant={c.is_flexible ? "secondary" : "default"} className="text-xs">
                                                    {c.is_flexible ? "Linh hoạt" : "Cố định"}
                                                </Badge>
                                            </div>
                                            <span className="text-muted-foreground">
                                                {formatCurrency(c.minimum_amount)}
                                                {c.maximum_amount && c.is_flexible && ` - ${formatCurrency(c.maximum_amount)}`}
                                            </span>
                                        </div>
                                    ))}
                                    {constraints.length > 5 && (
                                        <p className="text-sm text-muted-foreground">
                                            +{constraints.length - 5} ràng buộc khác
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Goals Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PiggyBank className="h-5 w-5" />
                                Mục tiêu tài chính
                            </CardTitle>
                            <CardDescription>
                                {goals.length} mục tiêu sẽ được ưu tiên hóa bằng thuật toán AHP
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {goals.length === 0 ? (
                                <p className="text-muted-foreground">
                                    Chưa có mục tiêu. Vui lòng thêm mục tiêu trong trang Goals.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {goals.slice(0, 5).map((g, index) => {
                                        const sat = goalSatisfactionLevels[index]
                                        const isFeasible = sat.satisfactionLevels.deadline.canMeet
                                        const shortfall = sat.satisfactionLevels.deadline.amount - sat.satisfactionLevels.proportional.amount

                                        return (
                                            <div key={g.id} className="flex flex-col gap-2 py-3 border-b last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{g.name}</span>
                                                        <Badge variant={g.priority === 'critical' || g.priority === 'high' ? 'default' : 'secondary'} className="text-xs capitalize">
                                                            {g.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        {sat.isAhpCalculated ? (
                                                            <p className="font-semibold text-primary">
                                                                {formatCurrency(sat.satisfactionLevels.proportional.amount)}
                                                                <span className="text-xs font-normal text-muted-foreground"> / tháng (dự kiến)</span>
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">
                                                                Chưa phân bổ
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Mục tiêu còn lại</p>
                                                        <p>{formatCurrency(sat.remainingAmount)} ({sat.monthsLeft} tháng)</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-muted-foreground text-xs">Cần thiết/tháng</p>
                                                        <p>{formatCurrency(sat.satisfactionLevels.deadline.amount)}</p>
                                                    </div>
                                                </div>

                                                {/* Feasibility Indicator */}
                                                {sat.isAhpCalculated && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {isFeasible ? (
                                                            <span className="text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-1 rounded">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Đủ khả năng hoàn thành đúng hạn
                                                            </span>
                                                        ) : (
                                                            <span className="text-orange-600 flex items-center gap-1 font-medium bg-orange-50 px-2 py-1 rounded">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Thiếu hụt {formatCurrency(shortfall)}/tháng
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-muted-foreground">
                                                            AHP Weight: {sat.ahpWeight.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {goals.length > 5 && (
                                        <p className="text-sm text-muted-foreground text-center">
                                            +{goals.length - 5} mục tiêu khác
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AHP Button */}
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleRunAHP}
                        disabled={ahpLoading || !totalIncome || goals.length < 2}
                    >
                        {ahpLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang phân tích AHP...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Bước 1: Ưu tiên hóa mục tiêu (AHP)
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    {goals.length < 2 && goals.length > 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                            Cần ít nhất 2 mục tiêu để chạy thuật toán AHP
                        </p>
                    )}

                    {(error || ahpError) && (
                        <Card className="border-red-500">
                            <CardContent className="pt-4">
                                <p className="text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    {error || ahpError}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        )
    }

    // Step 2: AHP Results
    if (step === 'ahp' && ahpResult) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Kết quả ưu tiên hóa AHP
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Thuật toán AHP đã xếp hạng ưu tiên các mục tiêu của bạn
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Consistency Check */}
                    <Card className={ahpResult.is_consistent ? "border-green-500" : "border-yellow-500"}>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                {ahpResult.is_consistent ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {ahpResult.is_consistent ? "Kết quả nhất quán" : "Cần xem lại"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Consistency Ratio: {(ahpResult.consistency_ratio * 100).toFixed(2)}%
                                        {ahpResult.is_consistent ? " (< 10%)" : " (> 10%)"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ranking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Thứ tự ưu tiên mục tiêu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {ahpResult.ranking.map((item, index) => (
                                    <div key={item.alternative_id} className="flex items-center gap-4 py-2 border-b last:border-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                                            }`}>
                                            {item.rank}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.alternative_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Progress value={item.priority * 100} className="h-2 flex-1" />
                                                <span className="text-sm text-muted-foreground w-16">
                                                    {(item.priority * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Criteria Weights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trọng số tiêu chí</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(ahpResult.criteria_weights).map(([key, value]) => (
                                    <div key={key} className="text-center p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                                        <p className="text-2xl font-bold">{(value * 100).toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </Button>
                        <Button onClick={handleExecute} disabled={isLoading} className="flex-1">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang tính toán...
                                </>
                            ) : (
                                <>
                                    <Calculator className="mr-2 h-5 w-5" />
                                    Bước 2: Phân bổ ngân sách
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Result Step
    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        Kết quả phân bổ ngân sách
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Kỳ: {result?.period} | Thu nhập: {formatCurrency(result?.total_income || 0)}
                    </p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                    Tính toán lại
                </Button>
            </div>

            {result && (
                <div className="grid gap-6">
                    {/* Feasibility Status */}
                    <Card className={result.is_feasible ? "border-green-500" : "border-red-500"}>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                {result.is_feasible ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {result.is_feasible ? "Phân bổ khả thi" : "Phân bổ không khả thi"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Thời gian tính toán: {result.metadata.computation_time_ms}ms
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scenario Tabs */}
                    {result.scenarios.length > 1 ? (
                        <Tabs
                            defaultValue={selectedScenario?.scenario_type || "balanced"}
                            onValueChange={(v) => dispatch(selectScenario(v as 'safe' | 'balanced'))}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                {result.scenarios.map((s) => (
                                    <TabsTrigger key={s.scenario_type} value={s.scenario_type} className="capitalize">
                                        {s.scenario_type === 'safe' && 'Safe'}
                                        {s.scenario_type === 'balanced' && 'Balanced'}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {result.scenarios.map((scenario) => (
                                <TabsContent key={scenario.scenario_type} value={scenario.scenario_type}>
                                    <ScenarioDetails scenario={scenario} formatCurrency={formatCurrency} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : selectedScenario && (
                        <ScenarioDetails scenario={selectedScenario} formatCurrency={formatCurrency} />
                    )}
                </div>
            )}
        </div>
    )
}

// Scenario Details Component
function ScenarioDetails({
    scenario,
    formatCurrency
}: {
    scenario: AllocationScenario
    formatCurrency: (amount: number) => string
}) {
    const { summary, category_allocations, goal_allocations, debt_allocations, feasibility_score } = scenario

    return (
        <div className="grid gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Thu nhập</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Đã phân bổ</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_allocated)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Thặng dư</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.surplus)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Tỷ lệ tiết kiệm</p>
                        <p className="text-2xl font-bold text-emerald-600">{summary.savings_rate.toFixed(1)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Feasibility Score */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Điểm khả thi</span>
                        <span className="font-bold">{feasibility_score}%</span>
                    </div>
                    <Progress value={feasibility_score} className="h-3" />
                </CardContent>
            </Card>

            {/* Category Allocations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Chi tiêu theo danh mục
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {category_allocations.map((cat) => {
                            const percentage = (cat.amount / summary.total_income) * 100
                            return (
                                <div key={cat.category_id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{cat.category_name}</span>
                                            <Badge variant={cat.is_flexible ? "secondary" : "default"} className="text-xs">
                                                {cat.is_flexible ? "Linh hoạt" : "Cố định"}
                                            </Badge>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(cat.amount)}</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {percentage.toFixed(1)}% thu nhập
                                        {cat.is_flexible && ` | Range: ${formatCurrency(cat.minimum)} - ${formatCurrency(cat.maximum)}`}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Goal Allocations */}
            {goal_allocations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Đóng góp mục tiêu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {goal_allocations.map((goal) => (
                                <div key={goal.goal_id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{goal.goal_name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{goal.priority}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(goal.amount)}</p>
                                        <div className="flex items-center justify-end gap-1">
                                            <span className={`text-xs font-medium ${goal.percentage_of_target >= 120 ? "text-purple-600" :
                                                    goal.percentage_of_target >= 100 ? "text-green-600" :
                                                        goal.percentage_of_target >= 80 ? "text-emerald-600" :
                                                            goal.percentage_of_target >= 40 ? "text-yellow-600" :
                                                                "text-gray-400"
                                                }`}>
                                                {goal.percentage_of_target >= 120 ? "Xuất sắc" :
                                                    goal.percentage_of_target >= 100 ? "Đạt mục tiêu" :
                                                        goal.percentage_of_target >= 80 ? "Tốt" :
                                                            goal.percentage_of_target >= 40 ? "Tối thiểu" :
                                                                "Tạm hoãn"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">({goal.percentage_of_target}%)</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Debt Allocations */}
            {debt_allocations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Thanh toán nợ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {debt_allocations.map((debt) => (
                                <div key={debt.debt_id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{debt.debt_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Lãi suất: {(debt.interest_rate * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(debt.amount)}</p>
                                        <p className="text-sm text-emerald-600">
                                            +{formatCurrency(debt.extra_payment)} extra
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Warnings */}
            {scenario.warnings.length > 0 && (
                <Card className="border-yellow-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                            Cảnh báo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {scenario.warnings.map((warning, i) => (
                                <li key={i} className="text-sm">{warning.message}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
