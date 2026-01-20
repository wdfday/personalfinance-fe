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
import { ArrowLeft, Clock, DollarSign, Tag, CheckCircle, AlertTriangle, XCircle, PauseCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from "next-themes"

interface ConstraintDetailPageProps {
    constraintId: string
}

export function ConstraintDetailPage({ constraintId }: ConstraintDetailPageProps) {
    const router = useRouter()
    const [constraint, setConstraint] = useState<BudgetConstraint | null>(null)
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
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

    // Load transactions for the category
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!constraint) return
            try {
                // In a real app, we might search by budget_id if available, or by date range + category
                // Here we fetch all for category and will filter client-side for the demo
                const res = await transactionsService.getAll({ 
                    category_id: constraint.category_id 
                })
                setTransactions(res.transactions)
            } catch (error) {
                console.error("Failed to fetch transactions", error)
            }
        }
        fetchTransactions()
    }, [constraint])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch constraint details
                const constraintData = await budgetConstraintsService.getById(constraintId)
                setConstraint(constraintData)

                if (constraintData.category_id) {
                    const budgetsData = await budgetsService.getAll({ category_id: constraintData.category_id })
                    // Sort by start_date descending (newest first)
                    const relatedBudgets = budgetsData.budgets
                        .filter(b => b.period === constraintData.period)
                        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                    setBudgets(relatedBudgets)
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

    const filteredTransactions = selectedBudget ? transactions.filter(t => {
        const txDate = new Date(t.date)
        const start = new Date(selectedBudget.start_date)
        const end = selectedBudget.end_date ? new Date(selectedBudget.end_date) : new Date()
        return txDate >= start && txDate <= end
    }) : []

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Budget Trends Chart */}
                <div className="lg:col-span-2">
                     <h2 className="text-xl font-bold mb-6">Budget Trends</h2>
                     {budgets.length > 0 ? (
                         <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={[...budgets].reverse().map(b => ({
                                        id: b.id,
                                        budget: b, // Pass full budget object
                                        name: new Date(b.start_date).toLocaleDateString('en-US', { month: 'short' }),
                                        fullDate: new Date(b.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                        spent: b.spent_amount,
                                        limit: b.amount
                                    }))}
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
                     )}
                </div>

                {/* Transactions List */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-6">Transactions</h2>
                    {selectedBudget ? (
                        <Card className="h-[400px] flex flex-col">
                            <CardHeader className="py-4 border-b bg-muted/20">
                                <CardTitle className="text-base font-medium flex justify-between items-center">
                                    <span>{selectedBudget.name}</span>
                                    <Badge variant={selectedBudget.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {selectedBudget.status}
                                    </Badge>
                                </CardTitle>
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
                                        <p>No transactions found for this period</p>
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
