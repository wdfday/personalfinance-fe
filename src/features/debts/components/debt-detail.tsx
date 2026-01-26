"use client"

import { useEffect, useState } from "react"
import { Debt } from "@/services/api/types/debts"
import { Transaction } from "@/services/api/types/transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CreditCard, Calendar, TrendingDown } from "lucide-react"
import { transactionsService } from "@/services/api/services/transactions.service"
import { DebtPayoffChart } from "./debt-payoff-chart"

interface DebtDetailProps {
  debt: Debt
  onClose: () => void
  onEdit?: (debt: Debt) => void
}

export function DebtDetail({ debt, onClose, onEdit }: DebtDetailProps) {
  const [payoffs, setPayoffs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalPages: 0, totalCount: 0 })

  // Load initial transactions
  useEffect(() => {
    const fetchPayoffs = async () => {
      setLoading(true)
      try {
        const response = await transactionsService.getAll({ page: 1, pageSize: 20 })
        const allTransactions = response.transactions || []
        const debtPayoffs = allTransactions.filter((tx: Transaction) => {
          if (!tx.links || tx.links.length === 0) return false
          return tx.links.some((link) => link.type === "DEBT" && link.id === debt.id)
        })

        debtPayoffs.sort((a, b) => {
          const dateA = new Date(a.booking_date || a.date).getTime()
          const dateB = new Date(b.booking_date || b.date).getTime()
          return dateB - dateA
        })

        const pagination = response.pagination || { page: 1, pageSize: 20, totalPages: 0, totalCount: 0 }
        setPayoffs(debtPayoffs)
        setPagination(pagination)
        setHasMore(pagination.page < pagination.totalPages)
      } catch (error) {
        console.error("Failed to fetch payoffs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (debt.id) {
      fetchPayoffs()
    }
  }, [debt.id])

  // Load more transactions when scrolling
  useEffect(() => {
    let loadingMore = false
    
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading || isLoadingMore) return
      
      // Check if we're near the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      // Load more when user is within 200px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        loadingMore = true
        setIsLoadingMore(true)
        const nextPage = pagination.page + 1
        
        transactionsService.getAll({ page: nextPage, pageSize: 20 })
          .then((response) => {
            const allTransactions = response.transactions || []
            const debtPayoffs = allTransactions.filter((tx: Transaction) => {
              if (!tx.links || tx.links.length === 0) return false
              return tx.links.some((link) => link.type === "DEBT" && link.id === debt.id)
            })

            debtPayoffs.sort((a, b) => {
              const dateA = new Date(a.booking_date || a.date).getTime()
              const dateB = new Date(b.booking_date || b.date).getTime()
              return dateB - dateA
            })

            const newPagination = response.pagination || { page: nextPage, pageSize: 20, totalPages: 0, totalCount: 0 }
            setPayoffs((prev) => {
              // Avoid duplicates
              const existingIds = new Set(prev.map(t => t.id))
              const uniqueNew = debtPayoffs.filter(t => !existingIds.has(t.id))
              return [...prev, ...uniqueNew]
            })
            setPagination(newPagination)
            setHasMore(newPagination.page < newPagination.totalPages)
            setIsLoadingMore(false)
            loadingMore = false
          })
          .catch((error) => {
            console.error("Failed to fetch more payoffs:", error)
            setIsLoadingMore(false)
            loadingMore = false
          })
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, isLoadingMore, pagination.page, debt.id])

  const isPaidOff = debt.status === "paid_off" || debt.current_balance <= 0

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {debt.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={debt.status === "active" ? "default" : "secondary"}>
                {debt.status === "paid_off"
                  ? "Đã trả hết"
                  : debt.status === "active"
                  ? "Đang hoạt động"
                  : debt.status}
              </Badge>
              {debt.next_payment_date && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(debt.next_payment_date).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>
          </div>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(debt)}>
            Edit
          </Button>
        )}
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(debt.current_balance, debt.currency)}
                  </div>
                </div>
                {!isPaidOff && (
                  <>
                    <Progress value={debt.percentage_paid} className="h-2" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{debt.percentage_paid.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-semibold">{formatCurrency(debt.remaining_amount, debt.currency)}</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2 text-sm pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal</span>
                    <span className="font-semibold">{formatCurrency(debt.principal_amount, debt.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-semibold">{formatCurrency(debt.total_paid, debt.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments</span>
                    <span className="font-semibold">{payoffs.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debt Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{debt.type}</span>
              </div>
              {debt.behavior && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Behavior</span>
                  <span className="font-medium capitalize">{debt.behavior}</span>
                </div>
              )}
              {debt.interest_rate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">{debt.interest_rate}%</span>
                </div>
              )}
              {debt.minimum_payment > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Payment</span>
                  <span className="font-medium">{formatCurrency(debt.minimum_payment, debt.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{debt.currency}</span>
              </div>
              {debt.description && (
                <div className="pt-2 border-t">
                  <div className="text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{debt.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chart & List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <DebtPayoffChart debtId={debt.id} currency={debt.currency} />

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Payment History ({payoffs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : payoffs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No payment history found for this debt.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {payoffs.map((tx) => {
                    const amount = tx.base_amount || tx.amount
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <TrendingDown className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {tx.description || "Debt Payment"}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {tx.booking_date || tx.date ? (
                                <span title={`Thời gian giao dịch: ${new Date(tx.booking_date || tx.date).toLocaleString('vi-VN')}`}>
                                  {new Date(tx.booking_date || tx.date).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              ) : tx.createdAt ? (
                                <span title={`Tạo lúc: ${new Date(tx.createdAt).toLocaleString('vi-VN')}`}>
                                  {new Date(tx.createdAt).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold text-base ml-4 text-blue-600 shrink-0">
                          -{formatCurrency(Math.abs(amount), tx.currency)}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-xs text-muted-foreground">Đang tải thêm...</p>
                    </div>
                  )}
                  
                  {/* End of list indicator */}
                  {!hasMore && payoffs.length > 0 && !isLoadingMore && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">Đã hiển thị tất cả giao dịch</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
