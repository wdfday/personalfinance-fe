
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, FileDown, Printer, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { useState } from "react"

interface MonthClosingStepProps {
  onBack: () => void
  onRestart: () => void
}

export function MonthClosingStep({ onBack, onRestart }: MonthClosingStepProps) {
    const [isClosed, setIsClosed] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const handleCloseMonth = async () => {
        setIsClosing(true)
        // TODO: API call to close month
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsClosed(true)
        setIsClosing(false)
    }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Step 4: Month-End Summary</h2>
             <div className="flex gap-2">
                 <Button variant="outline" onClick={onBack} disabled={isClosed}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                 </Button>
            </div>
        </div>

        {/* Month Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">₫52,500,000</div>
                    <p className="text-xs text-muted-foreground">+5% vs plan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₫38,000,000</div>
                    <p className="text-xs text-green-600">-3% vs budget</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">₫14,500,000</div>
                    <p className="text-xs text-muted-foreground">+45% vs plan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
                    <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">+8%</div>
                    <p className="text-xs text-muted-foreground">Average goal progress</p>
                </CardContent>
            </Card>
        </div>

        {/* Plan vs Actual Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Plan vs Actual</CardTitle>
                    <CardDescription>How did your spending compare?</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        Bar Chart - Planned vs Actual by Category
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Where did your money go?</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        Pie Chart - Spending by Category
                     </div>
                </CardContent>
            </Card>
        </div>

        {/* Goal & Debt Updates */}
        <Card>
            <CardHeader>
                <CardTitle>Financial Progress This Month</CardTitle>
                <CardDescription>Summary of achievements</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground">Emergency Fund</p>
                        <p className="text-2xl font-bold text-green-600">₫75M → ₫85M</p>
                        <p className="text-xs text-green-600">+₫10M contributed</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-muted-foreground">Credit Card Debt</p>
                        <p className="text-2xl font-bold text-blue-600">₫12M → ₫7M</p>
                        <p className="text-xs text-blue-600">-₫5M paid off</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-muted-foreground">Vacation Fund</p>
                        <p className="text-2xl font-bold text-purple-600">₫8M → ₫11M</p>
                        <p className="text-xs text-purple-600">+₫3M saved</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Export & Actions */}
        <Card className={isClosed ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
            <CardHeader>
                <CardTitle>{isClosed ? "✅ Month Closed Successfully" : "Finalize This Month"}</CardTitle>
                <CardDescription>
                    {isClosed 
                        ? "This month is now locked. You can export reports or start planning for next month."
                        : "Export reports and close this month to lock the data."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                        <FileDown className="w-4 h-4 mr-2" /> Export PDF Report
                    </Button>
                    <Button variant="outline">
                        <FileDown className="w-4 h-4 mr-2" /> Export CSV Data
                    </Button>
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" /> Print Summary
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
                {isClosed ? (
                    <Button onClick={onRestart} size="lg">
                        Start Next Month Planning →
                    </Button>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Closing will lock all transactions and prevent further edits.
                        </p>
                        <Button onClick={handleCloseMonth} size="lg" disabled={isClosing}>
                            <Lock className="w-4 h-4 mr-2" />
                            {isClosing ? "Closing..." : "Close Month"}
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    </div>
  )
}
