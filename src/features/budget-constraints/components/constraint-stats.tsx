"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetConstraintSummary } from "@/services/api/types/budget-constraints"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, FileText, CheckCircle } from "lucide-react"

interface ConstraintStatsProps {
  summary: BudgetConstraintSummary | null
  isLoading: boolean
}

export function ConstraintStats({ summary, isLoading }: ConstraintStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-2 hover:border-primary/20 transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Total Mandatory</CardTitle>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(summary.total_mandatory_expenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Minimum required spending</p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary/20 transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Total Constraints</CardTitle>
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.count}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.active_count} active
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary/20 transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Fixed</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.total_fixed}</div>
          <p className="text-xs text-muted-foreground mt-1">Non-flexible constraints</p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary/20 transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Flexible</CardTitle>
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.total_flexible}</div>
          <p className="text-xs text-muted-foreground mt-1">Adjustable constraints</p>
        </CardContent>
      </Card>
    </div>
  )
}
