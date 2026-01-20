"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { budgetsService } from "@/services/api/services/budgets.service"
import { budgetConstraintsService } from "@/services/api/services/budget-constraints.service"
import { transactionsService } from "@/services/api/services/transactions.service"
import { Budget } from '@/services/api/types/budgets'
import { BudgetConstraint } from '@/services/api/types/budget-constraints'
import { Transaction } from '@/services/api/types/transactions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowUpRight, Calendar, DollarSign, Wallet, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface BudgetDetailPageProps {
    budgetId: string
}

export function BudgetDetailPage({ budgetId }: BudgetDetailPageProps) {
    const router = useRouter()
    const [budget, setBudget] = useState<Budget | null>(null)
    const [constraint, setConstraint] = useState<BudgetConstraint | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch budget details
                const budgetData = await budgetsService.getById(budgetId)
                setBudget(budgetData)

                // Fetch parent constraint by matching category_id
                try {
                    const constraints = await budgetConstraintsService.getAll()
                    const parentConstraint = constraints.items.find((c: BudgetConstraint) => c.category_id === budgetData.category_id)
                    setConstraint(parentConstraint || null)
                } catch (e) {
                    console.warn("Could not find parent constraint", e)
                }

                // Fetch transactions for this budget period and category
                const transactionsData = await transactionsService.getAll({
                    category_id: budgetData.category_id,
                    start_date: budgetData.start_date,
                    end_date: budgetData.end_date,
                    limit: 50
                })
                setTransactions(transactionsData.transactions)

            } catch (error) {
                console.error('Failed to fetch budget details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (budgetId) {
            fetchData()
        }
    }, [budgetId])

    if (loading) {
        return <div className="p-8 flex justify-center">Loading...</div>
    }

    if (!budget) {
        return (
             <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Budget not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const percentage = Math.min((budget.spent_amount / budget.amount) * 100, 100)
    const isExceeded = budget.spent_amount > budget.amount
    const isWarning = !isExceeded && percentage > 80

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
             {/* Header */}
             <div>
                <Button variant="ghost" className="mb-4 pl-0 gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h1 className="text-3xl font-bold tracking-tight">
                                {budget.name}
                            </h1>
                             <Badge variant={budget.status === 'active' ? 'default' : 'outline'} className="capitalize">
                                {budget.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(budget.start_date)} - {formatDate(budget.end_date)}</span>
                        </div>
                    </div>
                     <div className="flex gap-2">
                        {/* Link back to Constraint - Assuming we can navigate to constraints list or specific constraint if we knew ID */}
                         {/* Since we don't have constraint_id in budget, we might need to navigate to constraints page or guess ID */}
                         {/* For this MVP, let's link to the constraints page generally if we don't have ID, or try to link using category_id if my valid assumption holds */}
                        <Button variant="outline" onClick={() => router.push(`/budgets/constraints/${budget.category_id}`)}>
                            View Constraint Settings
                        </Button>
                        <Button>
                            Edit Budget
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Budget Status Card */}
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Budget Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Spent: {formatCurrency(budget.spent_amount)}</span>
                                <span>Limit: {formatCurrency(budget.amount)}</span>
                            </div>
                            <Progress 
                                value={percentage} 
                                className={`h-3 ${isExceeded ? 'bg-red-100' : ''}`}
                                indicatorClassName={isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}
                            />
                             <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{percentage.toFixed(1)}% Used</span>
                                <span>{formatCurrency(Math.max(0, budget.amount - budget.spent_amount))} Remaining</span>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4 pt-4">
                             <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center">
                                <span className="text-muted-foreground text-sm mb-1">Average Daily Spend</span>
                                <span className="text-xl font-bold">
                                    {/* Naive calc */}
                                    {formatCurrency(budget.spent_amount / 30)} 
                                </span>
                             </div>
                              <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center">
                                <span className="text-muted-foreground text-sm mb-1">Status</span>
                                <div className={`flex items-center gap-2 font-bold ${isExceeded ? 'text-red-500' : 'text-green-500'}`}>
                                    {isExceeded ? (
                                        <>
                                            <AlertTriangle className="h-5 w-5" /> Exceeded
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5" /> On Track
                                        </>
                                    )}
                                </div>
                             </div>
                         </div>
                    </CardContent>
                </Card>

                 {/* Details Side Card */}
                  <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex justify-between items-center py-2 border-b">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                <span>Funding Source</span>
                            </div>
                             {/* Mock source */}
                            <span>Bank Account</span>
                        </div>
                         <div className="flex justify-between items-center py-2 border-b">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>Rollover</span>
                            </div>
                            <span>Disabled</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Related Transactions</h2>
                <Card>
                    <CardContent className="p-0">
                         {transactions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No transactions found for this budget period.
                            </div>
                         ) : (
                            <div className="divide-y">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                                            </div>
                                        </div>
                                         <div className="font-bold text-red-600">
                                            {formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
