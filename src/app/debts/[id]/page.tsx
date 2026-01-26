"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDebts } from "@/features/debts/debtsSlice"
import { DebtDetail } from "@/features/debts/components/debt-detail"
import type { Debt } from "@/services/api/types/debts"

export default function DebtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { debts = [] } = useAppSelector((state) => state.debts)
  const [debt, setDebt] = useState<Debt | null>(null)

  const debtId = params.id as string

  useEffect(() => {
    if (debts.length === 0) {
      dispatch(fetchDebts())
    }
  }, [dispatch, debts.length])

  useEffect(() => {
    if (debtId && debts.length > 0) {
      const foundDebt = debts.find((d) => d.id === debtId)
      if (foundDebt) {
        setDebt(foundDebt)
      } else {
        // Debt not found, redirect back
        router.push("/debts")
      }
    }
  }, [debtId, debts, router])

  const handleBack = () => {
    router.push("/debts")
  }

  if (!debt) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading debt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <DebtDetail
        debt={debt}
        onClose={handleBack}
      />
    </div>
  )
}
