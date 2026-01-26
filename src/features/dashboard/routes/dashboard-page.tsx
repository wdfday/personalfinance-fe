"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDashboardData } from "@/features/dashboard/dashboardSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { formatDateForAPI } from "@/lib/utils"
import { AccountsOverview } from "@/features/accounts/components/accounts-overview"
import { RecentTransactions } from "@/features/transactions/components/recent-transactions"
import { CalendarEventsWidget } from "@/features/dashboard/components/calendar-events-widget"
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts"

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { accountSummary, transactionSummary, isLoading } = useAppSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardData())
    dispatch(fetchAccounts())
    
    // Fetch transactions trong 30 ngày gần nhất cho charts
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 29) // 30 ngày (bao gồm hôm nay)
    
    dispatch(fetchTransactions({ 
      start_date: formatDateForAPI(startDate),
      end_date: formatDateForAPI(endDate),
      pageSize: 100
    }))
    dispatch(fetchCategories())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <AccountsOverview />
        </div>
        <div>
          <RecentTransactions />
        </div>
        <div>
          <CalendarEventsWidget />
        </div>
      </div>

      {/* Category Breakdown + Monthly Trend */}
      <DashboardCharts />
    </div>
  )
}
