"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"

export interface IncomeChartsData {
  loading: boolean
  incomeTrend: { date: string; [incomeProfileId: string]: number | string }[]
  incomeTransactions: any[]
  incomeProfileNames: Map<string, string>
}

/** Lấy YYYY-MM (tháng) từ Date. */
function toMonthStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function useIncomeChartsData(): IncomeChartsData {
  // Lấy dữ liệu trực tiếp từ Redux store
  const { transactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)
  const { items: incomeProfiles = [] } = useAppSelector((state) => state.income)

  const { incomeTrend, incomeTransactions, incomeProfileNames } = useMemo(() => {
    // Group transactions theo income profile và tháng
    // Map: incomeProfileId -> Map<month, amount>
    const profileMonthlyMap = new Map<string, Map<string, number>>()
    const allMonths = new Set<string>()
    const creditTransactions: any[] = []
    const profileNames = new Map<string, string>()

    // Tạo map tên income profile
    incomeProfiles.forEach((profile) => {
      profileNames.set(profile.id, profile.source || `Income ${profile.id.slice(0, 8)}`)
    })
    profileNames.set("uncategorized", "Uncategorized")

    transactions
      .filter((tx) => tx.direction === "CREDIT")
      .forEach((tx) => {
        // Hỗ trợ cả camelCase và snake_case
        const txAny = tx as any
        const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
        if (!raw) return
        
        // Parse date và normalize
        const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
        if (isNaN(txDate.getTime())) return
        
        // Lấy tháng (YYYY-MM)
        const monthStr = toMonthStr(txDate)
        allMonths.add(monthStr)
        
        // Tìm income profile từ links
        const incomeProfileLink = txAny.links?.find((link: any) => link.type === "INCOME_PROFILE")
        const incomeProfileId = incomeProfileLink?.id || "uncategorized"
        
        // Thêm vào map
        if (!profileMonthlyMap.has(incomeProfileId)) {
          profileMonthlyMap.set(incomeProfileId, new Map())
        }
        const monthlyMap = profileMonthlyMap.get(incomeProfileId)!
        const amt = Math.abs(tx.amount ?? 0)
        monthlyMap.set(monthStr, (monthlyMap.get(monthStr) ?? 0) + amt)
        
        // Lưu transaction để hiển thị
        creditTransactions.push(tx)
      })

    // Sắp xếp months
    const sortedMonths = Array.from(allMonths).sort()
    
    // Tạo data cho chart: mỗi row là một tháng, mỗi column là một income profile
    // Không tính cumulative, chỉ hiển thị tổng của từng tháng
    const chartData = sortedMonths.map((month) => {
      const row: any = { date: month }
      
      // Lấy tổng của từng tháng cho mỗi income profile (không cumulative)
      profileMonthlyMap.forEach((monthlyMap, profileId) => {
        row[profileId] = monthlyMap.get(month) ?? 0
      })
      
      return row
    })

    // Sắp xếp transactions theo date (mới nhất trước)
    const sortedTransactions = creditTransactions.sort((a, b) => {
      const dateA = (a as any).bookingDate ?? (a as any).booking_date ?? (a as any).valueDate ?? (a as any).value_date
      const dateB = (b as any).bookingDate ?? (b as any).booking_date ?? (b as any).valueDate ?? (b as any).value_date
      if (!dateA || !dateB) return 0
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return {
      incomeTrend: chartData,
      incomeTransactions: sortedTransactions,
      incomeProfileNames: profileNames,
    }
  }, [transactions, incomeProfiles])

  return {
    loading: transactionsLoading,
    incomeTrend,
    incomeTransactions,
    incomeProfileNames,
  }
}
