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
import type { Transaction } from "@/services/api"

interface DeleteTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function DeleteTransactionModal({ isOpen, onClose, transaction }: DeleteTransactionModalProps) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!transaction) return

    try {
      setIsDeleting(true)
      await dispatch(deleteTransaction(transaction.id)).unwrap()
      toast.success("Xóa giao dịch thành công!")
      onClose()
    } catch (error) {
      toast.error("Lỗi xóa giao dịch: " + error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!transaction) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc muốn xóa giao dịch này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Giao dịch <strong>{transaction.description || 'Không có mô tả'}</strong> 
            {' '}với số tiền <strong>{transaction.amount.toLocaleString()} {transaction.currency}</strong> sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xóa..." : "Xóa giao dịch"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

