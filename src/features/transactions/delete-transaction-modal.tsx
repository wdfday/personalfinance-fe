"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { deleteTransaction } from "@/features/transactions/transactionsSlice"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslation } from "@/contexts/i18n-context"
import type { Transaction } from "@/types/api"

interface DeleteTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function DeleteTransactionModal({ isOpen, onClose, transaction }: DeleteTransactionModalProps) {
  const dispatch = useAppDispatch()
  const { t } = useTranslation("transactions")
  const { t: tCommonActions } = useTranslation("common.actions")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!transaction) return

    try {
      setIsDeleting(true)
      await dispatch(deleteTransaction(transaction.id)).unwrap()
      toast.success(t("modals.delete.success"))
      onClose()
    } catch (error) {
      toast.error(t("modals.delete.error", { values: { error: String(error) } }))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!transaction) return null

  const description = transaction.description || t("modals.delete.noDescription")
  const amount = `${transaction.amount.toLocaleString()} ${transaction.currency}`

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("modals.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            <span dangerouslySetInnerHTML={{
              __html: t("modals.delete.description", { values: { description: `<strong>${description}</strong>` } }) + ' ' +
                      t("modals.delete.amount", { values: { amount: `<strong>${amount}</strong>` } })
            }} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {tCommonActions("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t("modals.delete.confirming") : t("modals.delete.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

