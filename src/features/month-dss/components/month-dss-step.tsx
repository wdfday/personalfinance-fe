
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle, Loader2 } from "lucide-react"
import { DebtStrategyView } from "@/features/analytics/components/DebtStrategyView"
import { GoalPrioritizationView } from "@/features/analytics/components/GoalPrioritizationView"
import { DebtTradeoffView } from "@/features/analytics/components/DebtTradeoffView"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface MonthDSSStepProps {
  income: number
  result: any
  onRunOptimization: () => void
  onApplyPlan: () => Promise<void>
  onNext: () => void
  onBack: () => void
  isOptimizing?: boolean
}

export function MonthDSSStep({ 
  income, result, onRunOptimization, onApplyPlan,
  onNext, onBack, isOptimizing 
}: MonthDSSStepProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  const handleApply = async () => {
    setIsApplying(true)
    try {
      await onApplyPlan()
      setIsApplied(true)
    } finally {
      setIsApplying(false)
    }
  }
  
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Step 2: Planning Engine</h2>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                 </Button>
                 {isApplied ? (
                   <Button onClick={onNext}>
                     View Analytics <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                 ) : (
                   <Button onClick={handleApply} disabled={!result || isApplying}>
                     {isApplying ? (
                       <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...</>
                     ) : (
                       <><CheckCircle className="w-4 h-4 mr-2" /> Apply Plan</>
                     )}
                   </Button>
                 )}
            </div>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                     <CardTitle>Budget Allocation (P1)</CardTitle>
                     <CardDescription>Automatic distribution based on constraints</CardDescription>
                </div>
                 <Button onClick={onRunOptimization} disabled={isOptimizing || income <= 0 || isApplied}>
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    {result ? "Re-run Optimization" : "Run Optimization"}
                </Button>
            </CardHeader>
            <CardContent>
                 {result ? (
                    <div className="w-full mt-4" style={{ minHeight: 300 }}>
                        <ResponsiveContainer width={600} height={300} minWidth={0}>
                        <BarChart
                            data={result.allocations || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" name="Allocated Amount" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        Click 'Run Optimization' to generate allocation plan
                    </div>
                )}
            </CardContent>
        </Card>

        <Tabs defaultValue="debt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="debt">Debt Strategy (P2)</TabsTrigger>
                <TabsTrigger value="goals">Goal Prioritization (P3)</TabsTrigger>
                <TabsTrigger value="tradeoff">Savings vs Debt (P6)</TabsTrigger>
            </TabsList>
            <TabsContent value="debt" className="mt-4 p-1">
                <DebtStrategyView />
            </TabsContent>
            <TabsContent value="goals" className="mt-4 p-1">
                <GoalPrioritizationView />
            </TabsContent>
            <TabsContent value="tradeoff" className="mt-4 p-1">
                <DebtTradeoffView />
            </TabsContent>
        </Tabs>

        {isApplied && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <CheckCircle className="w-6 h-6 text-green-600 inline mr-2" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Plan applied successfully! Click "View Analytics" to see your budget breakdown.
            </span>
          </div>
        )}
    </div>
  )
}
