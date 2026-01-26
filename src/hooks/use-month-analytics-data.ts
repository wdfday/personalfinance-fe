"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import monthService from "@/services/api/services/month.service"
import { budgetsService } from "@/services/api/services/budgets.service"
import { transactionsService } from "@/services/api/services/transactions.service"
import { goalsService } from "@/services/api/services/goals.service"
import type { MonthViewResponse } from "@/services/api/types/month"
import type { Budget } from "@/services/api/types/budgets"
import type { Transaction } from "@/services/api/types/transactions"
import type { Goal } from "@/services/api/types/goals"
import type { Debt } from "@/services/api/types/debts"

export function getPreviousMonthString(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number)
  const d = new Date(y, m - 1, 1)
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export interface MonthAnalyticsData {
  loading: boolean
  monthView: MonthViewResponse | null
  previousMonthView: MonthViewResponse | null
  monthStr: string
  activeBudgets: Budget[]
  transactions: Transaction[]
  goals: Goal[]
  debts: Debt[]
  categories: { id: string; name: string }[]
  goalAllocations: Record<string, number>
  goalContributions: Record<string, number>
  debtAllocations: Record<string, number>
  debtPayments: Record<string, number>
  incomeChange: number | null
  categoryBreakdown: { name: string; value: number; color: string }[]
  monthlyTrend: { date: string; income: number; expenses: number }[]
  totalSavingsTarget: number
  totalDebtPayment: number
  projectedOutcomes: {
    monthlySavings: number
    monthlyDebtReduction: number
    monthsToEmergencyFund: number | null
  } | null
  allocationPct: number
  getCategoryName: (tx: Transaction) => string
}

export function useMonthAnalyticsData(
  monthId: string | null,
  monthStr: string
): MonthAnalyticsData {
  const { goals } = useAppSelector((s) => s.goals)
  const { debts } = useAppSelector((s) => s.debts)
  const categoriesState = useAppSelector((s) => s.categories)
  const categories = categoriesState?.categories ?? []

  const [monthView, setMonthView] = useState<MonthViewResponse | null>(null)
  const [previousMonthView, setPreviousMonthView] = useState<MonthViewResponse | null>(null)
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goalContributions, setGoalContributions] = useState<Record<string, number>>({})
  const [goalAllocations, setGoalAllocations] = useState<Record<string, number>>({})
  const [debtPayments, setDebtPayments] = useState<Record<string, number>>({})
  const [debtAllocations, setDebtAllocations] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Auto-create month if not found (404)
        const current = await monthService.getMonthViewOrCreate(monthStr)
        setMonthView(current)

        if (current.goal_allocations && Object.keys(current.goal_allocations).length > 0) {
          setGoalAllocations(current.goal_allocations)
        } else {
          const m: Record<string, number> = {}
          current.categories.forEach((cat) => {
            if (cat.goal_target && cat.assigned > 0) {
              const g = goals.find(
                (x) => Math.abs(x.targetAmount - cat.goal_target!) < cat.goal_target! * 0.1
              )
              if (g) m[g.id] = (m[g.id] || 0) + cat.assigned
            }
          })
          setGoalAllocations(m)
        }

        if (current.debt_allocations && Object.keys(current.debt_allocations).length > 0) {
          setDebtAllocations(current.debt_allocations)
        } else {
          const m: Record<string, number> = {}
          current.categories.forEach((cat) => {
            if (cat.debt_min_payment && cat.assigned > 0) {
              const d = debts.find(
                (x) => Math.abs(x.minimum_payment - cat.debt_min_payment!) < 1000
              )
              if (d) m[d.id] = (m[d.id] || 0) + cat.assigned
            }
          })
          setDebtAllocations(m)
        }

        try {
          const prev = await monthService.getMonthView(getPreviousMonthString(monthStr))
          setPreviousMonthView(prev)
        } catch {
          setPreviousMonthView(null)
        }

        const budgetsRes = await budgetsService.getActive()
        const all = budgetsRes.budgets || []
        const monthStart = new Date(current.start_date)
        const monthEnd = new Date(current.end_date)
        const filtered = all.filter((b) => {
          const start = new Date(b.start_date)
          const end = b.end_date ? new Date(b.end_date) : new Date("2099-12-31")
          return start <= monthEnd && end >= monthStart
        })
        setActiveBudgets(filtered)

        // Fetch transactions từ đầu tháng đến ngày hiện tại
        // Đảm bảo format YYYY-MM-DD (không có time)
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        // Parse start_date để đảm bảo format đúng
        let startDateStr = current.start_date
        if (startDateStr && startDateStr.includes('T')) {
          startDateStr = startDateStr.split('T')[0]
        }
        
        const txRes = await transactionsService.getAll({
          start_date: startDateStr,
          end_date: todayStr, // Chỉ lấy đến hôm nay, không phải end_date của month
          pageSize: 100,
        })
        const txs = txRes.transactions || []
        
        setTransactions(txs)

        const goalMap: Record<string, number> = {}
        const debtMap: Record<string, number> = {}

        goals.forEach((goal) => {
          const linked = txs.filter((tx) =>
            tx.links?.some((l) => l.type === "GOAL" && l.id === goal.id)
          )
          const sum = linked
            .filter((tx) => tx.direction === "DEBIT")
            .reduce((s, tx) => s + Math.abs(tx.amount || 0), 0)
          goalMap[goal.id] = sum
        })
        debts.forEach((debt) => {
          const linked = txs.filter((tx) =>
            tx.links?.some((l) => l.type === "DEBT" && l.id === debt.id)
          )
          const sum = linked
            .filter((tx) => tx.direction === "DEBIT")
            .reduce((s, tx) => s + Math.abs(tx.amount || 0), 0)
          debtMap[debt.id] = sum
        })

        for (const goal of goals.filter((g) => g.status === "active")) {
          try {
            const cr = await goalsService.getContributions(goal.id)
            const inMonth = cr.contributions.filter((c) => {
              const d = new Date(c.createdAt)
              return (
                d >= new Date(current.start_date) && d <= new Date(current.end_date)
              )
            })
            const net = inMonth.reduce(
              (s, c) => s + (c.type === "deposit" ? c.amount : -c.amount),
              0
            )
            if (net > 0) goalMap[goal.id] = (goalMap[goal.id] || 0) + net
          } catch {}
        }
        setGoalContributions(goalMap)
        setDebtPayments(debtMap)
      } catch (e) {
        console.error("Month analytics fetch error", e)
      } finally {
        setLoading(false)
      }
    }

    if (monthId && monthStr) fetchData()
  }, [monthId, monthStr, goals, debts])

  const incomeChange = useMemo(() => {
    if (!monthView || !previousMonthView || previousMonthView.income === 0) return null
    return ((monthView.income - previousMonthView.income) / previousMonthView.income) * 100
  }, [monthView, previousMonthView])

  const categoryBreakdown = useMemo(() => {
    if (!monthView) return []
    
    const map = new Map<string, number>()
    const monthStart = new Date(monthView.start_date)
    monthStart.setHours(0, 0, 0, 0)
    const monthEnd = new Date() // Ngày hiện tại
    monthEnd.setHours(23, 59, 59, 999)
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate())
    const endDateObj = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate())
    
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
        
        // So sánh Date objects - chỉ lấy transactions trong tháng hiện tại
        if (txDateNormalized < startDateObj || txDateNormalized > endDateObj) return
        
        // Check userCategoryId first (user-selected), then fallback to category_id
        const cid = txAny.userCategoryId ?? txAny.user_category_id ?? tx.category_id ?? "uncategorized"
        map.set(cid, (map.get(cid) || 0) + Math.abs(tx.amount || 0))
      })
    return Array.from(map.entries())
      .map(([cid, value]) => {
        const cat = categories.find((c) => c.id === cid)
        return {
          name: cat?.name || "Uncategorized",
          value,
          color: cat?.color || "#9E9E9E",
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [transactions, categories, monthView])

  const monthlyTrend = useMemo(() => {
    if (!monthView) return []
    
    // Lấy từ đầu tháng đến ngày hiện tại
    const startDate = new Date(monthView.start_date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date() // Ngày hiện tại
    endDate.setHours(23, 59, 59, 999)
    
    // Convert to Date objects for comparison
    const startDateObj = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateObj = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    
    // Tạo map để nhóm transactions theo ngày
    const dailyMap = new Map<string, { income: number; expenses: number }>()
    
    // Khởi tạo tất cả các ngày từ đầu tháng đến hôm nay với giá trị 0
    const curr = new Date(startDate)
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0] // YYYY-MM-DD
      dailyMap.set(dateStr, { income: 0, expenses: 0 })
      curr.setDate(curr.getDate() + 1)
    }
    
    // Tính tổng income và expenses cho mỗi ngày từ transactions
    transactions.forEach((tx) => {
      // Hỗ trợ cả camelCase và snake_case
      const txAny = tx as any
      const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
      if (!raw) return
      
      // Parse date và normalize
      const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
      if (isNaN(txDate.getTime())) return
      
      // Normalize về local date (bỏ time)
      const txDateNormalized = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate())
      
      // So sánh Date objects - chỉ lấy transactions trong tháng hiện tại
      if (txDateNormalized < startDateObj || txDateNormalized > endDateObj) return
      
      const dateStr = txDateNormalized.toISOString().split('T')[0] // YYYY-MM-DD
      const dayData = dailyMap.get(dateStr)
      if (!dayData) return
      
      if (tx.direction === "CREDIT") {
        dayData.income += Math.abs(tx.amount || 0)
      } else if (tx.direction === "DEBIT") {
        dayData.expenses += Math.abs(tx.amount || 0)
      }
      
      dailyMap.set(dateStr, dayData)
    })
    
    // Tính cumulative: mỗi ngày = tổng từ đầu tháng đến ngày đó
    const sortedDays = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
    
    let cumulativeIncome = 0
    let cumulativeExpenses = 0
    
    const data = sortedDays.map(([date, values]) => {
      cumulativeIncome += values.income
      cumulativeExpenses += values.expenses
      return {
        date,
        income: cumulativeIncome,
        expenses: cumulativeExpenses,
      }
    })
    
    return data
  }, [transactions, monthView])

  const totalSavingsTarget = useMemo(
    () =>
      goals
        .filter((g) => g.status === "active")
        .reduce(
          (s, g) => s + Math.max(0, (g.targetAmount || 0) - (g.currentAmount || 0)),
          0
        ),
    [goals]
  )

  const totalDebtPayment = useMemo(
    () =>
      debts
        .filter((d) => d.status === "active")
        .reduce((s, d) => s + (d.minimum_payment || 0), 0),
    [debts]
  )

  const projectedOutcomes = useMemo(() => {
    if (!monthView) return null
    const monthlySavings = goals
      .filter((g) => g.status === "active")
      .reduce((s, g) => {
        const rem = (g.targetAmount || 0) - (g.currentAmount || 0)
        if (rem <= 0 || !g.targetDate) return s
        const end = new Date(g.targetDate)
        const months = Math.max(
          1,
          Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44))
        )
        return s + rem / months
      }, 0)
    const avgInterest = debts
      .filter((d) => d.status === "active")
      .reduce(
        (s, d) =>
          s + ((d.current_balance || 0) * (d.interest_rate || 0)) / 100 / 12,
        0
      )
    const monthlyDebtReduction = totalDebtPayment - avgInterest
    const emergency = goals.find(
      (g) =>
        g.status === "active" &&
        (g.name?.toLowerCase().includes("emergency") ||
          g.name?.toLowerCase().includes("khẩn cấp"))
    )
    let monthsToEmergency: number | null = null
    if (emergency && monthlySavings > 0) {
      const rem = (emergency.targetAmount || 0) - (emergency.currentAmount || 0)
      if (rem > 0) monthsToEmergency = Math.ceil(rem / monthlySavings)
    }
    return { monthlySavings, monthlyDebtReduction, monthsToEmergencyFund: monthsToEmergency }
  }, [monthView, goals, debts, totalDebtPayment])

  const allocationPct =
    monthView && monthView.income > 0 ? (monthView.budgeted / monthView.income) * 100 : 0

  const getCategoryName = (tx: Transaction) => {
    const cid = (tx as { userCategoryId?: string }).userCategoryId || tx.category_id
    return categories.find((c) => c.id === cid)?.name || "Uncategorized"
  }

  return {
    loading,
    monthView,
    previousMonthView,
    monthStr,
    activeBudgets,
    transactions,
    goals,
    debts,
    categories,
    goalAllocations,
    goalContributions,
    debtAllocations,
    debtPayments,
    incomeChange,
    categoryBreakdown,
    monthlyTrend,
    totalSavingsTarget,
    totalDebtPayment,
    projectedOutcomes,
    allocationPct,
    getCategoryName,
  }
}
