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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { Transaction, UpdateTransactionRequest, TransactionDirection, TransactionInstrument } from "@/types/api"

const updateTransactionSchema = z.object({
  accountId: z.string().optional(),
  direction: z.enum(["DEBIT", "CREDIT"]).optional(),
  instrument: z.enum(["CASH", "BANK_ACCOUNT", "DEBIT_CARD", "CREDIT_CARD", "E_WALLET", "CRYPTO", "UNKNOWN"]).optional(),
  amount: z.number().min(1).optional(),
  currency: z.string().length(3).optional(),
  bookingDate: z.string().optional(),
  description: z.string().max(500).optional(),
  userNote: z.string().max(1000).optional(),
  counterpartyName: z.string().optional(),
  userCategoryId: z.string().optional(),
  isTransfer: z.boolean().optional(),
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
      setValue("accountId", transaction.accountId)
      setValue("direction", transaction.direction)
      setValue("instrument", transaction.instrument)
      setValue("amount", transaction.amount)
      setValue("currency", transaction.currency)
      setValue("bookingDate", transaction.bookingDate?.split('T')[0])
      setValue("description", transaction.description || "")
      setValue("userNote", transaction.userNote || "")
      setValue("counterpartyName", transaction.counterparty?.name || "")
      setValue("userCategoryId", transaction.classification?.userCategoryId || "")
      setValue("isTransfer", transaction.classification?.isTransfer || false)
    }
  }, [transaction, setValue])

  const direction = watch("direction")
  const instrument = watch("instrument")

  const onSubmit = async (data: UpdateTransactionForm) => {
    if (!transaction) return

    try {
      setIsSubmitting(true)

      const payload: UpdateTransactionRequest = {}

      if (data.accountId) payload.accountId = data.accountId
      if (data.direction) payload.direction = data.direction as TransactionDirection
      if (data.instrument) payload.instrument = data.instrument as TransactionInstrument
      if (data.amount) payload.amount = data.amount
      if (data.currency) payload.currency = data.currency
      if (data.bookingDate) payload.bookingDate = data.bookingDate
      if (data.description !== undefined) payload.description = data.description
      if (data.userNote !== undefined) payload.userNote = data.userNote
      if (data.counterpartyName) payload.counterpartyName = data.counterpartyName
      if (data.userCategoryId) payload.userCategoryId = data.userCategoryId
      if (data.isTransfer !== undefined) payload.isTransfer = data.isTransfer

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
          {/* Direction and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Loại giao dịch</Label>
              <Select
                value={direction}
                onValueChange={(value) => setValue("direction", value as "DEBIT" | "CREDIT")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">Chi tiêu (DEBIT)</SelectItem>
                  <SelectItem value="CREDIT">Thu nhập (CREDIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Tài khoản</Label>
              <Select
                value={watch("accountId")}
                onValueChange={(value) => setValue("accountId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instrument and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instrument">Phương thức</Label>
              <Select
                value={instrument}
                onValueChange={(value) => setValue("instrument", value as TransactionInstrument)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_ACCOUNT">Tài khoản ngân hàng</SelectItem>
                  <SelectItem value="CASH">Tiền mặt</SelectItem>
                  <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                  <SelectItem value="DEBIT_CARD">Thẻ ghi nợ</SelectItem>
                  <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingDate">Ngày giao dịch</Label>
              <Input
                id="bookingDate"
                type="date"
                {...register("bookingDate")}
              />
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền</Label>
              <Input
                id="amount"
                type="number"
                step="1"
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
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Counterparty */}
          <div className="space-y-2">
            <Label htmlFor="counterpartyName">Đối tác / Người nhận</Label>
            <Input
              id="counterpartyName"
              {...register("counterpartyName")}
              placeholder="Tên người nhận hoặc cửa hàng"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="userNote">Ghi chú</Label>
            <Textarea
              id="userNote"
              {...register("userNote")}
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
