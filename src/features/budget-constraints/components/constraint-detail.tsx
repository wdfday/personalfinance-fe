"use client"

import { useState, useEffect } from "react"
import { BudgetConstraint } from "@/services/api/types/budget-constraints"
import { Budget, BudgetPeriod } from "@/services/api/types/budgets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Edit, ArrowLeft, XCircle, DollarSign, Tag, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { BudgetMonthLineChart } from "./budget-month-line-chart"
import { ConstraintChart } from "./constraint-chart"
import { ConstraintTrendChart } from "./constraint-trend-chart"
import { budgetsService } from "@/services/api/services/budgets.service"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { formatDateForAPI } from "@/lib/utils"

function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}

interface ConstraintDetailProps {
  constraint: BudgetConstraint
  onClose: () => void
  onEdit: (constraint: BudgetConstraint) => void
  onEnd?: (id: string) => void
}

export function ConstraintDetail({ constraint, onClose, onEdit, onEnd }: ConstraintDetailProps) {
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector((state) => state.categories)
  const categoryName = categories.find(c => c.id === constraint.category_id)?.name || 'Unknown Category'
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null)
  const [loadingBudget, setLoadingBudget] = useState(false)

  useEffect(() => {
    const fetchActiveBudget = async () => {
      setLoadingBudget(true)
      try {
        let budgets: Budget[] = []
        
        // Fetch by constraint_id (API đã có sẵn)
        if (constraint.id) {
          try {
            const response = await budgetsService.getByConstraintId(constraint.id)
            budgets = response.budgets || []
          } catch (e) {
            console.warn("Failed to fetch budgets by constraint_id, falling back to category", e)
          }
        }
        
        // Fallback: fetch by category_id and period (không lọc status để có cả ended)
        if (budgets.length === 0 && constraint.category_id) {
          const response = await budgetsService.getAll({
            category_id: constraint.category_id,
            period: constraint.period as BudgetPeriod
          })
          budgets = (response.budgets || []).filter(b => b.period === constraint.period)
        }
        
        budgets.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        // Ưu tiên tháng này; chưa có thì hiển thị cái trước + trạng thái ended
        const thisMonthBudget = budgets.find(b => isCurrentMonth(b.start_date))
        if (thisMonthBudget) {
          setActiveBudget(thisMonthBudget)
        } else if (budgets.length > 0) {
          setActiveBudget(budgets[0])
        } else {
          setActiveBudget(null)
        }
      } catch (error) {
        console.error('Failed to fetch active budget:', error)
      } finally {
        setLoadingBudget(false)
      }
    }

    fetchActiveBudget()
  }, [constraint.id, constraint.category_id, constraint.period])

  // Fetch transactions khi có activeBudget
  useEffect(() => {
    if (activeBudget) {
      // Đảm bảo format YYYY-MM-DD (không có time) cho API
      const startDate = formatDateForAPI(activeBudget.start_date)
      const endDate = activeBudget.end_date 
        ? formatDateForAPI(activeBudget.end_date)
        : formatDateForAPI(new Date()) // Nếu không có end_date, dùng ngày hiện tại
      
      dispatch(fetchTransactions({ 
        direction: "DEBIT",
        start_date: startDate,
        end_date: endDate,
        pageSize: 100
      }))
    }
  }, [activeBudget, dispatch])

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
              <CardTitle className="text-2xl">{constraint.description || categoryName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                 <Badge variant={constraint.status === 'active' ? "default" : "secondary"}>
                    {constraint.status}
                 </Badge>
                 {constraint.is_flexible && (
                     <Badge variant="outline">Flexible</Badge>
                 )}
                 {!constraint.is_flexible && (
                     <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Fixed</Badge>
                 )}
                 <span className="text-muted-foreground text-sm ml-2">
                     Updated: {new Date(constraint.updated_at).toLocaleDateString()}
                 </span>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
                 <Button variant="outline" size="icon" onClick={() => onEdit(constraint)}>
                    <Edit className="h-4 w-4" />
                </Button>
                {onEnd && constraint.status === 'active' && (
                    <Button variant="outline" size="icon" onClick={() => onEnd(constraint.id)} title="Mark as ended">
                        <XCircle className="h-4 w-4" />
                    </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
            {constraint.is_flexible ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Minimum
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {formatCurrency(constraint.minimum_amount)}
                        </div>
                    </div>
                    {constraint.maximum_amount && constraint.maximum_amount > 0 ? (
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Maximum
                            </div>
                            <div className="text-xl font-bold">
                                {formatCurrency(constraint.maximum_amount)}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                Range: {formatCurrency(constraint.maximum_amount - constraint.minimum_amount)}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Maximum</div>
                            <div className="text-lg font-semibold text-muted-foreground">Unlimited</div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Amount
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {formatCurrency(constraint.minimum_amount)}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Budget Card */}
            {(() => {
              const isFallback = activeBudget != null && !isCurrentMonth(activeBudget.start_date)
              const displayStatus = isFallback ? 'ended' : (activeBudget?.status ?? null)
              return (
                <Card className={
                  !activeBudget ? "border-l-4 border-l-gray-300" :
                  displayStatus === 'ended' ? "border-l-4 border-l-blue-500" :
                  "border-l-4 border-l-green-500"
                }>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${
                          activeBudget && !isFallback ? 'text-green-600' :
                          isFallback ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        {isFallback ? 'Budget' : 'Active Budget'}
                        {activeBudget && (
                          <Badge
                            variant={displayStatus === 'ended' ? 'secondary' : displayStatus === 'exceeded' ? 'destructive' : 'default'}
                            className="capitalize"
                          >
                            {displayStatus}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    {isFallback && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Chưa có budget tháng này; đang hiển thị tháng trước.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeBudget ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Budget Amount</span>
                          <span className="font-semibold text-lg">{formatCurrency(activeBudget.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Spent</span>
                          <span className="font-medium">{formatCurrency(activeBudget.spent_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Remaining</span>
                          <span className={`font-medium ${
                            activeBudget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(activeBudget.remaining_amount)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{activeBudget.percentage_spent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
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
                        {!isFallback && activeBudget.status === 'warning' && (
                          <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            <span>Approaching budget limit</span>
                          </div>
                        )}
                        {!isFallback && activeBudget.status === 'exceeded' && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            <span>Budget exceeded</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <div className="text-xl font-bold mb-1">NO</div>
                        <div className="text-xs">No active budget</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })()}


            {/* Simplified Constraint Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{categoryName}</span>
              </div>
              <Badge variant="outline" className="text-xs">P{constraint.priority}</Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="capitalize">{constraint.period}</span>
              </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Constraint Trend Chart - trong khoảng thời gian của budget */}
      <ConstraintTrendChart 
        budgetId={activeBudget?.id || null}
        budgetStartDate={activeBudget?.start_date}
        budgetEndDate={activeBudget?.end_date}
      />
            
      {/* Constraint Chart - Spending vs Constraint (by version) */}
      <ConstraintChart constraintId={constraint.id} />
    </div>
  )
}
