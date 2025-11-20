"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { updateTransaction } from "@/features/transactions/transactionsSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { Transaction } from "@/services/api"

const updateTransactionSchema = z.object({
  account_id: z.string().uuid().optional(),
  from_account_id: z.string().uuid().optional().or(z.literal('')),
  to_account_id: z.string().uuid().optional().or(z.literal('')),
  transaction_type: z.enum(["income", "expense", "transfer"]).optional(),
  amount: z.number().min(0.01).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().max(500).optional(),
  notes: z.string().optional(),
  transaction_date: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled", "failed"]).optional(),
  payment_method: z.enum(["cash", "bank_transfer", "debit_card", "credit_card", "mobile_payment", "check", "other"]).optional(),
  location: z.string().optional(),
  merchant_name: z.string().optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
})

type UpdateTransactionForm = z.infer<typeof updateTransactionSchema>

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const dispatch = useAppDispatch()
  const { accounts } = useAppSelector((state) => state.accounts)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateTransactionForm>({
    resolver: zodResolver(updateTransactionSchema),
  })

  useEffect(() => {
    if (transaction) {
      setValue("account_id", transaction.account_id)
      setValue("transaction_type", transaction.transaction_type as any)
      setValue("amount", transaction.amount)
      setValue("currency", transaction.currency)
      setValue("description", transaction.description || "")
      setValue("notes", transaction.notes || "")
      setValue("transaction_date", transaction.transaction_date?.split('T')[0])
      setValue("status", transaction.status as any)
      setValue("payment_method", transaction.payment_method as any)
      setValue("location", transaction.location || "")
      setValue("merchant_name", transaction.merchant_name || "")
      setValue("is_recurring", transaction.is_recurring)
      setValue("recurring_frequency", transaction.recurring_frequency as any)
      if (transaction.from_account_id) setValue("from_account_id", transaction.from_account_id)
      if (transaction.to_account_id) setValue("to_account_id", transaction.to_account_id)
    }
  }, [transaction, setValue])

  const transactionType = watch("transaction_type")
  const isRecurring = watch("is_recurring")

  const onSubmit = async (data: UpdateTransactionForm) => {
    if (!transaction) return

    try {
      setIsSubmitting(true)
      
      // Clean up undefined fields
      const payload: any = {}
      Object.keys(data).forEach(key => {
        const value = (data as any)[key]
        if (value !== undefined && value !== '') {
          payload[key] = value
        }
      })

      await dispatch(updateTransaction({ id: transaction.id, data: payload })).unwrap()
      toast.success("Cập nhật giao dịch thành công!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Lỗi cập nhật giao dịch: " + error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin giao dịch
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Similar structure to create modal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Loại giao dịch</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue("transaction_type", value as UpdateTransactionForm['transaction_type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Thu nhập</SelectItem>
                  <SelectItem value="expense">Chi tiêu</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Tài khoản</Label>
              <Select
                value={watch("account_id")}
                onValueChange={(value) => setValue("account_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị</Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Ngày giao dịch</Label>
              <Input
                id="transaction_date"
                type="date"
                {...register("transaction_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as UpdateTransactionForm['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Phương thức</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={(value) => setValue("payment_method", value as UpdateTransactionForm['payment_method'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                <SelectItem value="debit_card">Thẻ ghi nợ</SelectItem>
                <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                <SelectItem value="mobile_payment">Ví điện tử</SelectItem>
                <SelectItem value="check">Séc</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant_name">Tên người bán</Label>
              <Input
                id="merchant_name"
                {...register("merchant_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                {...register("location")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

