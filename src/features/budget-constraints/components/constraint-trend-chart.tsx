"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useConstraintChartsData } from "@/hooks/use-constraint-charts-data"
import { formatCurrency } from "@/lib/utils"
import { Calendar, TrendingDown } from "lucide-react"

interface ConstraintTrendChartProps {
  budgetId: string | null
  budgetStartDate?: string
  budgetEndDate?: string
}

export function ConstraintTrendChart({ budgetId, budgetStartDate, budgetEndDate }: ConstraintTrendChartProps) {
  const [mounted, setMounted] = useState(false)
  const { loading, constraintTrend, constraintTransactions } = useConstraintChartsData(budgetId, budgetStartDate, budgetEndDate)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
          <CardDescription>Chi tiêu tích lũy trong khoảng thời gian của budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="animate-pulse">Đang tải...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
          <CardDescription>Chi tiêu tích lũy trong khoảng thời gian của budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground/60 text-sm">
            Đang tải…
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
          <CardDescription>Chi tiêu tích lũy trong khoảng thời gian của budget</CardDescription>
        </CardHeader>
        <CardContent>
          {constraintTrend.length > 0 ? (
            <ChartContainer
              config={{
                expenses: { label: "Chi tiêu", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px] w-full"
              chartWidth={600}
              chartHeight={300}
            >
              <LineChart data={constraintTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  }}
                  formatter={(value: number) => {
                    return new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(value)
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#ef4444" }}
                  name="Chi tiêu"
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Chưa có dữ liệu chi tiêu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Constraint Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Constraint Transactions</CardTitle>
          <CardDescription>Danh sách giao dịch chi tiêu</CardDescription>
        </CardHeader>
        <CardContent>
          {constraintTransactions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              Chưa có giao dịch chi tiêu
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {constraintTransactions.map((tx) => {
                const txAny = tx as any
                const amount = txAny.base_amount ?? txAny.amount ?? 0
                const currency = txAny.currency ?? "VND"
                const date = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at

                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {txAny.description || "Expense Transaction"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {date && (
                            <>
                              <Calendar className="h-3 w-3" />
                              {new Date(date).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm ml-3 text-red-600 shrink-0">
                      -{formatCurrency(Math.abs(amount), currency)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
