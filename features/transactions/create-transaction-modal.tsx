"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createTransaction } from "@/features/transactions/transactionsSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
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

const createTransactionSchema = z.object({
  account_id: z.string().uuid("ID tài khoản không hợp lệ"),
  from_account_id: z.string().uuid().optional().or(z.literal('')),
  to_account_id: z.string().uuid().optional().or(z.literal('')),
  transaction_type: z.enum(["income", "expense", "transfer"], {
    required_error: "Vui lòng chọn loại giao dịch",
  }),
  amount: z.number().min(0.01, "Số tiền phải > 0"),
  currency: z.string().length(3, "Mã tiền tệ phải 3 ký tự").optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  notes: z.string().optional(),
  transaction_date: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled", "failed"]).optional(),
  payment_method: z.enum(["cash", "bank_transfer", "debit_card", "credit_card", "mobile_payment", "check", "other"]).optional(),
  receipt_url: z.string().url("URL không hợp lệ").optional().or(z.literal('')),
  location: z.string().optional(),
  merchant_name: z.string().optional(),
  merchant_category: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
})

type CreateTransactionForm = z.infer<typeof createTransactionSchema>

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTransactionModal({ isOpen, onClose }: CreateTransactionModalProps) {
  const dispatch = useAppDispatch()
  const { accounts } = useAppSelector((state) => state.accounts)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accounts.length])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      account_id: "",
      transaction_type: "expense",
      amount: 0,
      currency: "VND",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
      status: "completed",
      is_recurring: false,
    },
  })

  const transactionType = watch("transaction_type")
  const isRecurring = watch("is_recurring")

  const onSubmit = async (data: CreateTransactionForm) => {
    try {
      setIsSubmitting(true)
      
      // Clean up empty optional fields
      const payload: any = {
        account_id: data.account_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        currency: data.currency || "VND",
        description: data.description || "",
        is_recurring: data.is_recurring,
      }

      if (data.transaction_date) {
        payload.transaction_date = data.transaction_date
      }
      
      if (data.status) payload.status = data.status
      if (data.payment_method) payload.payment_method = data.payment_method
      if (data.category_id) payload.category_id = data.category_id
      if (data.notes) payload.notes = data.notes
      if (data.receipt_url) payload.receipt_url = data.receipt_url
      if (data.location) payload.location = data.location
      if (data.merchant_name) payload.merchant_name = data.merchant_name
      if (data.merchant_category) payload.merchant_category = data.merchant_category
      if (data.is_recurring && data.recurring_frequency) payload.recurring_frequency = data.recurring_frequency

      // For transfers
      if (transactionType === 'transfer') {
        if (data.from_account_id) payload.from_account_id = data.from_account_id
        if (data.to_account_id) payload.to_account_id = data.to_account_id
      }

      await dispatch(createTransaction(payload)).unwrap()
      toast.success("Tạo giao dịch thành công!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Lỗi tạo giao dịch: " + error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo giao dịch mới</DialogTitle>
          <DialogDescription>
            Ghi lại giao dịch thu chi của bạn
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Loại giao dịch *</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue("transaction_type", value as CreateTransactionForm['transaction_type'])}
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
              {errors.transaction_type && (
                <p className="text-sm text-red-500">{errors.transaction_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Tài khoản *</Label>
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
              {errors.account_id && (
                <p className="text-sm text-red-500">{errors.account_id.message}</p>
              )}
            </div>
          </div>

          {/* Transfer specific fields */}
          {transactionType === 'transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_account_id">Từ tài khoản</Label>
                <Select
                  value={watch("from_account_id")}
                  onValueChange={(value) => setValue("from_account_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_account_id">Đến tài khoản</Label>
                <Select
                  value={watch("to_account_id")}
                  onValueChange={(value) => setValue("to_account_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản đích" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Status */}
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
                onValueChange={(value) => setValue("status", value as CreateTransactionForm['status'])}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Mô tả giao dịch"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Phương thức thanh toán</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={(value) => setValue("payment_method", value as CreateTransactionForm['payment_method'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức" />
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

          {/* Merchant */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant_name">Tên người bán/nhận</Label>
              <Input
                id="merchant_name"
                {...register("merchant_name")}
                placeholder="Tên cửa hàng, công ty..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Vị trí giao dịch"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Ghi chú bổ sung"
              rows={2}
            />
          </div>

          {/* Recurring */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_recurring">Giao dịch định kỳ</Label>
                <p className="text-sm text-muted-foreground">
                  Lặp lại giao dịch này tự động
                </p>
              </div>
              <Switch
                id="is_recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("is_recurring", checked)}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_frequency">Tần suất</Label>
                <Select
                  value={watch("recurring_frequency")}
                  onValueChange={(value) => setValue("recurring_frequency", value as CreateTransactionForm['recurring_frequency'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tần suất" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hàng ngày</SelectItem>
                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                    <SelectItem value="yearly">Hàng năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo giao dịch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
