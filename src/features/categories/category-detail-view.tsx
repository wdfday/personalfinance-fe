"use client"

import { useMemo } from "react"
import { useTranslation } from "@/contexts/i18n-context"
import { useAppSelector } from "@/lib/hooks"
import { type Category } from "@/services/api"
import { 
  type Transaction
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
  TrendingUp
} from "lucide-react"

interface CategoryDetailViewProps {
  category: Category
}

export function CategoryDetailView({ category }: CategoryDetailViewProps) {
  const { t } = useTranslation("categories")
  const { categories: allCategories = [] } = useAppSelector((state) => state.categories)
  const { transactions: allTransactions = [] } = useAppSelector((state) => state.transactions)

  // Get all child category IDs recursively
  const getAllChildCategoryIds = useMemo(() => {
    const getChildren = (parentId: string): string[] => {
      const children = allCategories.filter(cat => cat.parent_id === parentId)
      const childIds = children.map(cat => cat.id)
      // Recursively get grandchildren
      const grandChildIds = children.flatMap(child => getChildren(child.id))
      return [...childIds, ...grandChildIds]
    }
    return getChildren(category.id)
  }, [category.id, allCategories])

  // All category IDs to filter (current + children)
  const categoryIdsToFilter = useMemo(() => {
    return [category.id, ...getAllChildCategoryIds]
  }, [category.id, getAllChildCategoryIds])

  // Filter transactions from Redux by category IDs
  const transactions = useMemo(() => {
    return allTransactions
      .filter(tx => {
        // Check if transaction has categoryId that matches any of our category IDs
        const txCategoryId = tx.categoryId || tx.category_id || tx.userCategoryId
        return txCategoryId && categoryIdsToFilter.includes(txCategoryId)
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        const dateA = new Date(a.bookingDate || a.date || a.createdAt || 0).getTime()
        const dateB = new Date(b.bookingDate || b.date || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 50) // Limit to 50 most recent
  }, [allTransactions, categoryIdsToFilter])

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount)
  }

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
              {/* {category.icon && (
                <span className="material-symbols-rounded text-2xl">{category.icon}</span>
              )} */}
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTypeBadgeClass(category.type)}>
                {t(`types.${category.type}`, { defaultValue: category.type })}
              </Badge>
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

      {/* Content - Single Column for Transactions */}
      <div className="flex-1 min-h-0">
        
        {/* Transactions Column */}
        <div className="flex flex-col space-y-4 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Transactions
            </h3>
            <Card className="flex-1 border-0 shadow-none bg-transparent">
              <CardContent className="p-0 h-full">
                {transactions.length > 0 ? (
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

      </div>
    </div>
  )
}
