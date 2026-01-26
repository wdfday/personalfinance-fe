import { escapeCsvCell } from "@/lib/utils"
import type { MonthAnalyticsData } from "@/hooks/use-month-analytics-data"

export function generateMonthSummaryCsv(data: MonthAnalyticsData): string {
  const {
    monthView,
    monthStr,
    activeBudgets,
    categoryBreakdown,
    goals,
    debts,
    goalAllocations,
    goalContributions,
    debtAllocations,
    debtPayments,
    transactions,
    getCategoryName,
  } = data

  if (!monthView) return ""

  const rows: string[] = []

  rows.push("MONTH SUMMARY")
  rows.push("")
  rows.push(["Field", "Value"].map(escapeCsvCell).join(","))
  rows.push(["Month", monthStr].map((v) => escapeCsvCell(String(v))).join(","))
  rows.push(["Income", monthView.income].map((v) => escapeCsvCell(String(v))).join(","))
  rows.push(["Budgeted", monthView.budgeted].map((v) => escapeCsvCell(String(v))).join(","))
  rows.push(["Activity", monthView.activity].map((v) => escapeCsvCell(String(v))).join(","))
  rows.push(["To Be Budgeted", monthView.to_be_budgeted].map((v) => escapeCsvCell(String(v))).join(","))
  rows.push("")

  rows.push("BUDGET SUMMARY")
  rows.push("")
  if (activeBudgets.length > 0) {
    rows.push(
      ["Budget Name", "Amount", "Spent", "Remaining", "Percentage Used", "Status"]
        .map(escapeCsvCell)
        .join(",")
    )
    activeBudgets.forEach((b) => {
      rows.push(
        [
          b.name,
          b.amount,
          b.spent_amount,
          b.remaining_amount ?? b.amount - b.spent_amount,
          b.percentage_spent.toFixed(2) + "%",
          b.status,
        ]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No active budgets for this month")
  }
  rows.push("")

  rows.push("CATEGORY BREAKDOWN (Spending by Category)")
  rows.push("")
  if (categoryBreakdown.length > 0) {
    rows.push(["Category", "Amount", "Percentage"].map(escapeCsvCell).join(","))
    const total = categoryBreakdown.reduce((s, i) => s + i.value, 0)
    categoryBreakdown.forEach((item) => {
      const pct = total > 0 ? (item.value / total) * 100 : 0
      rows.push([item.name, item.value, pct.toFixed(2) + "%"].map((v) => escapeCsvCell(String(v))).join(","))
    })
    rows.push(["TOTAL", total, "100.00%"].map((v) => escapeCsvCell(String(v))).join(","))
  } else {
    rows.push("No category spending data available")
  }
  rows.push("")

  // Prepare active goals and debts for reuse
  const activeGoals = goals.filter((g) => g.status === "active")
  const activeDebts = debts.filter((d) => d.status === "active")

  // CHART DATA SECTION - Raw data for creating charts in Excel/Google Sheets
  rows.push("CHART DATA")
  rows.push("")
  
  // 1. Category Breakdown Chart Data (for Pie Chart)
  rows.push("Category Breakdown Chart Data (Pie Chart)")
  rows.push("")
  if (categoryBreakdown.length > 0) {
    rows.push(["Category", "Amount", "Percentage"].map(escapeCsvCell).join(","))
    const total = categoryBreakdown.reduce((s, i) => s + i.value, 0)
    categoryBreakdown.forEach((item) => {
      const pct = total > 0 ? (item.value / total) * 100 : 0
      rows.push([item.name, item.value, pct.toFixed(2)].map((v) => escapeCsvCell(String(v))).join(","))
    })
  } else {
    rows.push("No data available")
  }
  rows.push("")

  // 2. Monthly Trend Chart Data (for Line/Area Chart)
  rows.push("Monthly Trend Chart Data (Line/Area Chart)")
  rows.push("")
  if (data.monthlyTrend.length > 0) {
    rows.push(["Month", "Income", "Expenses", "Net"].map(escapeCsvCell).join(","))
    data.monthlyTrend.forEach((trend) => {
      const net = trend.income - trend.expenses
      rows.push(
        [trend.month, trend.income, trend.expenses, net]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No trend data available")
  }
  rows.push("")

  // 3. Budget Usage Chart Data (for Bar Chart)
  rows.push("Budget Usage Chart Data (Bar Chart)")
  rows.push("")
  if (activeBudgets.length > 0) {
    rows.push(
      ["Budget Name", "Allocated", "Spent", "Remaining", "Usage %"].map(escapeCsvCell).join(",")
    )
    activeBudgets.forEach((b) => {
      const remaining = b.remaining_amount ?? b.amount - b.spent_amount
      rows.push(
        [b.name, b.amount, b.spent_amount, remaining, b.percentage_spent.toFixed(2)]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No budget data available")
  }
  rows.push("")

  // 4. Goal Progress Chart Data (for Progress Bar Chart)
  rows.push("Goal Progress Chart Data (Progress Bar Chart)")
  rows.push("")
  if (activeGoals.length > 0) {
    rows.push(
      [
        "Goal Name",
        "Target Amount",
        "Current Amount",
        "Remaining",
        "Progress %",
        "DSS Allocated",
        "Actual Contribution",
      ]
        .map(escapeCsvCell)
        .join(",")
    )
    activeGoals.forEach((goal) => {
      const allocated = goalAllocations[goal.id] || 0
      const actual = goalContributions[goal.id] || 0
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
      rows.push(
        [
          goal.name,
          goal.targetAmount,
          goal.currentAmount,
          remaining,
          progress.toFixed(2),
          allocated,
          actual,
        ]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No active goals")
  }
  rows.push("")

  // 5. Debt Payoff Chart Data (for Progress Bar Chart)
  rows.push("Debt Payoff Chart Data (Progress Bar Chart)")
  rows.push("")
  if (activeDebts.length > 0) {
    rows.push(
      [
        "Debt Name",
        "Principal Amount",
        "Current Balance",
        "Paid Off",
        "Progress %",
        "DSS Allocated",
        "Actual Payment",
      ]
        .map(escapeCsvCell)
        .join(",")
    )
    activeDebts.forEach((debt) => {
      const principal = debt.principal_amount || debt.current_balance || 0
      const currentBalance = debt.current_balance || 0
      const paidOff = principal - currentBalance
      const progress = principal > 0 ? (paidOff / principal) * 100 : 0
      const allocated = debtAllocations[debt.id] ?? debt.minimum_payment ?? 0
      const actual = debtPayments[debt.id] || 0
      rows.push(
        [
          debt.name,
          principal,
          currentBalance,
          paidOff,
          progress.toFixed(2),
          allocated,
          actual,
        ]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No active debts")
  }
  rows.push("")
  rows.push("GOALS - Target vs Actual Contribution")
  rows.push("")
  if (activeGoals.length > 0) {
    rows.push(
      [
        "Goal Name",
        "Target Amount",
        "Current Amount",
        "Remaining",
        "Progress %",
        "DSS Allocated",
        "Actual Contribution (This Month)",
        "Contribution vs Allocated",
        "Status",
      ]
        .map(escapeCsvCell)
        .join(",")
    )
    activeGoals.forEach((goal) => {
      const allocated = goalAllocations[goal.id] || 0
      const actual = goalContributions[goal.id] || 0
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
      const contributionStatus =
        allocated > 0
          ? actual >= allocated
            ? "✅ Completed"
            : actual > 0
              ? `⚠️ Partial (${((actual / allocated) * 100).toFixed(0)}%)`
              : "❌ Not Started"
          : "—"
      const overallStatus = goal.currentAmount >= goal.targetAmount ? "✅ Goal Completed" : "🔄 In Progress"
      rows.push(
        [
          goal.name,
          goal.targetAmount,
          goal.currentAmount,
          remaining,
          progress.toFixed(2) + "%",
          allocated,
          actual,
          contributionStatus,
          overallStatus,
        ]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No active goals")
  }
  rows.push("")

  rows.push("DEBTS - Payoff Progress")
  rows.push("")
  if (activeDebts.length > 0) {
    rows.push(
      [
        "Debt Name",
        "Principal Amount",
        "Current Balance",
        "Paid Off",
        "Progress %",
        "DSS Allocated / Min Payment",
        "Actual Payment (This Month)",
        "Payment vs Allocated",
        "Status",
      ]
        .map(escapeCsvCell)
        .join(",")
    )
    activeDebts.forEach((debt) => {
      const principal = debt.principal_amount || debt.current_balance || 0
      const currentBalance = debt.current_balance || 0
      const paidOff = principal - currentBalance
      const progress = principal > 0 ? (paidOff / principal) * 100 : 0
      const allocated = debtAllocations[debt.id] ?? debt.minimum_payment ?? 0
      const actual = debtPayments[debt.id] || 0
      const paymentStatus =
        allocated > 0
          ? actual >= allocated
            ? "✅ Completed"
            : actual > 0
              ? `⚠️ Partial (${((actual / allocated) * 100).toFixed(0)}%)`
              : "❌ Not Started"
          : "—"
      const overallStatus = currentBalance <= 0 ? "✅ Paid Off" : "🔄 In Progress"
      rows.push(
        [
          debt.name,
          principal,
          currentBalance,
          paidOff,
          progress.toFixed(2) + "%",
          allocated,
          actual,
          paymentStatus,
          overallStatus,
        ]
          .map((v) => escapeCsvCell(String(v)))
          .join(",")
      )
    })
  } else {
    rows.push("No active debts")
  }
  rows.push("")

  rows.push("TRANSACTIONS")
  rows.push("")
  rows.push(
    [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Direction",
      "Currency",
      "Linked Goal",
      "Goal Contribution",
      "Linked Debt",
      "Debt Payment",
      "Status",
    ]
      .map(escapeCsvCell)
      .join(",")
  )

  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.booking_date || a.date || a.created_at).getTime() -
      new Date(b.booking_date || b.date || b.created_at).getTime()
  )

  sorted.forEach((tx) => {
    const date = (tx.booking_date || tx.date || tx.created_at || "").slice(0, 10)
    const amount = Math.abs(tx.amount || 0)
    const goalLink = tx.links?.find((l) => l.type === "GOAL")
    const linkedGoal = goalLink ? goals.find((g) => g.id === goalLink.id) : null
    const goalName = linkedGoal?.name || "—"
    const isGoalContrib = goalLink && tx.direction === "DEBIT" ? amount : "—"
    const debtLink = tx.links?.find((l) => l.type === "DEBT")
    const linkedDebt = debtLink ? debts.find((d) => d.id === debtLink.id) : null
    const debtName = linkedDebt?.name || "—"
    const isDebtPay = debtLink && tx.direction === "DEBIT" ? amount : "—"

    let status = "—"
    if (goalLink && linkedGoal && tx.direction === "DEBIT") {
      const allocated = goalAllocations[linkedGoal.id] || 0
      const actual = goalContributions[linkedGoal.id] || 0
      const done = linkedGoal.currentAmount >= linkedGoal.targetAmount
      if (done) status = "✅ Goal Completed"
      else if (allocated > 0 && actual >= allocated) status = "✅ Monthly target met"
      else if (allocated > 0 && actual > 0)
        status = `🔄 ${((actual / allocated) * 100).toFixed(0)}% of monthly target`
      else if (allocated > 0) status = "❌ No contribution yet"
      else status = "📝 Linked (no allocation)"
    } else if (debtLink && linkedDebt && tx.direction === "DEBIT") {
      const allocated = debtAllocations[linkedDebt.id] ?? linkedDebt.minimum_payment ?? 0
      const actual = debtPayments[linkedDebt.id] || 0
      const paidOff = (linkedDebt.current_balance || 0) <= 0
      if (paidOff) status = "✅ Debt Paid Off"
      else if (allocated > 0 && actual >= allocated) status = "✅ Monthly payment met"
      else if (allocated > 0 && actual > 0)
        status = `🔄 ${((actual / allocated) * 100).toFixed(0)}% of monthly target`
      else if (allocated > 0) status = "❌ No payment yet"
      else status = "📝 Linked (no allocation)"
    } else if (goalLink || debtLink) {
      status = "📝 Linked (not a contribution/payment)"
    }

    rows.push(
      [
        date,
        tx.description || "",
        getCategoryName(tx),
        amount,
        tx.direction || tx.type || "",
        tx.currency || "VND",
        goalName,
        isGoalContrib,
        debtName,
        isDebtPay,
        status,
      ]
        .map((v) => escapeCsvCell(String(v)))
        .join(",")
    )
  })

  return rows.join("\n")
}
