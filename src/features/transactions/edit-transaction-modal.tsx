"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { updateTransaction } from "@/features/transactions/transactionsSlice"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { fetchBudgets } from "@/features/budgets/budgetsSlice"
import { fetchDebts } from "@/features/debts/debtsSlice"
import { fetchIncomeProfiles } from "@/features/income/incomeSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CategoryPickerPopover } from "@/components/categories/category-picker-popover"
import { TransactionLinkSelector } from "@/features/transactions/components/transaction-link-selector"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { Transaction, UpdateTransactionRequest, TransactionDirection, TransactionInstrument, TransactionLink } from "@/types/api"

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
  const { categories = [] } = useAppSelector((state) => state.categories)
  const { budgets = [] } = useAppSelector((state) => state.budgets)
  const { debts = [] } = useAppSelector((state) => state.debts)
  const { items: incomeProfiles = [] } = useAppSelector((state) => state.income)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<TransactionLink[]>([])

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (categories.length === 0) {
        dispatch(fetchCategories())
      }
      if (budgets.length === 0) {
        dispatch(fetchBudgets())
      }
      if (debts.length === 0) {
        dispatch(fetchDebts())
      }
      // Only fetch income profiles if transaction is CREDIT (income)
      if (transaction?.direction === "CREDIT" && incomeProfiles.length === 0) {
        dispatch(fetchIncomeProfiles())
      }
    }
  }, [isOpen, dispatch, categories.length, budgets.length, debts.length, incomeProfiles.length, transaction?.direction])

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
      setValue("userCategoryId", transaction.userCategoryId || transaction.classification?.userCategoryId || "")
      // Set links if transaction has no existing links (can only add if empty)
      if (transaction.links && transaction.links.length > 0) {
        // Transaction already has links - cannot modify
        setSelectedLinks([])
      } else {
        // No existing links - can add new ones
        setSelectedLinks([])
      }
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
      
      // Only add links if transaction has no existing links
      if (selectedLinks.length > 0 && (!transaction.links || transaction.links.length === 0)) {
        payload.links = selectedLinks
      }

      await dispatch(updateTransaction({ id: transaction.id, data: payload })).unwrap()
      toast.success("Cập nhật giao dịch thành công!")
      reset()
      setSelectedLinks([])
      onClose()
    } catch (error) {
      toast.error("Lỗi cập nhật giao dịch: " + error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedLinks([])
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <CategoryPickerPopover
              categories={categories}
              value={watch("userCategoryId")}
              onChange={(categoryId) => setValue("userCategoryId", categoryId)}
              placeholder="Chọn danh mục..."
              categoryType={(direction || transaction?.direction) === "CREDIT" ? "income" : "expense"}
            />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label>Liên kết</Label>
            {transaction.links && transaction.links.length > 0 ? (
              <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                Giao dịch này đã có liên kết và không thể thay đổi. 
                <div className="mt-2 space-y-1">
                  {transaction.links.map((link, idx) => (
                    <div key={idx} className="text-xs">
                      {link.type}: {link.id.slice(0, 8)}...
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <TransactionLinkSelector
                  value={selectedLinks}
                  onChange={setSelectedLinks}
                  budgets={budgets.filter(b => b.status !== 'ended').map(b => ({ id: b.id, name: b.name }))}
                  debts={debts.map(d => ({ id: d.id, name: d.name }))}
                  incomeProfiles={incomeProfiles.map(i => ({ 
                    id: i.id, 
                    name: i.source || i.description || `Income ${i.id.slice(0, 8)}` 
                  }))}
                  direction={transaction?.direction}
                />
                <p className="text-xs text-muted-foreground">
                  {transaction?.direction === "CREDIT" 
                    ? "Liên kết transaction với Income Profile"
                    : "Liên kết transaction với Budget hoặc Debt"}
                </p>
              </>
            )}
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
