"use client"

import { useState } from "react"
import { useAppSelector } from "@/lib/hooks"
import { goalsService } from "@/services/api/services/goals.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Goal } from "@/services/api/types/goals"

const contributeOutSchema = z.object({
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  note: z.string().max(1000).optional(),
})

type ContributeOutForm = z.infer<typeof contributeOutSchema>

interface ContributeOutModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal
  onSuccess?: () => void
}

export function ContributeOutModal({ isOpen, onClose, goal, onSuccess }: ContributeOutModalProps) {
  const { accounts = [] } = useAppSelector((state) => state.accounts)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContributeOutForm>({
    resolver: zodResolver(contributeOutSchema),
    defaultValues: {
      amount: 0,
      note: "",
    },
  })

  const amount = watch("amount") || 0
  const goalBalance = goal.currentAmount
  const hasInsufficientGoalBalance = amount > goalBalance
  const goalAccount = accounts.find(acc => acc.id === goal.accountId)

  const onSubmit = async (data: ContributeOutForm) => {
    // Validate goal balance
    if (data.amount > goal.currentAmount) {
      toast.error(`Số tiền trong goal không đủ. Số tiền hiện tại: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(goal.currentAmount)}`)
      return
    }

    try {
      setIsSubmitting(true)

      // Create GoalContribution (withdrawal) via API
      await goalsService.withdraw(goal.id, data.amount, data.note || undefined)
      toast.success("Rút tiền từ goal thành công!")
      reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error("Lỗi rút tiền từ goal: " + (error instanceof Error ? error.message : String(error)))
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
          <DialogTitle>Rút tiền từ Goal</DialogTitle>
          <DialogDescription>
            Rút tiền từ goal: <strong>{goal.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account Info (Read-only) */}
          {goalAccount && (
            <div className="space-y-2">
              <Label>Tài khoản nhận</Label>
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                {(goalAccount as any).accountName || goalAccount.account_name || 'Unknown'} ({goalAccount.currency})
              </div>
            </div>
          )}

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
            <div className="text-xs text-muted-foreground">
              Số tiền trong goal: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(goalBalance)}
            </div>
            {hasInsufficientGoalBalance && (
              <p className="text-sm text-red-500">
                Số tiền trong goal không đủ! Số tiền hiện tại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: goal.currency }).format(goalBalance)}
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
            <Button type="submit" disabled={isSubmitting || hasInsufficientGoalBalance}>
              {isSubmitting ? "Đang xử lý..." : "Rút tiền"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
