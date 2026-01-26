"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"

export interface BudgetChartsData {
  loading: boolean
  budgetTrend: { date: string; [budgetId: string]: number | string }[]
  budgetTransactions: any[]
  budgetNames: Map<string, string>
}

/** Lấy YYYY-MM-DD (local) từ Date. */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function useBudgetChartsData(): BudgetChartsData {
  // Lấy dữ liệu trực tiếp từ Redux store
  const { transactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)
  const { budgets = [] } = useAppSelector((state) => state.budgets)

  const { budgetTrend, budgetTransactions, budgetNames } = useMemo(() => {
    // Lấy 30 ngày gần nhất
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 29) // 30 ngày (bao gồm hôm nay)
    startDate.setHours(0, 0, 0, 0)
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateObj = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    // Group transactions theo budget và ngày
    // Map: budgetId -> Map<date, amount>
    const budgetDailyMap = new Map<string, Map<string, number>>()
    const dailyMap = new Map<string, { [budgetId: string]: number }>()
    const debitTransactions: any[] = []
    const names = new Map<string, string>()

    // Tạo map tên budget
    budgets.forEach((budget) => {
      names.set(budget.id, budget.name || `Budget ${budget.id.slice(0, 8)}`)
    })
    names.set("uncategorized", "Uncategorized")

    // Tạo map cho 30 ngày
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = toDateStr(d)
      dailyMap.set(dateStr, {})
    }

    transactions
      .filter((tx) => tx.direction === "DEBIT")
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
        
        // Lấy ngày (YYYY-MM-DD)
        const dateStr = toDateStr(txDateNormalized)
        
        // Tìm budget từ links
        const budgetLink = txAny.links?.find((link: any) => link.type === "BUDGET")
        const budgetId = budgetLink?.id || "uncategorized"
        
        // Thêm vào map
        if (!budgetDailyMap.has(budgetId)) {
          budgetDailyMap.set(budgetId, new Map())
        }
        const dailyMapForBudget = budgetDailyMap.get(budgetId)!
        const amt = Math.abs(tx.amount ?? 0)
        dailyMapForBudget.set(dateStr, (dailyMapForBudget.get(dateStr) ?? 0) + amt)
        
        // Lưu transaction để hiển thị
        debitTransactions.push(tx)
      })

    // Sắp xếp days
    const sortedDays = Array.from(dailyMap.keys()).sort()
    
    // Tạo data cho chart: mỗi row là một ngày, mỗi column là một budget
    const chartData = sortedDays.map((date) => {
      const row: any = { date }
      
      // Tính cumulative cho mỗi budget
      budgetDailyMap.forEach((dailyMapForBudget, budgetId) => {
        let cumulative = 0
        sortedDays.forEach((d) => {
          if (d <= date) {
            cumulative += dailyMapForBudget.get(d) ?? 0
          }
        })
        row[budgetId] = cumulative
      })
      
      return row
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
      budgetTrend: chartData,
      budgetTransactions: sortedTransactions,
      budgetNames: names,
    }
  }, [transactions, budgets])

  return {
    loading: transactionsLoading,
    budgetTrend,
    budgetTransactions,
    budgetNames,
  }
}
