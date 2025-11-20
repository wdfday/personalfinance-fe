"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { deleteAccount } from "@/features/accounts/accountsSlice"
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
import type { Account } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: Account | null
}

export function DeleteAccountModal({ isOpen, onClose, account }: DeleteAccountModalProps) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useTranslation("accounts")
  const { t: tCommonActions } = useTranslation("common.actions")

  const handleDelete = async () => {
    if (!account) return

    try {
      setIsDeleting(true)
      await dispatch(deleteAccount(account.id)).unwrap()
      toast.success(t("modals.delete.success"))
      onClose()
    } catch (error) {
      toast.error(
        t("modals.delete.error", {
          values: { error: error instanceof Error ? error.message : String(error) },
        }),
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!account) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("modals.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("modals.delete.description", { values: { accountName: account.account_name } })}
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

