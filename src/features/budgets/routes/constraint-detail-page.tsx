"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { transactionsService } from "@/services/api/services/transactions.service"
import { budgetConstraintsService } from "@/services/api/services/budget-constraints.service"
import { budgetsService } from "@/services/api/services/budgets.service"
import { BudgetConstraint } from '@/services/api/types/budget-constraints'
import { Budget } from '@/services/api/types/budgets'
import { useAppSelector } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, DollarSign, Tag, CheckCircle, AlertTriangle, XCircle, PauseCircle, TrendingUp, Wallet, ChevronsRight, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from "next-themes"

interface ConstraintDetailPageProps {
    constraintId: string
}

function isCurrentMonth(dateStr: string): boolean {
    const d = new Date(dateStr)
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}

export function ConstraintDetailPage({ constraintId }: ConstraintDetailPageProps) {
    const router = useRouter()
    const [constraint, setConstraint] = useState<BudgetConstraint | null>(null)
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
    const [activeBudget, setActiveBudget] = useState<Budget | null>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const { theme } = useTheme()

    // Get categories from Redux
    const { categories } = useAppSelector((state) => state.categories)
    const categoryName = categories.find(c => c.id === constraint?.category_id)?.name || ''

    // Set initial selected budget to the latest one when budgets are loaded
    useEffect(() => {
        if (budgets.length > 0 && !selectedBudget) {
            setSelectedBudget(budgets[0])
        }
    }, [budgets, selectedBudget])

    // Load transactions (filtered by transaction_link to selected budget)
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await transactionsService.getAll({ limit: 500 })
                setTransactions(res.transactions ?? [])
            } catch (error) {
                console.error("Failed to fetch transactions", error)
            }
        }
        fetchTransactions()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch constraint details
                const constraintData = await budgetConstraintsService.getById(constraintId)
                setConstraint(constraintData)

                // Fetch budgets: try constraint_id first, then fallback to category_id
                let relatedBudgets: Budget[] = []
                if (constraintData.id) {
                    try {
                        const budgetsData = await budgetsService.getByConstraintId(constraintData.id)
                        relatedBudgets = budgetsData?.budgets || []
                    } catch (e) {
                        console.warn("Failed to fetch budgets by constraint_id, falling back to category", e)
                    }
                }
                
                // Fallback: fetch by category_id if no results (không lọc status để có cả ended)
                if (relatedBudgets.length === 0 && constraintData.category_id) {
                    const budgetsData = await budgetsService.getAll({ 
                        category_id: constraintData.category_id,
                        period: constraintData.period as any
                    })
                    relatedBudgets = (budgetsData?.budgets || [])
                        .filter(b => b.period === constraintData.period)
                }
                
                // Sort by start_date descending (newest first)
                relatedBudgets.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                setBudgets(relatedBudgets)
                
                // Active budget: ưu tiên tháng này; chưa có thì hiển thị cái trước + trạng thái ended
                const thisMonthBudget = relatedBudgets.find(b => isCurrentMonth(b.start_date))
                if (thisMonthBudget) {
                    setActiveBudget(thisMonthBudget)
                } else if (relatedBudgets.length > 0) {
                    setActiveBudget(relatedBudgets[0])
                } else {
                    setActiveBudget(null)
                }
            } catch (error) {
                console.error('Failed to fetch constraint details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (constraintId) {
            fetchData()
        }
    }, [constraintId])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'exceeded': return <XCircle className="h-5 w-5 text-red-500" />
            case 'paused': return <PauseCircle className="h-5 w-5 text-gray-500" />
            case 'expired': return <Clock className="h-5 w-5 text-slate-500" />
            default: return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
            case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            case 'exceeded': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
            case 'paused': return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
            case 'expired': return 'border-slate-300 bg-slate-50 dark:bg-slate-900/20'
            default: return 'border-gray-300'
        }
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Card className="border-none shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardContent className="p-3">
                        <p className="font-semibold mb-1">{data.fullDate}</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Spent:</span>
                                <span className="font-medium text-blue-500">{formatCurrency(data.spent)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Limit:</span>
                                <span>{formatCurrency(data.limit)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic text-center">
                            Click to view transactions
                        </p>
                    </CardContent>
                </Card>
            )
        }
        return null
    }

    const isActiveBudgetFallback = activeBudget != null && !isCurrentMonth(activeBudget.start_date)
    const activeDisplayStatus = isActiveBudgetFallback ? 'ended' : (activeBudget?.status ?? null)

    const filteredTransactions = selectedBudget
        ? (() => {
              const linked = transactions.filter(
                  (t) => t.links?.some((l) => l.type === 'BUDGET' && l.id === selectedBudget.id) ?? false
              )
              linked.sort((a, b) => {
                  const dA = new Date(a.booking_date ?? a.date).getTime()
                  const dB = new Date(b.booking_date ?? b.date).getTime()
                  return dB - dA
              })
              return linked
          })()
        : []

    if (loading) {
        return <div className="p-8 flex justify-center">Loading...</div>
    }

    if (!constraint) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Constraint not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            {/* Header */}
            <div>
                <Button variant="ghost" className="mb-4 pl-0 gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" /> Back to Budgets
                </Button>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                         <h1 className="text-3xl font-bold tracking-tight">
                            {categoryName || constraint.category_name || 'Budget Constraint'}
                        </h1>
                         <Badge
                            variant={constraint.is_flexible ? "secondary" : "default"}
                            className={!constraint.is_flexible ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                        >
                            {constraint.is_flexible ? 'Flexible' : 'Fixed'}
                        </Badge>
                    </div>

                    {/* Configuration Line */}
                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-y py-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Min: <span className="font-medium text-foreground">{formatCurrency(constraint.minimum_amount)}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Max: <span className="font-medium text-foreground">{constraint.maximum_amount ? formatCurrency(constraint.maximum_amount) : 'Unlimited'}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Period: <span className="font-medium text-foreground capitalize">{constraint.period}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>Priority: <span className="font-medium text-foreground">P{constraint.priority}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Budget Card */}
            <Card className={
                !activeBudget ? "border-l-4 border-l-gray-300" :
                activeDisplayStatus === 'ended' ? "border-l-4 border-l-blue-500" :
                "border-l-4 border-l-green-500"
            }>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className={`h-5 w-5 ${
                                activeBudget && !isActiveBudgetFallback ? 'text-green-600' : 
                                isActiveBudgetFallback ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            Active Budget
                            {activeBudget && (
                                <Badge
                                    variant={
                                        activeDisplayStatus === 'ended' ? 'secondary' :
                                        activeDisplayStatus === 'exceeded' ? 'destructive' :
                                        'default'
                                    }
                                    className="capitalize"
                                >
                                    {activeDisplayStatus}
                                </Badge>
                            )}
                        </CardTitle>
                    </div>
                    {isActiveBudgetFallback && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Chưa có budget tháng này; đang hiển thị tháng trước.
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    {activeBudget ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Budget Amount</div>
                                    <div className="font-semibold text-lg">{formatCurrency(activeBudget.amount)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Spent</div>
                                    <div className="font-medium">{formatCurrency(activeBudget.spent_amount)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Remaining</div>
                                    <div className={`font-medium ${
                                        activeBudget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {formatCurrency(activeBudget.remaining_amount)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Progress</div>
                                    <div className="font-medium">{activeBudget.percentage_spent.toFixed(1)}%</div>
                                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                                        <div 
                                            className={`h-2 rounded-full transition-all ${
                                                activeBudget.percentage_spent >= 100 ? 'bg-red-500' :
                                                activeBudget.percentage_spent >= 80 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(activeBudget.percentage_spent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {!isActiveBudgetFallback && activeBudget.status === 'warning' && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Approaching budget limit</span>
                                </div>
                            )}
                            {!isActiveBudgetFallback && activeBudget.status === 'exceeded' && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Budget exceeded</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <div className="text-2xl font-bold mb-2">NO</div>
                            <div className="text-sm">No active budget found for this constraint</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* All Budgets List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Budgets thuộc Constraint này ({budgets.length})
                        </CardTitle>
                        {budgets.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBudget(budgets[0])}
                                    disabled={selectedBudget?.id === budgets[0]?.id}
                                    title="Chọn budget mới nhất (cuối cùng)"
                                    className="gap-1"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                    Cuối cùng
                                </Button>
                                {budgets.length >= 2 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedBudget(budgets[1])}
                                        disabled={selectedBudget?.id === budgets[1]?.id}
                                        title="Chọn budget áp chót (cuối tiếp theo)"
                                        className="gap-1"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                        Cuối tiếp theo
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {budgets.length > 0 ? (
                        <div className="space-y-3">
                            {budgets.map((budget) => (
                                <Card 
                                    key={budget.id} 
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedBudget?.id === budget.id ? 'ring-2 ring-primary' : ''
                                    } ${
                                        budget.status === 'active' ? 'border-l-4 border-l-green-500' :
                                        budget.status === 'exceeded' ? 'border-l-4 border-l-red-500' :
                                        budget.status === 'warning' ? 'border-l-4 border-l-yellow-500' :
                                        budget.status === 'ended' ? 'border-l-4 border-l-blue-500' :
                                        'border-l-4 border-l-gray-300'
                                    }`}
                                    onClick={() => setSelectedBudget(budget)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{budget.name}</h3>
                                                    <Badge 
                                                        variant={
                                                            budget.status === 'active' ? 'default' : 
                                                            budget.status === 'exceeded' ? 'destructive' :
                                                            budget.status === 'warning' ? 'secondary' :
                                                            budget.status === 'ended' ? 'secondary' : 'outline'
                                                        }
                                                        className="capitalize text-xs"
                                                    >
                                                        {budget.status}
                                                    </Badge>
                                                    {budget.id === activeBudget?.id && (
                                                        <Badge className="bg-green-600 text-white text-xs">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(budget.start_date)} - {budget.end_date ? formatDate(budget.end_date) : 'Ongoing'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Amount</div>
                                                <div className="font-semibold">{formatCurrency(budget.amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Spent</div>
                                                <div className="font-medium">{formatCurrency(budget.spent_amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                                                <div className={`font-medium ${
                                                    budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {formatCurrency(budget.remaining_amount)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Progress</div>
                                                <div className="font-medium">{budget.percentage_spent.toFixed(1)}%</div>
                                                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                                    <div 
                                                        className={`h-1.5 rounded-full transition-all ${
                                                            budget.percentage_spent >= 100 ? 'bg-red-500' :
                                                            budget.percentage_spent >= 80 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(budget.percentage_spent, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Chưa có budget nào thuộc constraint này</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Budget Trends Chart */}
                <div className="lg:col-span-2">
                     <h2 className="text-xl font-bold mb-6">Budget Trends</h2>
                     {(() => {
                         const chartData = budgets.length > 0 ? [...budgets].reverse().map(b => ({
                                        id: b.id,
                                        budget: b,
                                        name: new Date(b.start_date).toLocaleDateString('en-US', { month: 'short' }),
                                        fullDate: new Date(b.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                        spent: b.spent_amount,
                                        limit: b.amount
                                    })) : []
                         console.log('[Budget Trends] budgets.length=', budgets.length, 'chartData.length=', chartData.length, 'chartData[0]=', chartData[0])
                         return budgets.length > 0 ? (
                         <div className="w-full mt-4" style={{ minHeight: 350 }}>
                            <ResponsiveContainer width={640} height={350} minWidth={0}>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis 
                                        dataKey="name" 
                                        stroke={theme === "dark" ? "#888888" : "#333333"}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke={theme === "dark" ? "#888888" : "#333333"}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="spent" 
                                        stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ 
                                            r: 6, 
                                            fill: theme === "dark" ? "#adfa1d" : "#0ea5e9",
                                            stroke: '#fff', 
                                            strokeWidth: 2, 
                                            cursor: 'pointer',
                                            onClick: (_, event) => {
                                                // @ts-ignore - Recharts types are a bit loose here
                                                if (event && event.payload) {
                                                    setSelectedBudget(event.payload.budget)
                                                }
                                            }
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                         </div>
                     ) : (
                         <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                             No trend data available
                         </div>
                     )
                     })()}
                </div>

                {/* Transactions List */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-6">Transactions</h2>
                    {selectedBudget ? (
                        <Card className="h-[400px] flex flex-col">
                            <CardHeader className="py-4 border-b bg-muted/20">
                                <div className="flex flex-col gap-2">
                                    <CardTitle className="text-base font-medium flex justify-between items-center">
                                        <span>{selectedBudget.name}</span>
                                        <Badge variant={selectedBudget.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                            {selectedBudget.status}
                                        </Badge>
                                    </CardTitle>
                                    {budgets.length >= 1 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-muted-foreground">Gọi lại:</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => setSelectedBudget(budgets[0])}
                                                disabled={selectedBudget?.id === budgets[0]?.id}
                                                title="Chọn budget mới nhất (cuối cùng)"
                                            >
                                                <ChevronsRight className="h-3 w-3" />
                                                Cuối cùng
                                            </Button>
                                            {budgets.length >= 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1"
                                                    onClick={() => setSelectedBudget(budgets[1])}
                                                    disabled={selectedBudget?.id === budgets[1]?.id}
                                                    title="Chọn budget áp chót (cuối tiếp theo)"
                                                >
                                                    <ChevronRight className="h-3 w-3" />
                                                    Cuối tiếp theo
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto">
                                {filteredTransactions.length > 0 ? (
                                    <div className="divide-y">
                                        {filteredTransactions.map((tx) => (
                                            <div key={tx.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium line-clamp-1">{tx.description}</span>
                                                    <span className={cn("font-bold whitespace-nowrap", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                                                        {formatCurrency(tx.amount)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                    <span>{formatDate(tx.date)}</span>
                                                    <span className="capitalize">{tx.merchant || tx.sub_type}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                                        <Tag className="h-8 w-8 mb-2 opacity-20" />
                                        <p>No transactions linked to this budget.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="text-center py-12 border rounded-lg bg-muted/5 border-dashed">
                             <p className="text-muted-foreground">Select a point on the chart to view details</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    )
}
