"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { deleteCategory } from "@/features/categories/categoriesSlice"
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
import type { Category } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

interface DeleteCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useTranslation("categories")
  const { t: tCommonActions } = useTranslation("common.actions")

  const handleDelete = async () => {
    if (!category) return
    try {
      setIsDeleting(true)
      await dispatch(deleteCategory(category.id)).unwrap()
      toast.success(t("modals.delete.success"))
      onClose()
    } catch (error) {
      toast.error(t("modals.delete.error", { values: { error: String(error) } }))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!category) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("modals.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription
            dangerouslySetInnerHTML={{
              __html: t("modals.delete.description", { values: { categoryName: category.name } }),
            }}
          />
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


