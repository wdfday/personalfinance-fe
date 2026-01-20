
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomeSummaryResponse } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Calendar, Wallet } from "lucide-react"

interface IncomeStatsProps {
  summary: IncomeSummaryResponse | null
  isLoading: boolean
}

export function IncomeStats({ summary, isLoading }: IncomeStatsProps) {
  if (isLoading || !summary) {
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Monthly Income</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_monthly_income, 'VND')}</div>
          <p className="text-xs text-muted-foreground">
            Projected monthly recurring
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annual Projection</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_yearly_income, 'VND')}</div>
           <p className="text-xs text-muted-foreground">
            Based on current active streams
          </p>
        </CardContent>
      </Card>
      
       <div className="grid grid-cols-2 gap-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium">Active Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold">{summary.active_income_count}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium">Recurring</CardTitle>
               <Calendar className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold">{summary.recurring_income_count}</div>
            </CardContent>
          </Card>
       </div>
    </div>
  )
}
