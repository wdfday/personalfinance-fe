"use client"

import { useMemo, useState, useEffect } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import type { Budget } from "@/services/api/types/budgets"
import { formatCurrency } from "@/lib/utils"

interface BudgetMonthLineChartProps {
  budget: Budget | null
}

interface ChartPoint {
  date: string
  dayLabel: string
  cumulativeSpent: number
  dailySpent: number
}

function getMonthRange(budget: Budget) {
  const start = new Date(budget.start_date)
  let end: Date
  if (budget.end_date) {
    end = new Date(budget.end_date)
  } else {
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
  }
  const startStr = start.toISOString().split("T")[0]
  const endStr = end.toISOString().split("T")[0]
  return { start, end, startStr, endStr }
}

const CHART_WIDTH = 640
const CHART_HEIGHT = 280

export function BudgetMonthLineChart({ budget }: BudgetMonthLineChartProps) {
  const [mounted, setMounted] = useState(false)
  const transactions = useAppSelector((state) => state.transactions.transactions)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = useMemo(() => {
    if (!budget) return []

    const { start, end, startStr, endStr } = getMonthRange(budget)
    const linked = transactions.filter(
      (tx) =>
        tx.links?.some(
          (l) => l.type === "BUDGET" && l.id === budget.id
        ) ?? false
    )
    console.log('[BudgetMonthLineChart] budget.id=', budget.id, 'transactions=', transactions.length, 'linked=', linked.length, 'range=', startStr, endStr)

    const dayMap = new Map<string, number>()
    for (const tx of linked) {
      // Hỗ trợ cả camelCase và snake_case
      const txAny = tx as any
      const raw = txAny.bookingDate ?? txAny.booking_date ?? txAny.valueDate ?? txAny.value_date ?? txAny.date ?? txAny.createdAt ?? txAny.created_at
      if (!raw) continue
      
      // Parse date và normalize
      const txDate = typeof raw === 'string' ? new Date(raw) : new Date(raw)
      if (isNaN(txDate.getTime())) continue
      
      // Lấy YYYY-MM-DD
      const d = txDate.toISOString().split("T")[0]
      if (d < startStr || d > endStr) continue
      
      const amt = Math.abs(
        txAny.base_amount ?? txAny.amount ?? 0
      )
      dayMap.set(d, (dayMap.get(d) ?? 0) + amt)
    }

    const points: ChartPoint[] = []
    const curr = new Date(start)
    let cumulative = 0
    while (curr <= end) {
      const dStr = curr.toISOString().split("T")[0]
      const daily = dayMap.get(dStr) ?? 0
      cumulative += daily
      points.push({
        date: dStr,
        dayLabel: curr.getDate().toString(),
        cumulativeSpent: cumulative,
        dailySpent: daily,
      })
      curr.setDate(curr.getDate() + 1)
    }
    console.log('[BudgetMonthLineChart] data.length=', points.length, 'sample=', points.slice(0, 3))
    return points
  }, [budget, transactions])

  console.log('[BudgetMonthLineChart] render: budget=', !!budget, 'data.length=', data.length, 'mounted=', mounted)

  if (!budget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chi tiêu theo tháng (theo budget)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">Chưa có budget để hiển thị biểu đồ</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chi tiêu theo tháng (theo budget)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">Không có dữ liệu giao dịch trong tháng</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <Card className="border-none shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-3">
          <p className="font-semibold mb-1">{row.date}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Chi tiêu lũy kế:</span>
              <span className="font-medium">{formatCurrency(row.cumulativeSpent)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Hạn mức:</span>
              <span>{formatCurrency(budget.amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mounted) {
    console.log('[BudgetMonthLineChart] rendering placeholder (not mounted)')
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chi tiêu theo tháng (theo budget)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[280px] flex items-center justify-center text-muted-foreground/60 text-sm">
            Đang tải biểu đồ…
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log('[BudgetMonthLineChart] rendering LineChart, CHART_WIDTH=', CHART_WIDTH, 'CHART_HEIGHT=', CHART_HEIGHT)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Chi tiêu theo tháng (theo budget)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width={CHART_WIDTH} height={CHART_HEIGHT} minWidth={0}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
                  return String(v)
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={budget.amount}
                stroke="hsl(var(--chart-2))"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cumulativeSpent"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
