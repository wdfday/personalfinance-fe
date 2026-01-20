"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDashboardData } from "@/features/dashboard/dashboardSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { AccountsOverview } from "@/features/accounts/components/accounts-overview"
import { RecentTransactions } from "@/features/transactions/components/recent-transactions"
import { CalendarEventsWidget } from "@/features/dashboard/components/calendar-events-widget"

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { accountSummary, transactionSummary, isLoading } = useAppSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardData())
    dispatch(fetchAccounts())
    dispatch(fetchTransactions({}))
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountsOverview />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <CalendarEventsWidget />
        </div>
      </div>
    </div>
  )
}
