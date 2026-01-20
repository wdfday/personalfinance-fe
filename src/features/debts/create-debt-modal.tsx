"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { createDebt } from "@/features/debts/debtsSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const createDebtSchema = z.object({
  name: z.string().min(1, "Tên nợ là bắt buộc"),
  description: z.string().optional(),
  type: z.enum(["credit_card", "personal_loan", "mortgage", "other"], {
    required_error: "Loại nợ là bắt buộc",
  }),
  behavior: z.enum(["revolving", "installment", "interest_only"], {
    required_error: "Tính chất nợ là bắt buộc",
  }).default("installment"),
  principal_amount: z.number().min(0.01, "Số tiền gốc phải lớn hơn 0"),
  current_balance: z.number().min(0, "Số dư hiện tại không được âm"),
  interest_rate: z.number().min(0).max(100).default(0),
  minimum_payment: z.number().min(0).default(0),
  payment_amount: z.number().min(0).default(0),
  currency: z.string().length(3, "Mã tiền tệ phải có 3 ký tự").default("VND"),
  payment_frequency: z.enum(["one_time", "daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
  start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  due_date: z.string().optional(),
  creditor_name: z.string().optional(),
  account_number: z.string().optional(),
})

type CreateDebtForm = z.infer<typeof createDebtSchema>

interface CreateDebtModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateDebtModal({ isOpen, onClose }: CreateDebtModalProps) {
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateDebtForm>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      name: "",
      type: "credit_card",
      behavior: "revolving",
      principal_amount: 0,
      current_balance: 0,
      interest_rate: 0,
      minimum_payment: 0,
      payment_amount: 0,
      currency: "VND",
      start_date: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: CreateDebtForm) => {
    try {
      setIsSubmitting(true)
      const payload = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        behavior: data.behavior,
        principal_amount: data.principal_amount,
        current_balance: data.current_balance,
        interest_rate: data.interest_rate,
        minimum_payment: data.minimum_payment,
        payment_amount: data.payment_amount,
        currency: data.currency,
        payment_frequency: data.payment_frequency,
        start_date: data.start_date,
        due_date: data.due_date || undefined,
        creditor_name: data.creditor_name || undefined,
        account_number: data.account_number || undefined,
      }
      await dispatch(createDebt(payload)).unwrap()
      toast.success("Thêm nợ thành công")
      reset()
      onClose()
    } catch (error) {
      toast.error(`Lỗi: ${String(error)}`)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nợ mới</DialogTitle>
          <DialogDescription>
            Thêm thông tin về khoản nợ của bạn
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nợ *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ví dụ: Thẻ tín dụng VCB"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại nợ *</Label>
              <Select
                onValueChange={(value) => setValue("type", value as any)}
                defaultValue="credit_card"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nợ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                  <SelectItem value="personal_loan">Vay cá nhân</SelectItem>
                  <SelectItem value="mortgage">Vay thế chấp</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="behavior">Tính chất nợ *</Label>
              <Select
                onValueChange={(value) => setValue("behavior", value as any)}
                defaultValue="revolving"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tính chất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revolving">Dư nợ giảm dần (Revolving)</SelectItem>
                  <SelectItem value="installment">Trả góp (Installment)</SelectItem>
                  <SelectItem value="interest_only">Trả lãi (Interest Only)</SelectItem>
                </SelectContent>
              </Select>
              {errors.behavior && (
                <p className="text-sm text-red-500">{errors.behavior.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Mô tả về khoản nợ..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal_amount">Số tiền gốc *</Label>
              <Input
                id="principal_amount"
                type="number"
                step="0.01"
                {...register("principal_amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.principal_amount && (
                <p className="text-sm text-red-500">{errors.principal_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_balance">Số dư hiện tại *</Label>
              <Input
                id="current_balance"
                type="number"
                step="0.01"
                {...register("current_balance", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.current_balance && (
                <p className="text-sm text-red-500">{errors.current_balance.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Lãi suất (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                {...register("interest_rate", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_payment">Thanh toán tối thiểu</Label>
              <Input
                id="minimum_payment"
                type="number"
                step="0.01"
                {...register("minimum_payment", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Mã tiền tệ</Label>
              <Input
                id="currency"
                {...register("currency")}
                placeholder="VND"
                maxLength={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Ngày bắt đầu *</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Ngày đáo hạn</Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_frequency">Tần suất thanh toán</Label>
            <Select
              onValueChange={(value) => setValue("payment_frequency", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tần suất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
                <SelectItem value="weekly">Hàng tuần</SelectItem>
                <SelectItem value="biweekly">Hai tuần một lần</SelectItem>
                <SelectItem value="quarterly">Hàng quý</SelectItem>
                <SelectItem value="yearly">Hàng năm</SelectItem>
                <SelectItem value="one_time">Một lần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditor_name">Tên chủ nợ</Label>
              <Input
                id="creditor_name"
                {...register("creditor_name")}
                placeholder="Ví dụ: Ngân hàng VCB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Số tài khoản</Label>
              <Input
                id="account_number"
                {...register("account_number")}
                placeholder="Số tài khoản với chủ nợ"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang thêm..." : "Thêm nợ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



