"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDebts } from "@/features/debts/debtsSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, Eye, CreditCard } from "lucide-react"
import { CreateDebtModal } from "../create-debt-modal"

export default function DebtsPage() {
  const dispatch = useAppDispatch()
  const { debts = [], isLoading, error } = useAppSelector((state) => state.debts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchDebts())
  }, [dispatch])

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paid_off':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'defaulted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'settled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Thẻ tín dụng',
      personal_loan: 'Vay cá nhân',
      mortgage: 'Vay thế chấp',
      other: 'Khác',
    }
    return labels[type] || type
  }

  const getBehaviorLabel = (behavior: string) => {
    const labels: Record<string, string> = {
      revolving: 'Dư nợ giảm dần',
      installment: 'Trả góp',
      interest_only: 'Trả lãi',
    }
    return labels[behavior] || behavior
  }

  const getDaysUntilNextPayment = (dateStr?: string) => {
    if (!dateStr) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dateStr)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi: {error}</p>
          <Button onClick={() => dispatch(fetchDebts())}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý nợ</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nợ mới
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => {
          const daysUntilNextPayment = getDaysUntilNextPayment(debt.next_payment_date)
          const isOverdue = daysUntilNextPayment < 0 && debt.status === 'active'
          const isPaidOff = debt.status === 'paid_off' || debt.current_balance <= 0

          return (
            <Card key={debt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {debt.name}
                </CardTitle>
                <Badge className={getStatusColor(debt.status)}>
                  {debt.status === 'paid_off' ? 'Đã trả hết' : 
                   debt.status === 'active' ? 'Đang hoạt động' :
                   debt.status === 'defaulted' ? 'Quá hạn' : debt.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debt.description && (
                    <p className="text-sm text-muted-foreground">{debt.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loại nợ</span>
                      <span className="font-medium">{getTypeLabel(debt.type)}</span>
                    </div>
                    {debt.behavior && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tính chất</span>
                        <span className="font-medium">{getBehaviorLabel(debt.behavior)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số tiền gốc</span>
                      <span className="font-medium">{formatCurrency(debt.principal_amount, debt.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số dư hiện tại</span>
                      <span className="font-medium">{formatCurrency(debt.current_balance, debt.currency)}</span>
                    </div>
                    {debt.interest_rate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lãi suất</span>
                        <span className="font-medium">{debt.interest_rate}%</span>
                      </div>
                    )}
                  </div>

                  {!isPaidOff && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiến độ trả nợ</span>
                        <span className="font-medium">{debt.percentage_paid.toFixed(1)}%</span>
                      </div>
                      <Progress value={debt.percentage_paid} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Đã trả: {formatCurrency(debt.total_paid, debt.currency)}</span>
                        <span>Còn lại: {formatCurrency(debt.remaining_amount, debt.currency)}</span>
                      </div>
                    </div>
                  )}

                  {debt.next_payment_date && !isPaidOff && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ngày thanh toán tiếp theo</span>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {new Date(debt.next_payment_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Còn lại</span>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {isOverdue 
                            ? `${Math.abs(daysUntilNextPayment)} ngày quá hạn`
                            : `${daysUntilNextPayment} ngày`}
                        </span>
                      </div>
                      {debt.minimum_payment > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Thanh toán tối thiểu</span>
                          <span className="font-medium">{formatCurrency(debt.minimum_payment, debt.currency)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {debts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có nợ nào</h3>
              <p className="text-muted-foreground mb-4">
                Thêm nợ đầu tiên để bắt đầu quản lý.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm nợ mới
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateDebtModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}



