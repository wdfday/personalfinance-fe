"use client"

import { useState, useEffect, useMemo } from "react"
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
import { useIncomeChartsData } from "@/hooks/use-income-charts-data"
import { formatCurrency } from "@/lib/utils"
import { Calendar, TrendingUp } from "lucide-react"

export function IncomeCharts() {
  const [mounted, setMounted] = useState(false)
  const { loading, incomeTrend, incomeTransactions, incomeProfileNames } = useIncomeChartsData()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lấy danh sách income profile IDs từ data
  const incomeProfileIds = useMemo(() => {
    if (incomeTrend.length === 0) return []
    const ids = new Set<string>()
    incomeTrend.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "date") {
          ids.add(key)
        }
      })
    })
    return Array.from(ids)
  }, [incomeTrend])

  // Màu sắc cho các lines
  const colors = [
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#84cc16", // lime
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Trend</CardTitle>
          <CardDescription>Thu nhập tích lũy theo tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
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
          <CardTitle>Income Trend</CardTitle>
          <CardDescription>Thu nhập tích lũy theo tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground/60 text-sm">
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
          <CardTitle>Income Trend</CardTitle>
          <CardDescription>Thu nhập theo tháng theo từng nguồn</CardDescription>
        </CardHeader>
        <CardContent>
          {incomeTrend.length > 0 && incomeProfileIds.length > 0 ? (
            <ChartContainer
              config={{}}
              className="h-[300px] w-full"
              chartWidth={600}
              chartHeight={300}
            >
              <LineChart data={incomeTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    // value là YYYY-MM
                    const [year, month] = value.split('-')
                    return `${month}/${year.slice(2)}`
                  }}
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  labelFormatter={(value) => {
                    // value là YYYY-MM
                    const [year, month] = value.split('-')
                    return `Tháng ${month}/${year}`
                  }}
                  formatter={(value: number) => {
                    return new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(value)
                  }}
                />
                <Legend />
                {incomeProfileIds.map((profileId, index) => (
                  <Line
                    key={profileId}
                    type="monotone"
                    dataKey={profileId}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name={incomeProfileNames.get(profileId) || `Income ${profileId.slice(0, 8)}`}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Chưa có dữ liệu thu nhập
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Income Transactions</CardTitle>
          <CardDescription>Danh sách giao dịch thu nhập</CardDescription>
        </CardHeader>
        <CardContent>
          {incomeTransactions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              Chưa có giao dịch thu nhập
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {incomeTransactions.map((tx) => {
                const txAny = tx as any
                const amount = txAny.base_amount ?? txAny.amount ?? 0
                const currency = txAny.currency ?? "VND"
                const date = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
                const incomeProfileLink = txAny.links?.find((link: any) => link.type === "INCOME_PROFILE")
                const incomeProfileId = incomeProfileLink?.id || "uncategorized"
                const incomeProfileName = incomeProfileNames.get(incomeProfileId) || "Uncategorized"

                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {txAny.description || "Income Transaction"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {incomeProfileName}
                          </span>
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
                    <div className="font-semibold text-sm ml-3 text-green-600 shrink-0">
                      +{formatCurrency(Math.abs(amount), currency)}
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
