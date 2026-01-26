"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileDown, Printer, Receipt } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { downloadBlob } from "@/lib/utils"
import { useMonthAnalyticsData } from "@/hooks/use-month-analytics-data"
import { MonthAnalyticsContent } from "./month-analytics-shared"
import { generateMonthSummaryCsv } from "../utils/month-summary-csv"
import { FinalizeDSSButton } from "./finalize-dss-button"

interface MonthClosingStepProps {
  monthId: string
  monthStr: string
  onBack: () => void
  onRestart: () => void
  isClosed?: boolean
}

export function MonthClosingStep({
  monthId,
  monthStr,
  onBack,
  onRestart,
  isClosed = false,
}: MonthClosingStepProps) {
  const [isFinalized, setIsFinalized] = useState(false)
  const data = useMonthAnalyticsData(monthId, monthStr)

  const handleExportCsv = () => {
    if (!data.monthView) return
    const csv = "\uFEFF" + generateMonthSummaryCsv(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    downloadBlob(blob, `month-summary-${monthStr}.csv`)
  }

  const handleExportPdf = () => {
    window.print()
  }

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!data.monthView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Month-End Summary</h2>
          <Button variant="outline" onClick={onBack} disabled={isClosed}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <p className="text-muted-foreground">Không có dữ liệu tháng.</p>
      </div>
    )
  }

  return (
    <>
      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #month-closing-print-center,
          #month-closing-print-center * {
            visibility: visible;
          }
          #month-closing-print-center {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />

      <div className="space-y-6" id="month-closing-print">
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <h2 className="text-2xl font-bold tracking-tight">Month-End Summary</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBack} disabled={isClosed}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button variant="outline" onClick={handleExportCsv}>
              <FileDown className="w-4 h-4 mr-2" /> Xuất CSV
            </Button>
            <Button variant="outline" onClick={handleExportPdf}>
              <Printer className="w-4 h-4 mr-2" /> Xuất PDF / In
            </Button>
          </div>
        </div>

        {/* Center content - only this will be printed */}
        <div id="month-closing-print-center">
          <MonthAnalyticsContent data={data} layout="closing" />
        </div>

        {/* Transactions - hidden when printing */}
        <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Transactions
          </CardTitle>
          <CardDescription>
            Giao dịch tháng {monthStr} ({data.transactions.length} giao dịch)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.transactions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Ngày</th>
                      <th className="text-left p-2 font-medium">Mô tả</th>
                      <th className="text-left p-2 font-medium">Danh mục</th>
                      <th className="text-right p-2 font-medium">Số tiền</th>
                      <th className="text-left p-2 font-medium">Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.transactions]
                      .sort(
                        (a, b) =>
                          new Date(b.booking_date || b.date || b.created_at).getTime() -
                          new Date(a.booking_date || a.date || a.created_at).getTime()
                      )
                      .map((tx) => (
                        <tr key={tx.id} className="border-t hover:bg-muted/30">
                          <td className="p-2 whitespace-nowrap">
                            {formatDate((tx.booking_date || tx.date || tx.created_at)?.slice(0, 10))}
                          </td>
                          <td className="p-2 max-w-[200px] truncate" title={tx.description}>
                            {tx.description || "—"}
                          </td>
                          <td className="p-2 text-muted-foreground">{data.getCategoryName(tx)}</td>
                          <td
                            className={`p-2 text-right font-medium ${
                              tx.direction === "CREDIT" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {tx.direction === "CREDIT" ? "+" : "-"}
                            {formatCurrency(Math.abs(tx.amount || 0), tx.currency)}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {tx.direction === "CREDIT" ? "Thu" : "Chi"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Chưa có giao dịch nào trong tháng.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Finalize - hidden when printing */}
      <Card
        className={
          isFinalized
            ? "border-green-500 bg-green-50 dark:bg-green-950/20 print:hidden"
            : "print:hidden"
        }
      >
        <CardHeader>
          <CardTitle>
            {isFinalized ? "✅ DSS đã được áp dụng" : "Áp dụng kế hoạch ngân sách"}
          </CardTitle>
          <CardDescription>
            {isFinalized
              ? "Kế hoạch đã lưu, budget đã tạo. Bạn có thể bắt đầu lập kế hoạch tháng tiếp theo."
              : "Xem xét và áp dụng kế hoạch DSS. Hệ thống sẽ tạo budget theo phân bổ đã chọn."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isFinalized && (
            <FinalizeDSSButton
              monthStr={monthStr}
              monthId={monthId}
              onComplete={() => setIsFinalized(true)}
            />
          )}
        </CardContent>
        {isFinalized && (
          <CardFooter className="flex justify-end border-t pt-6">
            <Button onClick={onRestart} size="lg">
              Bắt đầu lập kế hoạch tháng tiếp theo →
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
    </>
  )
}
