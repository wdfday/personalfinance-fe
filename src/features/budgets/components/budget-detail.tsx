"use client"

import { useEffect, useState } from 'react'
import { Budget } from '@/services/api/types/budgets'
import { BudgetConstraint } from '@/services/api/types/budget-constraints'
import { Transaction } from '@/services/api/types/transactions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Calendar, DollarSign, Wallet, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { budgetsService } from "@/services/api/services/budgets.service"
import { budgetConstraintsService } from "@/services/api/services/budget-constraints.service"
import { transactionsService } from "@/services/api/services/transactions.service"
import { useAppSelector } from '@/lib/hooks'

interface BudgetDetailProps {
  budget: Budget
  onClose: () => void
}

export function BudgetDetail({ budget: initialBudget, onClose }: BudgetDetailProps) {
  const [budget, setBudget] = useState<Budget>(initialBudget)
  const [constraint, setConstraint] = useState<BudgetConstraint | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const { categories } = useAppSelector((state) => state.categories)
  const categoryName = budget.category_id ? categories.find(c => c.id === budget.category_id)?.name : undefined

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch latest budget data
        const budgetData = await budgetsService.getById(budget.id)
        setBudget(budgetData)

        // Fetch parent constraint: use constraint_id if available, otherwise match by category_id
        if (budgetData.constraint_id) {
          try {
            const constraint = await budgetConstraintsService.getById(budgetData.constraint_id)
            setConstraint(constraint)
          } catch (e) {
            console.warn("Could not find constraint by ID", e)
            // Fallback to category_id matching
            if (budgetData.category_id) {
              try {
                const constraints = await budgetConstraintsService.getAll()
                const parentConstraint = constraints.budget_constraints.find((c: BudgetConstraint) => c.category_id === budgetData.category_id)
                setConstraint(parentConstraint || null)
              } catch (e2) {
                console.warn("Could not find parent constraint by category", e2)
              }
            }
          }
        } else if (budgetData.category_id) {
          try {
            const constraints = await budgetConstraintsService.getAll()
            const parentConstraint = constraints.budget_constraints.find((c: BudgetConstraint) => c.category_id === budgetData.category_id)
            setConstraint(parentConstraint || null)
          } catch (e) {
            console.warn("Could not find parent constraint", e)
          }
        }

        // Fetch transactions linked to this budget (transaction_link type BUDGET)
        const transactionsData = await transactionsService.getAll({ limit: 500 })
        const linked = (transactionsData.transactions ?? []).filter(
          (tx) => tx.links?.some((l) => l.type === 'BUDGET' && l.id === budgetData.id) ?? false
        )
        linked.sort((a, b) => {
          const dA = new Date(a.booking_date ?? a.date).getTime()
          const dB = new Date(b.booking_date ?? b.date).getTime()
          return dB - dA
        })
        setTransactions(linked)
      } catch (error) {
        console.error('Failed to fetch budget details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [budget.id])

  const percentage = Math.min((budget.spent_amount / budget.amount) * 100, 100)
  const isExceeded = budget.spent_amount > budget.amount
  const isWarning = !isExceeded && percentage > 80
  const remaining = budget.amount - budget.spent_amount

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-2 mb-4 md:hidden">
          <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
      </div>

      <Card className="border-l-4 border-l-primary/50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{budget.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                 <Badge variant={
                    budget.status === 'active' ? "default" : 
                    budget.status === 'exceeded' ? "destructive" :
                    budget.status === 'ended' ? "secondary" : "secondary"
                 }>
                    {budget.status}
                 </Badge>
                 {categoryName && (
                     <Badge variant="outline">{categoryName}</Badge>
                 )}
                 <span className="text-muted-foreground text-sm ml-2">
                     Updated: {new Date(budget.updated_at).toLocaleDateString()}
                 </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
            {/* Amount Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Budget
                    </div>
                    <div className="text-xl font-bold text-primary">
                        {formatCurrency(budget.amount)}
                    </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Spent</div>
                    <div className={`text-xl font-bold ${isExceeded ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-foreground'}`}>
                        {formatCurrency(budget.spent_amount)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {percentage.toFixed(1)}% used
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-medium ${isExceeded ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-foreground'}`}>
                        {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.amount)}
                    </span>
                </div>
                <Progress 
                    value={percentage} 
                    className={`h-3 ${isExceeded ? '[&>div]:bg-red-600' : isWarning ? '[&>div]:bg-orange-600' : ''}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: {formatCurrency(Math.max(0, remaining))}</span>
                    {isExceeded && (
                        <span className="text-red-600 font-medium">
                            Exceeded by {formatCurrency(Math.abs(remaining))}
                        </span>
                    )}
                </div>
            </div>

            {/* Period & Dates */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Period Details
                </h3>
                <div className="border rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Period</span>
                        <span className="font-medium capitalize">{budget.period}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(budget.start_date)}
                        </span>
                    </div>
                    {budget.end_date && (
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">End Date</span>
                            <span className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(budget.end_date)}
                            </span>
                        </div>
                    )}
                    {budget.description && (
                        <div className="py-2">
                            <span className="text-muted-foreground block mb-1">Description</span>
                            <p className="bg-muted p-3 rounded text-muted-foreground">
                                {budget.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Parent Constraint */}
            {constraint && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> Related Constraint
                    </h3>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{constraint.description || categoryName || 'Constraint'}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {constraint.is_flexible ? (
                                            <>
                                                Min: {formatCurrency(constraint.minimum_amount)} - 
                                                Max: {formatCurrency(constraint.maximum_amount || 0)}
                                            </>
                                        ) : (
                                            <>Fixed: {formatCurrency(constraint.minimum_amount)}</>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline">P{constraint.priority}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Transactions List */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Transactions ({transactions.length})
                </h3>
                {transactions.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>No transactions linked to this budget.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {transactions.map((tx) => (
                            <Card key={tx.id} className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                    tx.amount < 0 
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                                        : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                                }`}>
                                                    {tx.amount < 0 ? (
                                                        <TrendingUp className="h-4 w-4 rotate-180" />
                                                    ) : (
                                                        <TrendingUp className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">
                                                        {tx.description || "Unnamed Transaction"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(tx.date)}</span>
                                                        {tx.merchant && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{tx.merchant}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-semibold text-base ml-4 ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
