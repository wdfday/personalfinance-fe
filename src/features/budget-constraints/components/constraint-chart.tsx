"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { budgetConstraintsService } from "@/services/api/services/budget-constraints.service"
import { transactionsService } from "@/services/api/services/transactions.service"
import type { BudgetConstraint } from "@/services/api/types/budget-constraints"
import type { Transaction } from "@/services/api/types/transactions"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const CHART_WIDTH = 640
const CHART_HEIGHT = 350

interface ConstraintChartProps {
  constraintId: string
}

interface Period {
  startDate: Date
  endDate: Date | null
  label: string
  version: BudgetConstraint
}

interface ChartDataPoint {
  period: string
  spent: number
  constraint_amount: number
  min_amount: number
  max_amount: number
  is_flexible: boolean
}

export function ConstraintChart({ constraintId }: ConstraintChartProps) {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1) Fetch constraint history to build version periods
        const historyResponse = await budgetConstraintsService.getHistory(constraintId)
        const allVersions: BudgetConstraint[] = [
          historyResponse.current,
          ...(historyResponse.version_history || []),
        ].sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : new Date(a.created_at).getTime()
          const dateB = b.start_date ? new Date(b.start_date).getTime() : new Date(b.created_at).getTime()
          return dateA - dateB
        })

        const periods: Period[] = allVersions.map((version, index) => {
          const startDate = version.start_date ? new Date(version.start_date) : new Date(version.created_at)
          const nextVersion = index < allVersions.length - 1 ? allVersions[index + 1] : null
          let endDate: Date | null = null
          if (version.end_date) {
            endDate = new Date(version.end_date)
          } else if (nextVersion?.start_date) {
            endDate = new Date(nextVersion.start_date)
          }

          const startLabel = startDate.toLocaleDateString("vi-VN", { month: "short", year: "numeric" })
          const endLabel = endDate ? endDate.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }) : "nay"
          const label = endDate ? `${startLabel} - ${endLabel}` : `Từ ${startLabel}`

          return { startDate, endDate, label, version }
        })

        // 2) Fetch transactions in the full range for this constraint's category
        const categoryId = historyResponse.current.category_id
        const firstStart = periods[0]?.startDate || new Date()
        const lastEnd = periods[periods.length - 1]?.endDate || new Date()

        const txRes = await transactionsService.getAll({
          category_id: categoryId,
          direction: "DEBIT",
          start_date: firstStart.toISOString().split("T")[0],
          end_date: lastEnd ? lastEnd.toISOString().split("T")[0] : undefined,
          limit: 2000,
        })

        const relatedTx: Transaction[] = (txRes.transactions || []).filter((txn) => {
          const amt = typeof txn.base_amount === "number" ? txn.base_amount : txn.amount
          return typeof amt === "number"
        })

        // 3) Group transactions by each constraint version period
        const chartData: ChartDataPoint[] = periods.map((p) => {
          const periodTx = relatedTx.filter((txn) => {
            const txnDate = txn.booking_date ? new Date(txn.booking_date) : new Date(txn.date)
            return txnDate >= p.startDate && (!p.endDate || txnDate < p.endDate)
          })

          const totalSpent = periodTx.reduce((sum, txn) => {
            const v = typeof txn.base_amount === "number" ? txn.base_amount : txn.amount
            return sum + Math.abs(v || 0)
          }, 0)

          const minAmt = p.version.minimum_amount || 0
          const maxAmt = p.version.maximum_amount || 0
          const constraintAmt = p.version.is_flexible ? (maxAmt > 0 ? maxAmt : minAmt) : minAmt

          return {
            period: p.label,
            spent: totalSpent,
            constraint_amount: constraintAmt,
            min_amount: minAmt,
            max_amount: maxAmt,
            is_flexible: !!p.version.is_flexible,
          }
        })

        console.log('[ConstraintChart] fetchData ok: constraintId=', constraintId, 'chartData.length=', chartData.length, 'sample=', chartData[0])
        setData(chartData)
      } catch (err) {
        console.error("Failed to fetch constraint chart data", err)
        setError(err instanceof Error ? err.message : "Failed to load chart data")
      } finally {
        setIsLoading(false)
      }
    }

    if (constraintId) {
      fetchData()
    }
  }, [constraintId])

  console.log('[ConstraintChart] render: constraintId=', constraintId, 'isLoading=', isLoading, 'error=', error, 'data.length=', data.length, 'mounted=', mounted)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending vs Constraint (by version)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending vs Constraint (by version)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            <p>Error loading chart: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending vs Constraint (by version)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No budget data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mounted) {
    console.log('[ConstraintChart] rendering placeholder (not mounted)')
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending vs Constraint (by version)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground/60 text-sm">
            Đang tải biểu đồ…
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log('[ConstraintChart] rendering LineChart, CHART_WIDTH=', CHART_WIDTH, 'CHART_HEIGHT=', CHART_HEIGHT)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload as ChartDataPoint
      return (
        <Card className="border-none shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-3">
            <p className="font-semibold mb-1">{row.period}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Actual spent:</span>
                <span className="font-medium text-blue-500">{formatCurrency(row.spent)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Constraint:</span>
                <span>{formatCurrency(row.constraint_amount)}</span>
              </div>
              {row.is_flexible && row.max_amount > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Range:</span>
                  <span>{formatCurrency(row.min_amount)} – {formatCurrency(row.max_amount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending vs Constraint (by version)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width={CHART_WIDTH} height={CHART_HEIGHT} minWidth={0}>
          <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`
                  }
                  return value.toString()
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="constraint_amount"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
