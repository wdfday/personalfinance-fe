"use client"

import { useMemo } from "react"
import { IncomeProfile } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Wallet, Edit, ArrowLeft, Archive, ArchiveRestore, XCircle, DollarSign, TrendingUp } from "lucide-react"
import { IncomeHistoryChart } from "./income-history-chart"
import { useAppSelector } from "@/lib/hooks"

interface IncomeDetailProps {
  income: IncomeProfile
  onClose: () => void
  onEdit: (income: IncomeProfile) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
  onEnd?: (id: string) => void
}

export function IncomeDetail({ income, onClose, onEdit, onArchive, onUnarchive, onEnd }: IncomeDetailProps) {
  const { transactions: allTransactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)

  // Filter transactions có link với income profile này
  const transactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        if (tx.direction !== "CREDIT") return false
        
        const txAny = tx as any
        // Check links array
        if (txAny.links && txAny.links.some((link: any) => 
          link.type === 'INCOME_PROFILE' && link.id === income.id
        )) {
          return true
        }
        return false
      })
      .sort((a, b) => {
        const txAnyA = a as any
        const txAnyB = b as any
        const dateA = txAnyA.bookingDate ?? txAnyA.booking_date ?? txAnyA.valueDate ?? txAnyA.value_date ?? txAnyA.date ?? txAnyA.createdAt ?? txAnyA.created_at
        const dateB = txAnyB.bookingDate ?? txAnyB.booking_date ?? txAnyB.valueDate ?? txAnyB.value_date ?? txAnyB.date ?? txAnyB.createdAt ?? txAnyB.created_at
        if (!dateA || !dateB) return 0
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
  }, [allTransactions, income.id])

  const totalAmount = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      const txAny = tx as any
      const amount = txAny.base_amount ?? txAny.amount ?? 0
      return sum + Math.abs(amount)
    }, 0)
  }, [transactions])

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      {/* Header - Gọn gàng hơn */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">{income.source}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={income.is_active ? "default" : "secondary"} className="text-xs">
                {income.status}
              </Badge>
              {income.is_recurring && (
                <Badge variant="outline" className="text-xs">Recurring</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(income)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          {onEnd && income.status === 'active' && (
            <Button variant="ghost" size="icon" onClick={() => onEnd(income.id)} title="Mark as ended">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          {onArchive && !income.is_archived && income.status !== 'ended' && (
            <Button variant="ghost" size="icon" onClick={() => onArchive(income.id)} title="Archive">
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onUnarchive && income.is_archived && (
            <Button variant="ghost" size="icon" onClick={() => onUnarchive(income.id)} title="Unarchive">
              <ArchiveRestore className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card - Gộp Amount và Details */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Amount</div>
              <div className="text-3xl font-bold">
                {formatCurrency(income.amount || 0, income.currency)}
              </div>
              <div className="text-xs text-muted-foreground capitalize mt-1">{income.frequency}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Next Payment</div>
              <div className="text-lg font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4 opacity-70" />
                {income.start_date ? new Date(income.start_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Payment Details - Compact */}
          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{income.currency}</span>
            </div>
            {income.description && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Description</span>
                <span className="font-medium text-right text-xs" title={income.description}>
                  {income.description}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <IncomeHistoryChart incomeId={income.id} currency={income.currency} />

      {/* Linked Transactions - Gọn gàng hơn */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Transactions
            </CardTitle>
            {transactions.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Total: {formatCurrency(totalAmount, income.currency)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              No transactions linked
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {transactions.map((tx) => {
                const txAny = tx as any
                const amount = txAny.base_amount ?? txAny.amount ?? 0
                const currency = txAny.currency ?? income.currency ?? "VND"
                const date = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {txAny.description || "Income Transaction"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          {date && (
                            <>
                              <Calendar className="h-3 w-3" />
                              {new Date(date).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm ml-3 text-green-600 shrink-0">
                      +{formatCurrency(Math.abs(amount), currency)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
