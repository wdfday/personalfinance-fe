"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer } from "@/components/ui/chart"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, PieChart, Target, Wallet, CheckCircle2, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { MonthAnalyticsData } from "@/hooks/use-month-analytics-data"
import type { Budget } from "@/services/api/types/budgets"

export interface MonthAnalyticsContentProps {
  data: MonthAnalyticsData
  /** "analytics" = 4-col overview, "closing" = 2x2 overview */
  layout?: "analytics" | "closing"
}

export function MonthAnalyticsContent({ data, layout = "analytics" }: MonthAnalyticsContentProps) {
  const {
    monthView,
    monthStr,
    activeBudgets,
    categoryBreakdown,
    monthlyTrend,
    goals,
    debts,
    goalAllocations,
    goalContributions,
    debtAllocations,
    debtPayments,
    incomeChange,
    totalSavingsTarget,
    totalDebtPayment,
    projectedOutcomes,
    allocationPct,
  } = data

  if (!monthView) return null

  const overviewCols = layout === "closing" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
  const goalsSlice = layout === "closing" ? 6 : 5
  const debtsSlice = layout === "closing" ? 6 : 5

  return (
    <>
      {/* Overview */}
      <div className={`grid gap-4 ${overviewCols}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthView.income)}</div>
            {incomeChange != null && (
              <p className={`text-xs ${incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {incomeChange >= 0 ? "+" : ""}
                {incomeChange.toFixed(1)}% {layout === "closing" ? "so tháng trước" : "from last month"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthView.budgeted)}</div>
            <p className="text-xs text-muted-foreground">{allocationPct.toFixed(0)}% allocated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavingsTarget)}</div>
            <p className="text-xs text-green-600">Active goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebtPayment)}</div>
            <p className="text-xs text-muted-foreground">Min payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
          <CardDescription>
            {layout === "closing"
              ? `Budgets tháng ${monthStr}`
              : `Current month budgets${activeBudgets.length > 0 ? ` (${activeBudgets.length} total)` : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeBudgets.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeBudgets.map((b: Budget) => (
                <div
                  key={b.id}
                  className={`p-3 border rounded-lg ${layout === "analytics" ? "hover:bg-muted/50 transition-colors" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">{b.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        b.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : b.status === "warning"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">
                        {formatCurrency(b.spent_amount)} / {formatCurrency(b.amount)}
                      </span>
                    </div>
                    <Progress value={Math.min(b.percentage_spent, 100)} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used</span>
                      <span
                        className={
                          b.percentage_spent >= 100
                            ? "text-red-600"
                            : b.percentage_spent >= 90
                              ? "text-yellow-600"
                              : "text-muted-foreground"
                        }
                      >
                        {b.percentage_spent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {layout === "closing"
                ? "Không có budget nào cho tháng này."
                : "No active budgets for this month. Budgets will appear here once they are created and active."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              {layout === "closing"
                ? "Chi tiêu theo danh mục (từ đầu tháng đến hiện tại)"
                : "Transaction spending by category (from month start to today)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ChartContainer config={{}} className="h-[250px] w-full" chartWidth={600} chartHeight={250}>
                <RechartsPieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                {layout === "closing" ? "Chưa có dữ liệu giao dịch" : "No transaction data available"}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>
              {layout === "closing" 
                ? "Thu nhập vs Chi tiêu tích lũy (từ đầu tháng đến hiện tại)" 
                : "Income vs Expenses cumulative (from month start to today)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ChartContainer
                config={{
                  income: { label: "Thu nhập", color: "hsl(var(--chart-1))" },
                  expenses: { label: "Chi tiêu", color: "hsl(var(--chart-2))" },
                }}
                className="h-[400px] w-full"
                chartWidth={600}
                chartHeight={400}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 8, right: 40, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}`
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })
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
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#ef4444" }}
                      name="Chi tiêu"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                Chưa có dữ liệu trend
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals & Debts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>
              {layout === "closing" ? "Tiến độ mục tiêu" : "Tracking towards financial goals"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.filter((g) => g.status === "active").length > 0 ? (
              goals
                .filter((g) => g.status === "active")
                .slice(0, goalsSlice)
                .map((goal) => {
                  const progress =
                    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
                  const allocated = goalAllocations[goal.id] || 0
                  const actual = goalContributions[goal.id] || 0
                  const done = goal.currentAmount >= goal.targetAmount
                  return (
                    <div key={goal.id} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm line-clamp-1">{goal.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            done ? "bg-green-100 text-green-700" : "text-muted-foreground"
                          }`}
                        >
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current</span>
                          <span className="font-medium">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        {allocated > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              {layout === "closing" ? "Phân bổ" : "Phân bổ"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {actual >= allocated && allocated > 0 && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                              {actual > 0 && actual < allocated && (
                                <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              )}
                              {allocated > 0 && actual === 0 && (
                                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`font-medium ${actual >= allocated && allocated > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {formatCurrency(allocated)}
                              </span>
                            </div>
                          </div>
                        )}
                        {actual > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {layout === "closing"
                                ? "Đã đóng góp (tháng)"
                                : "Đã đóng góp (tháng này)"}
                            </span>
                            <span
                              className={
                                allocated > 0 && actual >= allocated
                                  ? "font-medium text-green-600"
                                  : "font-medium text-orange-600"
                              }
                            >
                              {formatCurrency(actual)}
                            </span>
                          </div>
                        )}
                        {allocated > 0 && actual > 0 && (
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-muted-foreground">
                              {layout === "closing" ? "Tiến độ phân bổ" : "Tiến độ phân bổ"}
                            </span>
                            <span
                              className={
                                actual >= allocated
                                  ? "font-medium text-green-600"
                                  : "font-medium text-orange-600"
                              }
                            >
                              {((actual / allocated) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="text-sm text-muted-foreground">
                {layout === "closing" ? "Không có goal active." : "No active goals"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Debt Payoff</CardTitle>
            <CardDescription>
              {layout === "closing" ? "Tiến độ trả nợ" : "Progress on debt reduction"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {debts.filter((d) => d.status === "active").length > 0 ? (
              debts
                .filter((d) => d.status === "active")
                .slice(0, debtsSlice)
                .map((debt) => {
                  const principal = debt.principal_amount || debt.current_balance || 0
                  const progress =
                    principal > 0
                      ? ((principal - (debt.current_balance || 0)) / principal) * 100
                      : 0
                  const allocated = debtAllocations[debt.id] ?? debt.minimum_payment ?? 0
                  const actual = debtPayments[debt.id] || 0
                  const paidOff = (debt.current_balance || 0) <= 0
                  const remaining = debt.current_balance || 0
                  return (
                    <div key={debt.id} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm line-clamp-1">{debt.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            paidOff
                              ? "bg-green-100 text-green-700"
                              : remaining < debt.principal_amount * 0.2
                                ? "bg-blue-100 text-blue-700"
                                : "text-muted-foreground"
                          }`}
                        >
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {layout === "closing" ? "Còn lại" : "Còn lại"}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(debt.current_balance || 0)} /{" "}
                            {formatCurrency(principal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            {layout === "closing" ? "Phân bổ" : "Phân bổ"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {actual >= allocated && allocated > 0 && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {actual > 0 && actual < allocated && (
                              <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                            )}
                            {allocated > 0 && actual === 0 && (
                              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`font-medium ${actual >= allocated && allocated > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                              {formatCurrency(allocated)}
                            </span>
                          </div>
                        </div>
                        {actual > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {layout === "closing"
                                ? "Đã trả (tháng)"
                                : "Đã trả (tháng này)"}
                            </span>
                            <span
                              className={
                                allocated > 0 && actual >= allocated
                                  ? "font-medium text-green-600"
                                  : "font-medium text-orange-600"
                              }
                            >
                              {formatCurrency(actual)}
                            </span>
                          </div>
                        )}
                        {allocated > 0 && actual > 0 && (
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-muted-foreground">Tiến độ phân bổ</span>
                            <span
                              className={
                                actual >= allocated
                                  ? "font-medium text-green-600"
                                  : "font-medium text-orange-600"
                              }
                            >
                              {((actual / allocated) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="text-sm text-muted-foreground">
                {layout === "closing" ? "Không có khoản nợ active." : "No active debts"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    </>
  )
}
