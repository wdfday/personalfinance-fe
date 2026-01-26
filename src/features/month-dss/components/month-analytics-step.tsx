"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { useMonthAnalyticsData } from "@/hooks/use-month-analytics-data"
import { MonthAnalyticsContent } from "./month-analytics-shared"

interface MonthAnalyticsStepProps {
  monthId: string
  monthStr: string
  onNext: () => void
  onRecalculate: () => void
}

export function MonthAnalyticsStep({
  monthId,
  monthStr,
  onNext,
  onRecalculate,
}: MonthAnalyticsStepProps) {
  const data = useMonthAnalyticsData(monthId, monthStr)

  // Auto-navigate to closing step if month has passed
  useEffect(() => {
    if (!monthStr) return
    
    const currentDate = new Date()
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    // If monthStr < currentMonthStr, automatically go to closing step
    if (monthStr < currentMonthStr) {
      onNext()
    }
  }, [monthStr, onNext])

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data.monthView) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No month data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Budget Analytics</h2>
        {/* Buttons hidden as requested */}
      </div>

      <MonthAnalyticsContent data={data} layout="analytics" />
    </div>
  )
}
