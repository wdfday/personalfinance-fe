"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"

export interface ConstraintChartsData {
  loading: boolean
  constraintTrend: { date: string; expenses: number }[]
  constraintTransactions: any[]
}

/** Lấy YYYY-MM-DD (local) từ Date. */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function useConstraintChartsData(budgetId: string | null, budgetStartDate?: string, budgetEndDate?: string): ConstraintChartsData {
  // Lấy dữ liệu trực tiếp từ Redux store
  const { transactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)
  const { budgets = [] } = useAppSelector((state) => state.budgets)

  const { constraintTrend, constraintTransactions } = useMemo(() => {
    if (!budgetId) {
      return {
        constraintTrend: [],
        constraintTransactions: [],
      }
    }

    // Tìm budget để lấy date range
    const budget = budgets.find(b => b.id === budgetId)
    if (!budget) {
      return {
        constraintTrend: [],
        constraintTransactions: [],
      }
    }

    // Sử dụng date range của budget
    const startDate = new Date(budget.start_date)
    startDate.setHours(0, 0, 0, 0)
    
    let endDate: Date
    if (budget.end_date) {
      endDate = new Date(budget.end_date)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Nếu không có end_date, tính đến cuối tháng của start_date
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
    }
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateObj = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    const dailyMap = new Map<string, number>()
    // Tạo map cho tất cả các ngày trong budget period
    const curr = new Date(startDate)
    while (curr <= endDate) {
      dailyMap.set(toDateStr(curr), 0)
      curr.setDate(curr.getDate() + 1)
    }

    const debitTransactions: any[] = []

    transactions
      .filter((tx) => {
        if (tx.direction !== "DEBIT") return false
        
        // Filter theo budget links
        const txAny = tx as any
        if (txAny.links && txAny.links.some((link: any) => 
          link.type === 'BUDGET' && link.id === budgetId
        )) {
          return true
        }
        return false
      })
      .forEach((tx) => {
        // Hỗ trợ cả camelCase và snake_case
        const txAny = tx as any
        const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
        if (!raw) return
        
        // Parse date và normalize
        const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
        if (isNaN(txDate.getTime())) return
        
        // Normalize về local date (bỏ time)
        const txDateNormalized = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate())
        
        // So sánh Date objects thay vì string
        if (txDateNormalized < startDateObj || txDateNormalized > endDateObj) return
        
        const dateStr = toDateStr(txDateNormalized)
        const amt = Math.abs(tx.amount ?? 0)
        const dayData = dailyMap.get(dateStr)
        if (dayData !== undefined) {
          dailyMap.set(dateStr, dayData + amt)
        }
        
        // Lưu transaction để hiển thị
        debitTransactions.push(tx)
      })

    // Sắp xếp theo ngày và tính cumulative (tích lũy)
    const sortedDays = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
    
    // Tính cumulative: mỗi ngày = tổng từ đầu đến ngày đó
    let cumulativeExpenses = 0
    
    const trend = sortedDays.map(([date, dailyExpenses]) => {
      cumulativeExpenses += dailyExpenses
      return {
        date,
        expenses: cumulativeExpenses,
      }
    })

    // Sắp xếp transactions theo date (mới nhất trước)
    const sortedTransactions = debitTransactions.sort((a, b) => {
      const txAnyA = a as any
      const txAnyB = b as any
      const dateA = txAnyA.bookingDate ?? txAnyA.booking_date ?? txAnyA.valueDate ?? txAnyA.value_date ?? txAnyA.date ?? txAnyA.createdAt ?? txAnyA.created_at
      const dateB = txAnyB.bookingDate ?? txAnyB.booking_date ?? txAnyB.valueDate ?? txAnyB.value_date ?? txAnyB.date ?? txAnyB.createdAt ?? txAnyB.created_at
      if (!dateA || !dateB) return 0
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return {
      constraintTrend: trend,
      constraintTransactions: sortedTransactions,
    }
  }, [transactions, budgetId, budgets])

  return {
    loading: transactionsLoading,
    constraintTrend,
    constraintTransactions,
  }
}
