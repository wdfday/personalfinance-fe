"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/lib/hooks"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { useAppDispatch } from "@/lib/hooks"
import { goalsService } from "@/services/api/services/goals.service"
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
import { Goal } from "@/services/api/types/goals"
import { useAccountAvailableBalance } from "@/hooks/use-account-available-balance"
import { getAccountAvailableBalance } from "@/utils/account-balance"

const createContributionSchema = z.object({
  accountId: z.string().min(1, "Vui lòng chọn tài khoản"),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  note: z.string().max(1000).optional(),
})

type CreateContributionForm = z.infer<typeof createContributionSchema>

interface CreateContributionModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal
  onSuccess?: () => void
}

export function CreateContributionModal({ isOpen, onClose, goal, onSuccess }: CreateContributionModalProps) {
  const dispatch = useAppDispatch()
  const { accounts: accountsFromState = [] } = useAppSelector((state) => state.accounts)
  const { accounts, isLoading: isLoadingBalance } = useAccountAvailableBalance()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use accounts with available balance if available, otherwise fallback to state accounts
  const accountsToUse = accounts.length > 0 ? accounts : accountsFromState

  useEffect(() => {
    // Always fetch accounts when modal opens to ensure fresh data
    if (isOpen) {
      dispatch(fetchAccounts())
    }
  }, [dispatch, isOpen])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateContributionForm>({
    resolver: zodResolver(createContributionSchema),
    defaultValues: {
      accountId: goal.accountId || "",
      amount: 0,
      note: "",
    },
  })

  // Watch values after useForm is initialized
  const selectedAccountId = watch("accountId")
  const amount = watch("amount") || 0
  const selectedAccount = accountsToUse.find(acc => acc.id === selectedAccountId)
  
  // Get available balance (số dư khả dụng) - current balance minus contributions
  const accountBalance = selectedAccount 
    ? getAccountAvailableBalance(selectedAccount)
    : 0
  
  const hasInsufficientBalance = selectedAccount && selectedAccount.currency === goal.currency && amount > accountBalance

  const onSubmit = async (data: CreateContributionForm) => {
    // Validate account balance using available balance
    const account = accountsToUse.find(acc => acc.id === data.accountId)
    if (account) {
      const availableBalance = getAccountAvailableBalance(account)
      if (account.currency === goal.currency && data.amount > availableBalance) {
        toast.error(`Số dư khả dụng không đủ. Số dư khả dụng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(availableBalance)}`)
        return
      }
    }

    try {
      setIsSubmitting(true)

      // Create GoalContribution (deposit) via API
      await goalsService.contribute(goal.id, data.amount, data.accountId, data.note || undefined, "manual")
      toast.success("Tạo contribution thành công!")
      reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error("Lỗi tạo contribution: " + (error instanceof Error ? error.message : String(error)))
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Contribution</DialogTitle>
          <DialogDescription>
            Tạo contribution mới cho goal: <strong>{goal.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account */}
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
                {accountsToUse.map((account) => {
                  const accountName = (account as any).accountName || account.account_name || 'Unknown'
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      {accountName} ({account.currency})
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-500">{errors.accountId.message}</p>
            )}
            {selectedAccount && selectedAccount.currency === goal.currency && (
              <div className="text-xs text-muted-foreground">
                Số dư khả dụng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(accountBalance)}
                {isLoadingBalance && <span className="ml-2 text-xs">(Đang tính...)</span>}
              </div>
            )}
          </div>

          {/* Amount */}
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
            {selectedAccount && selectedAccount.currency === goal.currency && (
              <div className="text-xs text-muted-foreground">
                Số dư khả dụng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(accountBalance)}
              </div>
            )}
            {hasInsufficientBalance && (
              <p className="text-sm text-red-500">
                Số dư khả dụng không đủ! Số dư khả dụng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(accountBalance)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder="Ghi chú bổ sung"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || hasInsufficientBalance}>
              {isSubmitting ? "Đang tạo..." : "Thêm tiền"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
