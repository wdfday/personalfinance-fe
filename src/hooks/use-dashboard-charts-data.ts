"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"

export interface DashboardChartsData {
  loading: boolean
  categoryBreakdown: { name: string; value: number; color: string }[]
  monthlyTrend: { date: string; income: number; expenses: number }[]
}

/** Lấy YYYY-MM-DD (local) từ Date. */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function useDashboardChartsData(): DashboardChartsData {
  // Lấy dữ liệu trực tiếp từ Redux store
  const { categories = [] } = useAppSelector((state) => state.categories)
  const { transactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)
  const categoriesLoading = useAppSelector((state) => state.categories.isLoading)

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    // Lấy 30 ngày gần nhất
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 29) // 30 ngày (bao gồm hôm nay)
    start.setHours(0, 0, 0, 0)
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDateObj = new Date(end.getFullYear(), end.getMonth(), end.getDate())

    transactions
      .filter((tx) => tx.direction === "DEBIT")
      .forEach((tx) => {
        // Hỗ trợ cả camelCase và snake_case
        const raw = (tx as any).bookingDate ?? (tx as any).booking_date ?? (tx as any).valueDate ?? (tx as any).value_date ?? (tx as any).date ?? (tx as any).createdAt ?? (tx as any).created_at
        if (!raw) return
        
        // Parse date và normalize
        const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
        if (isNaN(txDate.getTime())) return
        
        // Normalize về local date (bỏ time)
        const txDateNormalized = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate())
        
        // So sánh Date objects thay vì string
        if (txDateNormalized < startDateObj || txDateNormalized > endDateObj) return

        // Hỗ trợ cả camelCase và snake_case
        const cid = (tx as any).userCategoryId ?? (tx as any).user_category_id ?? (tx as any).categoryId ?? (tx as any).category_id ?? "uncategorized"
        const amt = Math.abs(tx.amount ?? 0)
        map.set(cid, (map.get(cid) ?? 0) + amt)
      })

    return Array.from(map.entries())
      .map(([cid, value]) => {
        // Nếu cid là "uncategorized" hoặc không tìm thấy category, hiển thị "Uncategorized"
        if (cid === "uncategorized" || !cid) {
          return {
            name: "Uncategorized",
            value,
            color: "#9E9E9E",
          }
        }
        const cat = categories.find((c) => c.id === cid)
        return {
          name: cat?.name ?? "Uncategorized",
          value,
          color: cat?.color ?? "#9E9E9E",
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [transactions, categories])

  const monthlyTrend = useMemo(() => {
    // Lấy 30 ngày gần nhất
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 29) // 30 ngày (bao gồm hôm nay)
    startDate.setHours(0, 0, 0, 0)
    const startStr = toDateStr(startDate)
    const endStr = toDateStr(endDate)
    
    console.log('[DashboardCharts] MonthlyTrend - Date Range:', {
      start: startStr,
      end: endStr,
      totalTransactions: transactions.length,
      transactionsSample: transactions.slice(0, 5).map(tx => ({
        id: tx.id,
        direction: tx.direction,
        amount: tx.amount,
        rawDate: (tx as any).bookingDate ?? (tx as any).booking_date ?? (tx as any).valueDate ?? (tx as any).value_date ?? (tx as any).date ?? (tx as any).createdAt ?? (tx as any).created_at
      }))
    })
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateObj = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    const dailyMap = new Map<string, { income: number; expenses: number }>()
    // Tạo map cho 30 ngày
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      dailyMap.set(toDateStr(d), { income: 0, expenses: 0 })
    }

    const filteredTransactions: any[] = []
    const skippedTransactions: any[] = []
    
    transactions.forEach((tx) => {
      // Hỗ trợ cả camelCase và snake_case
      const txAny = tx as any
      const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
      
      if (!raw) {
        skippedTransactions.push({ id: tx.id, reason: 'no_date', tx })
        return
      }
      
      // Parse date và normalize về YYYY-MM-DD
      let txDate: Date
      if (typeof raw === 'string') {
        txDate = new Date(raw)
      } else {
        txDate = new Date(raw)
      }
      
      // Kiểm tra date hợp lệ
      if (isNaN(txDate.getTime())) {
        skippedTransactions.push({ id: tx.id, reason: 'invalid_date', raw, tx })
        return
      }
      
      // Normalize về local date (bỏ time)
      const txDateNormalized = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate())
      const dateStr = toDateStr(txDateNormalized)
      
      // So sánh Date objects thay vì string
      if (txDateNormalized < startDateObj || txDateNormalized > endDateObj) {
        skippedTransactions.push({ 
          id: tx.id, 
          reason: 'out_of_range', 
          date: dateStr, 
          start: startStr, 
          end: endStr,
          txDateNormalized: txDateNormalized.toISOString(),
          startDateObj: startDateObj.toISOString(),
          endDateObj: endDateObj.toISOString()
        })
        return
      }
      
      const amt = Math.abs(tx.amount ?? 0)
      const dayData = dailyMap.get(dateStr)
      if (!dayData) {
        skippedTransactions.push({ id: tx.id, reason: 'date_not_in_map', date: dateStr })
        return
      }

      filteredTransactions.push({
        id: tx.id,
        date: dateStr,
        direction: tx.direction,
        amount: amt,
        rawDate: raw
      })

      if (tx.direction === "CREDIT") {
        dayData.income += amt
      } else if (tx.direction === "DEBIT") {
        dayData.expenses += amt
      }
      dailyMap.set(dateStr, dayData)
    })

    console.log('[DashboardCharts] MonthlyTrend - Filtered Transactions:', {
      count: filteredTransactions.length,
      skipped: skippedTransactions.length,
      sample: filteredTransactions.slice(0, 10),
      skippedSample: skippedTransactions.slice(0, 10),
      byDate: Array.from(dailyMap.entries()).filter(([_, v]) => v.income > 0 || v.expenses > 0).slice(0, 10)
    })

    // Sắp xếp theo ngày và tính cumulative (tích lũy)
    const sortedDays = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
    
    // Tính cumulative: mỗi ngày = tổng từ đầu đến ngày đó
    let cumulativeIncome = 0
    let cumulativeExpenses = 0
    
    const result = sortedDays.map(([date, v]) => {
      cumulativeIncome += v.income
      cumulativeExpenses += v.expenses
      return {
        date,
        income: cumulativeIncome,
        expenses: cumulativeExpenses,
        dailyIncome: v.income,
        dailyExpenses: v.expenses,
      }
    })
    
    console.log('[DashboardCharts] MonthlyTrend - Result:', {
      totalDays: result.length,
      daysWithData: result.filter(r => r.dailyIncome > 0 || r.dailyExpenses > 0).length,
      sample: result.filter(r => r.dailyIncome > 0 || r.dailyExpenses > 0).slice(0, 10),
      finalCumulative: {
        income: cumulativeIncome,
        expenses: cumulativeExpenses
      }
    })
    
    return result.map(({ dailyIncome, dailyExpenses, ...rest }) => rest)
  }, [transactions])

  return {
    loading: transactionsLoading || categoriesLoading,
    categoryBreakdown,
    monthlyTrend,
  }
}
