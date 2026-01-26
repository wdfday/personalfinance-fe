"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { transactionsService } from "@/services/api/services/transactions.service"
import type { Transaction } from "@/services/api/types/transactions"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface DebtPayoffChartProps {
  debtId: string
  currency: string
}

interface ChartDataPoint {
  month: string
  amount: number
  cumulative: number
}

export function DebtPayoffChart({ debtId, currency }: DebtPayoffChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all transactions
        const response = await transactionsService.getAll({
          limit: 1000,
        })

        // Filter transactions linked to this debt
        const debtPayoffs = response.transactions.filter((tx: Transaction) => {
          if (!tx.links || tx.links.length === 0) return false
          return tx.links.some((link) => link.type === "DEBT" && link.id === debtId)
        })

        if (debtPayoffs.length === 0) {
          setData([])
          return
        }

        // Group by month and calculate cumulative
        const monthlyData = new Map<string, number>()

        debtPayoffs.forEach((tx: Transaction) => {
          const date = new Date(tx.booking_date || tx.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          const amount = Math.abs(tx.base_amount || tx.amount)
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + amount)
        })

        // Convert to array and sort by month
        const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        )

        // Build chart data with cumulative
        let cumulative = 0
        const chartData: ChartDataPoint[] = sortedMonths.map(([monthKey, amount]) => {
          cumulative += amount
          const date = new Date(monthKey + "-01")
          const monthLabel = date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" })
          return {
            month: monthLabel,
            amount,
            cumulative,
          }
        })

        setData(chartData)
      } catch (err: any) {
        setError(err.message || "Failed to load payoff history")
      } finally {
        setIsLoading(false)
      }
    }

    if (debtId) {
      fetchData()
    }
  }, [debtId])

  const chartConfig = {
    amount: {
      label: "Monthly Payment",
      color: "hsl(var(--chart-1))",
    },
    cumulative: {
      label: "Cumulative Total",
      color: "hsl(var(--chart-2))",
    },
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Debt Payoff Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
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
          <CardTitle className="text-lg">Debt Payoff Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Debt Payoff Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Chưa có dữ liệu thanh toán
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Debt Payoff Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]" chartWidth={600} chartHeight={350}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              dataKey="month"
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any, name: any) => {
                    if (typeof value === "number") {
                      return formatCurrency(value, currency)
                    }
                    return value
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={false}
              name="Monthly"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="var(--color-cumulative)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Cumulative"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
