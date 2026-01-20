"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDebts } from "@/features/debts/debtsSlice"
import { simulateDebtStrategy } from "@/features/analytics/analyticsSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { ArrowRight, DollarSign, TrendingDown, Calendar } from "lucide-react"

export function DebtStrategyView() {
  const dispatch = useAppDispatch()
  
  // Selectors
  const { debts, isLoading: debtsLoading } = useAppSelector((state) => state.debts)
  const { data: simulationResult, loading: simulationLoading } = useAppSelector((state) => state.analytics.debtStrategy)

  // Local State
  const [extraPayment, setExtraPayment] = useState<number>(1000000)
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche")

  // Fetch debts on mount
  useEffect(() => {
    dispatch(fetchDebts())
  }, [dispatch])

  const handleSimulate = () => {
    if (!debts || debts.length === 0) return

    // Transform debts to required format for API if needed, 
    // strictly speaking the API expects { id, balance, interest_rate, minimum_payment }
    // We assume backend handles the mapping or we map here.
    // The backend DTO expects:
    // type DebtInfo struct { ID, Name, Balance, InterestRate, MinimumPayment }
    // type DebtStrategyInput struct { Debts []DebtInfo, ExtraPayment, Strategy }
    
    // Mapping frontend Debt to Backend DebtInfo
    const debtsPayload = debts.map(d => ({
        id: d.id,
        name: d.name,
        balance: d.remaining_amount,
        interest_rate: d.interest_rate / 100, // Backend likely expects decimal (0.18) vs Frontend percent (18)
        minimum_payment: d.minimum_payment,
    }))

    dispatch(simulateDebtStrategy({
      debts: debtsPayload,
      extra_payment: extraPayment,
      strategy: strategy
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (debtsLoading) {
      return <div className="p-8 text-center">Loading debts...</div>
  }

  if (!debts || debts.length === 0) {
      return (
          <div className="p-12 text-center border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium text-muted-foreground">No Debts Found</h3>
              <p className="mb-4 text-sm text-muted-foreground">Add debts in the Debts module to use this simulator.</p>
              <Button variant="outline">Go to Debts</Button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Strategy Settings</CardTitle>
            <CardDescription>Configure payoff plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label>Total Debt Load</Label>
                <div className="text-2xl font-bold text-destructive">
                    {formatCurrency(debts.reduce((sum, d) => sum + d.remaining_amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">{debts.length} active debts</p>
             </div>

             <div className="space-y-2">
               <Label>Extra Monthly Payment</Label>
               <div className="relative">
                 <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                   type="number" 
                   value={extraPayment}
                   onChange={(e) => setExtraPayment(Number(e.target.value))}
                   className="pl-8 font-mono"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label>Payoff Strategy</Label>
               <Select value={strategy} onValueChange={(val: any) => setStrategy(val)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
                   <SelectItem value="snowball">Snowball (Lowest Balance First)</SelectItem>
                 </SelectContent>
               </Select>
               <p className="text-xs text-muted-foreground">
                   {strategy === 'avalanche' 
                     ? 'Mathematically optimal. Saves the most interest.' 
                     : 'Psychologically rewarding. Clears small debts faster.'}
               </p>
             </div>

             <Button className="w-full" onClick={handleSimulate} disabled={simulationLoading}>
                {simulationLoading ? 'Simulating...' : 'Run Simulation'}
             </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="md:col-span-2 shadow-md">
           <CardHeader>
             <CardTitle>Payoff Projection</CardTitle>
             <CardDescription>
                 {simulationResult 
                    ? `Debt Free in ${simulationResult.months} months` 
                    : "Run simulation to see your timeline"}
             </CardDescription>
           </CardHeader>
           <CardContent>
              {simulationResult ? (
                  <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-muted/20 rounded-lg border">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                  <Calendar className="w-4 h-4" /> Time to Debt Free
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                  {(simulationResult.months / 12).toFixed(1)} Years
                              </div>
                              <div className="text-xs text-muted-foreground">{simulationResult.months} months</div>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg border">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                  <DollarSign className="w-4 h-4" /> Total Interest
                              </div>
                              <div className="text-2xl font-bold text-destructive">
                                  {formatCurrency(simulationResult.total_interest)}
                              </div>
                          </div>
                           <div className="p-4 bg-muted/20 rounded-lg border">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                  <TrendingDown className="w-4 h-4" /> Savings
                              </div>
                              <div className="text-sm">
                                  vs Minimum: <span className="font-bold text-green-600">Coming Soon</span>
                              </div>
                          </div>
                      </div>

                      <div className="h-[250px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={simulationResult.timeline}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                                  <YAxis label={{ value: 'Balance', angle: -90, position: 'insideLeft' }} />
                                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                  <Legend />
                                  <Line type="monotone" dataKey="remaining_balance" stroke="#ef4444" strokeWidth={2} name="Total Balance" dot={false} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                      <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                      <p>Adjust settings and click Run Simulation</p>
                  </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
