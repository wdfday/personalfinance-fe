
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowRight, TrendingUp, PieChart, Target, Wallet } from "lucide-react"

interface MonthAnalyticsStepProps {
  onNext: () => void
  onRecalculate: () => void
}

export function MonthAnalyticsStep({ onNext, onRecalculate }: MonthAnalyticsStepProps) {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Step 3: Budget Analytics</h2>
             <div className="flex gap-2">
                 <Button variant="outline" onClick={onRecalculate}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Recalculate
                 </Button>
                 <Button onClick={onNext}>
                    Close Month <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
            </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₫50,000,000</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₫45,000,000</div>
                    <p className="text-xs text-muted-foreground">90% allocated</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Target</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₫10,000,000</div>
                    <p className="text-xs text-green-600">On track</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Debt Payment</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₫5,000,000</div>
                    <p className="text-xs text-muted-foreground">Min + Extra</p>
                </CardContent>
            </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Budget allocation by category</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        Pie Chart - Category Distribution
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Trend</CardTitle>
                    <CardDescription>Income vs Expenses over time</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        Area Chart - Income vs Expenses
                     </div>
                </CardContent>
            </Card>
        </div>

        {/* Goal & Debt Progress */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Goal Progress</CardTitle>
                    <CardDescription>Tracking towards financial goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Emergency Fund</span>
                            <span className="text-muted-foreground">75%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                            <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Vacation Fund</span>
                            <span className="text-muted-foreground">40%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full w-2/5"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>New Car</span>
                            <span className="text-muted-foreground">15%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                            <div className="h-2 bg-orange-500 rounded-full w-[15%]"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Debt Payoff</CardTitle>
                    <CardDescription>Progress on debt reduction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Credit Card</span>
                            <span className="text-green-600">₫2,000,000 remaining</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                            <div className="h-2 bg-green-500 rounded-full w-4/5"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Personal Loan</span>
                            <span className="text-muted-foreground">₫15,000,000 remaining</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full w-1/2"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Projected Outcomes */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Projected Outcomes</CardTitle>
                <CardDescription>If you follow this plan...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3 text-center">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">₫10M</p>
                        <p className="text-sm text-muted-foreground">Added to Savings</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">₫5M</p>
                        <p className="text-sm text-muted-foreground">Debt Reduced</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">6 months</p>
                        <p className="text-sm text-muted-foreground">To Emergency Fund Goal</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
