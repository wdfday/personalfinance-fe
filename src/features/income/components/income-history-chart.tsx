"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface IncomeHistoryChartProps {
  incomeId: string
  currency: string
}

/** Lấy YYYY-MM (tháng) từ Date. */
function toMonthStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function IncomeHistoryChart({ incomeId, currency }: IncomeHistoryChartProps) {
  const { transactions = [], isLoading: transactionsLoading } = useAppSelector((state) => state.transactions)

  const incomeTrend = useMemo(() => {
    // Filter transactions có link với income profile này
    const relatedTransactions = transactions.filter((tx) => {
      if (tx.direction !== "CREDIT") return false
      
      const txAny = tx as any
      // Check links array
      if (txAny.links && txAny.links.some((link: any) => 
        link.type === 'INCOME_PROFILE' && link.id === incomeId
      )) {
        return true
      }
      return false
    })

    // Group theo tháng
    const monthlyMap = new Map<string, number>()
    const allMonths = new Set<string>()

    relatedTransactions.forEach((tx) => {
      const txAny = tx as any
      const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
      if (!raw) return
      
      // Parse date và normalize
      const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
      if (isNaN(txDate.getTime())) return
      
      // Lấy tháng (YYYY-MM)
      const monthStr = toMonthStr(txDate)
      allMonths.add(monthStr)
      const amt = Math.abs(tx.amount ?? 0)
      monthlyMap.set(monthStr, (monthlyMap.get(monthStr) ?? 0) + amt)
    })

    // Sắp xếp months
    const sortedMonths = Array.from(allMonths).sort()
    
    // Tính cumulative: mỗi tháng = tổng từ đầu đến tháng đó
    let cumulativeIncome = 0
    
    return sortedMonths.map((month) => {
      const monthlyIncome = monthlyMap.get(month) ?? 0
      cumulativeIncome += monthlyIncome
      return {
        date: month,
        income: cumulativeIncome,
      }
    })
  }, [transactions, incomeId])

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">History & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="animate-pulse">Đang tải...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (incomeTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">History & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Chưa có dữ liệu thu nhập
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">History & Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            income: { label: "Thu nhập", color: "hsl(var(--chart-1))" },
          }}
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
                  currency: currency || "VND",
                }).format(value)
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
              name="Thu nhập"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
