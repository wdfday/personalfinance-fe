"use client"

import { Budget } from "@/services/api/types/budgets"
import { Transaction } from "@/services/api/types/transactions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, Calendar, Tag, AlertCircle } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

interface OtherItemsViewProps {
  budgets: Budget[]
  transactions: Transaction[]
  isLoading: boolean
  onBudgetClick?: (budget: Budget) => void
  selectedBudgetId?: string | null
  onTransactionClick?: (transaction: Transaction) => void
  selectedTransactionId?: string | null
}

export function OtherItemsView({ budgets, transactions, isLoading, onBudgetClick, selectedBudgetId, onTransactionClick, selectedTransactionId }: OtherItemsViewProps) {
  const { categories } = useAppSelector((state) => state.categories)
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {} as Record<string, string>)

  if (isLoading) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
    )
  }

  if (budgets.length === 0 && transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-background/50">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No unlinked items found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Budgets without constraints */}
      {budgets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budgets without Constraints ({budgets.length})
          </h3>
          <div className="space-y-2">
            {budgets.map(budget => (
              <Card 
                key={budget.id} 
                className={`hover:bg-muted/50 transition-colors ${onBudgetClick ? 'cursor-pointer' : ''} ${selectedBudgetId === budget.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => onBudgetClick?.(budget)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{budget.name}</h4>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize">
                          {budget.status}
                        </Badge>
                        {budget.category_id && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {categoryMap[budget.category_id] || `Category ${budget.category_id.slice(0, 8)}...`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Amount:</span>
                          <span>{formatCurrency(budget.amount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Spent:</span>
                          <span className={budget.spent_amount > budget.amount ? "text-red-600" : ""}>
                            {formatCurrency(budget.spent_amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(budget.start_date)}</span>
                          {budget.end_date && (
                            <>
                              <span> - </span>
                              <span>{formatDate(budget.end_date)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Transactions without links */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Transactions without Links ({transactions.length})
          </h3>
          <div className="space-y-2">
            {transactions.map(transaction => (
              <Card 
                key={transaction.id} 
                className={`hover:bg-muted/50 transition-colors ${onTransactionClick ? 'cursor-pointer' : ''} ${selectedTransactionId === transaction.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => onTransactionClick?.(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">
                          {transaction.description || "Unnamed Transaction"}
                        </h4>
                        <Badge 
                          variant={transaction.amount < 0 ? "destructive" : "default"}
                          className="text-[10px] h-5 px-1.5"
                        >
                          {transaction.amount < 0 ? "Expense" : "Income"}
                        </Badge>
                        {transaction.category_id && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {categoryMap[transaction.category_id] || `Category ${transaction.category_id.slice(0, 8)}...`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Amount:</span>
                          <span className={transaction.amount < 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.merchant && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">Merchant:</span>
                            <span>{transaction.merchant}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
