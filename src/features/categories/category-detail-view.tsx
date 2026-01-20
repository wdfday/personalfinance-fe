"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/contexts/i18n-context"
import { type Category } from "@/services/api"
import { transactionsService, budgetsService } from '@/services/api'
import { 
  type Transaction, 
  type Budget, 
  type TransactionListResponse 
} from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { format } from "date-fns"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Wallet
} from "lucide-react"

interface CategoryDetailViewProps {
  category: Category
}

export function CategoryDetailView({ category }: CategoryDetailViewProps) {
  const { t } = useTranslation("categories")
  
  // Local state for fetched data
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoadingFn, setIsLoadingFn] = useState({
    transactions: false,
    budgets: false
  })

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount)
  }

  // Fetch data when category changes
  useEffect(() => {
    // Reset state when category changes
    setTransactions([])
    setBudgets([])
    
    const fetchTransactions = async () => {
      setIsLoadingFn(prev => ({ ...prev, transactions: true }))
      try {
        const response = await transactionsService.getTransactions({
          categoryId: category.id,
          pageSize: 10, // Limit to recent 10
          page: 1
        })
        setTransactions(response.transactions || [])
      } catch (error) {
        console.error("Failed to fetch transactions for category:", error)
      } finally {
        setIsLoadingFn(prev => ({ ...prev, transactions: false }))
      }
    }

    const fetchBudgets = async () => {
      setIsLoadingFn(prev => ({ ...prev, budgets: true }))
      try {
        const response = await budgetsService.getBudgets({
          category_id: category.id,
          status: 'active'
        })
        setBudgets(response.items || []) // Assuming items or data based on response
      } catch (error) {
        console.error("Failed to fetch budgets for category:", error)
      } finally {
        setIsLoadingFn(prev => ({ ...prev, budgets: false }))
      }
    }

    fetchTransactions()
    fetchBudgets()

  }, [category.id])

  const getTypeBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expense: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      both: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    }
    return map[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4 border-b pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {category.icon && (
                <span className="material-symbols-rounded text-2xl">{category.icon}</span>
              )}
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTypeBadgeClass(category.type)}>
                {t(`types.${category.type}`, { defaultValue: category.type })}
              </Badge>
              {category.is_system && (
                <Badge variant="outline">System</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description moved here */}
        {category.description && (
            <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground mr-1">Description:</span>
                {category.description}
            </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Transactions Column */}
        <div className="flex flex-col space-y-4 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Transactions
            </h3>
            <Card className="flex-1 border-0 shadow-none bg-transparent">
              <CardContent className="p-0 h-full">
                {isLoadingFn.transactions ? (
                   <div className="flex h-40 items-center justify-center">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                   </div>
                ) : transactions.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-350px)] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="w-[120px]">
                              {format(new Date(tx.bookingDate), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{tx.description || "No description"}</div>
                              {tx.counterparty?.name && (
                                <div className="text-xs text-muted-foreground">{tx.counterparty.name}</div>
                              )}
                            </TableCell>
                            <TableCell className={`text-right ${
                              tx.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.direction === 'CREDIT' ? '+' : '-'}
                              {formatCurrency(Math.abs(tx.amount), tx.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="flex h-40 items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    No transactions found for this category.
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Budgets Column */}
        <div className="flex flex-col space-y-4 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Active Budgets
            </h3>
            <Card className="flex-1 border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                {isLoadingFn.budgets ? (
                   <div className="flex h-40 items-center justify-center">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                   </div>
                ) : budgets.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                      <div className="grid gap-4">
                        {budgets.map((budget) => (
                        <Card key={budget.id}>
                            <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{budget.name}</CardTitle>
                                <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                                {budget.status}
                                </Badge>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Spent:</span>
                                <span className="font-medium">{formatCurrency(budget.spent_amount, budget.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Limit:</span>
                                <span className="font-medium">{formatCurrency(budget.amount, budget.currency)}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${
                                    budget.percentage_spent > 100 ? 'bg-red-500' : 
                                    budget.percentage_spent > 85 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(budget.percentage_spent, 100)}%` }}
                                />
                                </div>
                                <div className="text-xs text-right text-muted-foreground">
                                {budget.percentage_spent.toFixed(1)}% used
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        ))}
                      </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-40 items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    No active budgets linked to this category.
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

      </div>
    </div>
  )
}
