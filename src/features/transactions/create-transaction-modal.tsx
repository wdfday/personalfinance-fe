"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createTransaction } from "@/features/transactions/transactionsSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { fetchGoals } from "@/features/goals/goalsSlice"
import { fetchBudgets } from "@/features/budgets/budgetsSlice"
import { fetchDebts } from "@/features/debts/debtsSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TransactionLinkSelector } from "@/features/transactions/components/transaction-link-selector"
import { TransactionTagsInput } from "@/features/transactions/components/transaction-tags-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { CreateTransactionRequest, TransactionDirection, TransactionInstrument, TransactionSource, TransactionLink } from "@/types/api"

// Direction-based model schema
const createTransactionSchema = z.object({
  accountId: z.string().min(1, "Vui lòng chọn tài khoản"),
  direction: z.enum(["DEBIT", "CREDIT"], {
    required_error: "Vui lòng chọn loại giao dịch",
  }),
  instrument: z.enum(["CASH", "BANK_ACCOUNT", "DEBIT_CARD", "CREDIT_CARD", "E_WALLET", "CRYPTO", "UNKNOWN"]).default("BANK_ACCOUNT"),
  source: z.enum(["BANK_API", "CSV_IMPORT", "JSON_IMPORT", "MANUAL"]).default("MANUAL"),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  currency: z.string().length(3).default("VND"),
  bookingDate: z.string().min(1, "Vui lòng chọn ngày"),
  description: z.string().max(500).optional(),
  userNote: z.string().max(1000).optional(),
  counterpartyName: z.string().optional(),
  userCategoryId: z.string().optional(),
  isTransfer: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({ type: z.string(), id: z.string() })).optional(),
})

type CreateTransactionForm = z.infer<typeof createTransactionSchema>

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTransactionModal({ isOpen, onClose }: CreateTransactionModalProps) {
  const dispatch = useAppDispatch()
  const { accounts = [] } = useAppSelector((state) => state.accounts)
  const { goals = [] } = useAppSelector((state) => state.goals)
  const { budgets = [] } = useAppSelector((state) => state.budgets)
  const { debts = [] } = useAppSelector((state) => state.debts)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<TransactionLink[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts())
    }
    if (goals.length === 0) {
      dispatch(fetchGoals())
    }
    if (budgets.length === 0) {
      dispatch(fetchBudgets())
    }
    if (debts.length === 0) {
      dispatch(fetchDebts())
    }
  }, [dispatch, accounts.length, goals.length, budgets.length, debts.length])

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
      accountId: "",
      direction: "DEBIT",
      instrument: "BANK_ACCOUNT",
      source: "MANUAL",
      amount: 0,
      currency: "VND",
      bookingDate: new Date().toISOString().split('T')[0],
      description: "",
      userNote: "",
      isTransfer: false,
    },
  })

  const direction = watch("direction")
  const instrument = watch("instrument")

  const onSubmit = async (data: CreateTransactionForm) => {
    try {
      setIsSubmitting(true)

      const payload: CreateTransactionRequest = {
        accountId: data.accountId,
        direction: data.direction as TransactionDirection,
        instrument: data.instrument as TransactionInstrument,
        source: data.source as TransactionSource,
        amount: data.amount,
        currency: data.currency,
        bookingDate: data.bookingDate,
        description: data.description,
        userNote: data.userNote,
        counterpartyName: data.counterpartyName,
        userCategoryId: data.userCategoryId || undefined,
        isTransfer: data.isTransfer,
        tags: tags.length > 0 ? tags : undefined,
        links: selectedLinks.length > 0 ? selectedLinks : undefined,
      }

      await dispatch(createTransaction(payload)).unwrap()
      toast.success("Tạo giao dịch thành công!")
      reset()
      setSelectedLinks([])
      setTags([])
      onClose()
    } catch (error) {
      toast.error("Lỗi tạo giao dịch: " + error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedLinks([])
    setTags([])
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
          {/* Direction and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Loại giao dịch *</Label>
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
              {errors.direction && (
                <p className="text-sm text-red-500">{errors.direction.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Tài khoản *</Label>
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
              {errors.accountId && (
                <p className="text-sm text-red-500">{errors.accountId.message}</p>
              )}
            </div>
          </div>

          {/* Instrument */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instrument">Phương thức *</Label>
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
              <Label htmlFor="bookingDate">Ngày giao dịch *</Label>
              <Input
                id="bookingDate"
                type="date"
                {...register("bookingDate")}
              />
              {errors.bookingDate && (
                <p className="text-sm text-red-500">{errors.bookingDate.message}</p>
              )}
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền *</Label>
              <Input
                id="amount"
                type="number"
                step="1"
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
              placeholder="Mô tả giao dịch"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="userNote">Ghi chú</Label>
            <Textarea
              id="userNote"
              {...register("userNote")}
              placeholder="Ghi chú bổ sung"
              rows={2}
            />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label>Liên kết</Label>
            <TransactionLinkSelector
              value={selectedLinks}
              onChange={setSelectedLinks}
              goals={goals.map(g => ({ id: g.id, name: g.name }))}
              budgets={budgets.map(b => ({ id: b.id, name: b.name }))}
              debts={debts.map(d => ({ id: d.id, name: d.name }))}
            />
            <p className="text-xs text-muted-foreground">
              Liên kết transaction với Goal, Budget, hoặc Debt
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TransactionTagsInput
              value={tags}
              onChange={setTags}
            />
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
