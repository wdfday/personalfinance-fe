"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Target, CreditCard, Wallet, ArrowRight, AlertTriangle, CheckCircle2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { BudgetConstraint } from "@/services/api/types/budget-constraints"
import type { Goal } from "@/services/api/types/goals"
import type { Debt } from "@/services/api/types/debts"
import { ConstraintRow } from "./constraint-row"

interface MonthInputStepProps {
  income: number
  
  constraints: BudgetConstraint[]
  selectedConstraintIds: string[]
  setSelectedConstraintIds: (ids: string[]) => void
  
  goals: Goal[]
  selectedGoalIds: string[]
  setSelectedGoalIds: (ids: string[]) => void
  
  debts: Debt[]
  selectedDebtIds: string[]
  setSelectedDebtIds: (ids: string[]) => void
  
  onNext: () => void
  onConstraintsChanged?: (constraints: BudgetConstraint[]) => void
}

export function MonthInputStep(props: MonthInputStepProps) {
  const {
    income,
    constraints: initialConstraints = [],
    goals = [],
    debts = [],
    selectedConstraintIds = [],
    setSelectedConstraintIds,
    selectedGoalIds = [],
    setSelectedGoalIds,
    selectedDebtIds = [],
    setSelectedDebtIds,
    onNext,
    onConstraintsChanged
  } = props

  // LOCAL STATE for constraints (snapshot only, not persisted)
  const [constraints, setConstraints] = useState<BudgetConstraint[]>(initialConstraints)
  const [editingConstraintId, setEditingConstraintId] = useState<string | null>(null)

  // Notify parent of changes
  useEffect(() => {
    if (onConstraintsChanged) {
      onConstraintsChanged(constraints)
    }
  }, [constraints, onConstraintsChanged])

  // Calculate totals
  const totalFixedCost = constraints
    .filter(c => selectedConstraintIds.includes(c.id))
    .reduce((sum, c) => sum + (Number(c.minimum_amount) || 0), 0)

  // For goals, estimate monthly contribution (target remaining / months to deadline, or ~10%/year as default)
  const totalGoals = goals
    .filter(g => selectedGoalIds.includes(g.id))
    .reduce((sum, g) => {
      const remaining = (Number(g.targetAmount) || 0) - (Number(g.currentAmount) || 0)
      // Estimate: if no deadline, assume 1-year savings plan = remaining/12
      // Otherwise this is DISPLAY only, real calculation happens in DSS
      const monthlyEstimate = remaining / 12 // Simple estimate
      return sum + monthlyEstimate
    }, 0)

  const totalDebtPayments = debts
    .filter(d => selectedDebtIds.includes(d.id))
    .reduce((sum, d) => sum + (Number(d.minimum_payment) || 0), 0)
    
  const totalOutflow = totalFixedCost + totalDebtPayments + totalGoals
  const balance = income - totalOutflow

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Toggle handlers
  const toggleConstraint = (id: string) => {
    const newIds = selectedConstraintIds.includes(id) 
        ? selectedConstraintIds.filter(i => i !== id)
        : [...selectedConstraintIds, id]
    setSelectedConstraintIds(newIds)
  }

  const toggleGoal = (id: string) => {
    const newIds = selectedGoalIds.includes(id)
        ? selectedGoalIds.filter(i => i !== id)
        : [...selectedGoalIds, id]
    setSelectedGoalIds(newIds)
  }

  const toggleDebt = (id: string) => {
    const newIds = selectedDebtIds.includes(id)
        ? selectedDebtIds.filter(i => i !== id)
        : [...selectedDebtIds, id]
    setSelectedDebtIds(newIds)
  }

  // Constraint CRUD handlers (LOCAL only)
  const handleAddConstraint = () => {
    const newConstraint: BudgetConstraint = {
      id: `temp-${Date.now()}`,
      user_id: 'current',
      category_id: '',
      category_name: 'New Expense',
      description: 'New expense item',
      minimum_amount: 0,
      maximum_amount: 0,
      is_flexible: true,
      priority: 5,
      period: new Date().toISOString().slice(0, 7),
      start_date: new Date().toISOString(),
      status: 'active',
      is_recurring: false,
      frequency: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setConstraints([...constraints, newConstraint])
    setSelectedConstraintIds([...selectedConstraintIds, newConstraint.id])
    setEditingConstraintId(newConstraint.id)
  }

  const handleUpdateConstraint = (id: string, updates: Partial<BudgetConstraint>) => {
    setConstraints(constraints.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleDeleteConstraint = (id: string) => {
    setConstraints(constraints.filter(c => c.id !== id))
    setSelectedConstraintIds(selectedConstraintIds.filter(cid => cid !== id))
  }

  const getPriorityBadge = (priority?: string | number) => {
    let label = "Normal"
    let className = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
    
    if (typeof priority === 'number') {
        if (priority <= 1) { label = "CRITICAL"; className = "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" }
        else if (priority <= 3) { label = "HIGH"; className = "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" }
        else if (priority <= 5) { label = "MEDIUM"; className = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" }
        else { label = "LOW"; className = "bg-slate-100 text-slate-700 border-slate-200" }
    } else if (typeof priority === 'string') {
        const p = priority.toLowerCase()
        if (p.includes('critical')) { label = "CRITICAL"; className = "bg-red-100 text-red-700 border-red-200" }
        else if (p.includes('high')) { label = "HIGH"; className = "bg-orange-100 text-orange-700 border-orange-200" }
        else if (p.includes('medium')) { label = "MEDIUM"; className = "bg-blue-100 text-blue-700 border-blue-200" }
    }

    return <Badge variant="outline" className={`${className} font-bold text-[10px]`}>{label}</Badge>
  }

  const hasDebts = debts.length > 0

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] w-full">
      
      {/* --- LEFT COLUMN: Health Check (30%) --- */}
      <div className="w-full lg:w-[32%] flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-4 h-fit">
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-card/50 ring-1 ring-border/50">
           <CardHeader className="pb-4 border-b">
               <CardTitle className="text-xl">Financial Health Check</CardTitle>
               <CardDescription>Snapshot before analysis</CardDescription>
           </CardHeader>
           <CardContent className="pt-6 space-y-5">
              
              {/* Income */}
              <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-emerald-600 transition-colors">
                     <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="font-medium">Total Income</span>
                 </div>
                 <span className="font-bold text-lg">{formatCurrency(income)}</span>
              </div>

              {/* Fixed Costs (Constraints + Debt Min) */}
              <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-blue-600 transition-colors">
                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                     </div>
                     <span className="font-medium">Total Fixed Cost</span>
                 </div>
                 <span className="font-bold text-lg text-blue-600">
                    -{formatCurrency(totalFixedCost + totalDebtPayments)}
                 </span>
              </div>

               {/* Goals */}
               <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-purple-600 transition-colors">
                     <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                     </div>
                     <span className="font-medium">Total Goals</span>
                 </div>
                 <span className="font-bold text-lg text-purple-600">
                    -{formatCurrency(totalGoals)}
                 </span>
              </div>

              <div className="h-px bg-border my-2" />

              {/* Balance */}
              <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${balance >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                   <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Balance</span>
                   <span className={`text-3xl font-extrabold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {balance > 0 ? '+' : ''}{formatCurrency(balance)}
                   </span>
                   <span className={`text-xs ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                       {balance >= 0 ? 'Safe to proceed' : 'Adjustment Recommended'}
                   </span>
              </div>

           </CardContent>
        </Card>

        {/* Action Button - Sticky Bottom of Column */}
        <Button size="lg" className="w-full py-6 text-lg shadow-lg hover:shadow-xl transition-all" onClick={onNext}>
            Run Analysis <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>


      {/* --- RIGHT COLUMN: Detailed Inputs (70%) --- */}
      <div className="w-full lg:w-[68%] flex flex-col gap-8 pb-10">
          
          {/* Section 1: Inflow & Outflow */}
          <section className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      Inflow & Outflow
                  </h3>
                  <div className="flex gap-2">
                      <Badge variant="secondary">{constraints.length} items</Badge>
                      <Button size="sm" variant="outline" onClick={handleAddConstraint}>
                          <Plus className="w-4 h-4 mr-1" /> Add Expense
                      </Button>
                  </div>
              </div>

              <Card className="overflow-hidden border-muted-foreground/20">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                              <tr>
                                  <th className="px-4 py-3 w-10"></th>
                                  <th className="px-4 py-3">Category / Source</th>
                                  <th className="px-4 py-3 text-right">Min Amount</th>
                                  <th className="px-4 py-3 text-right">Max Amount</th>
                                  <th className="px-4 py-3 w-20 text-center">Type</th>
                                  <th className="px-4 py-3 w-20 text-center">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                              {/* Income Row - Fixed */}
                              <tr className="bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
                                  <td className="px-4 py-3 text-center">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  </td>
                                  <td className="px-4 py-3 font-medium text-emerald-900 dark:text-emerald-100">
                                      Total Monthly Income
                                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Inflow</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-emerald-700" colSpan={2}>{formatCurrency(income)}</td>
                                  <td className="px-4 py-3 text-center"><Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Fixed</Badge></td>
                                  <td className="px-4 py-3"></td>
                              </tr>

                              {/* Constraints Rows */}
                              {constraints.map(c => (
                                <ConstraintRow
                                  key={c.id}
                                  constraint={c}
                                  isSelected={selectedConstraintIds.includes(c.id)}
                                  isEditing={editingConstraintId === c.id}
                                  onToggle={() => toggleConstraint(c.id)}
                                  onEditStart={() => setEditingConstraintId(c.id)}
                                  onEditEnd={() => setEditingConstraintId(null)}
                                  onUpdate={handleUpdateConstraint}
                                  onDelete={handleDeleteConstraint}
                                />
                              ))}
                          </tbody>
                      </table>
                  </div>
              </Card>
          </section>

          {/* Section 2: Goals Allocation */}
          <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Goals Allocation
                  </h3>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">{goals.length} items</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map(g => {
                      const isSelected = selectedGoalIds.includes(g.id)
                      const progress = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100))
                      return (
                          <div 
                              key={g.id}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onClick={() => toggleGoal(g.id)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      toggleGoal(g.id)
                                  }
                              }}
                              className={`relative group border rounded-xl p-4 cursor-pointer transition-all duration-200 ${isSelected ? 'border-purple-500 shadow-md bg-card ring-1 ring-purple-500/20' : 'border-border bg-muted/40 opacity-70 hover:opacity-100 hover:border-purple-300'}`}
                          >
                               {isSelected && (
                                   <div className="absolute top-2 right-2 text-purple-600">
                                       <CheckCircle2 className="w-5 h-5 fill-purple-100" />
                                   </div>
                               )}
                               
                               <div className="mb-2">
                                   {getPriorityBadge(g.priority)}
                               </div>
                               
                               <h4 className="font-semibold truncate pr-6 mb-1">{g.name}</h4>
                               <div className="text-xs text-muted-foreground mb-3 uppercase font-medium tracking-wider">{(g as any).type || 'Saving'}</div>
                               
                               {/* Target & Current */}
                               <div className="space-y-1 mb-3">
                                   <div className="flex justify-between text-xs">
                                       <span className="text-muted-foreground">Target:</span>
                                       <span className="font-bold">{formatCurrency(g.targetAmount)}</span>
                                   </div>
                                   <div className="flex justify-between text-xs">
                                       <span className="text-muted-foreground">Current:</span>
                                       <span className="font-semibold text-purple-600">{formatCurrency(g.currentAmount || 0)}</span>
                                   </div>
                                   <div className="flex justify-between text-xs">
                                       <span className="text-muted-foreground">Remaining:</span>
                                       <span className="font-bold text-orange-600">
                                           {formatCurrency((g.targetAmount || 0) - (g.currentAmount || 0))}
                                       </span>
                                   </div>
                                   {g.targetDate && (
                                       <div className="flex justify-between text-xs">
                                           <span className="text-muted-foreground">Deadline:</span>
                                           <span className="font-medium">{new Date(g.targetDate).toLocaleDateString('vi-VN')}</span>
                                       </div>
                                   )}
                                   <div className="flex justify-between text-xs pt-1 border-t border-dashed">
                                       <span className="text-muted-foreground">Est. Monthly:</span>
                                       <span className="font-bold text-blue-600">
                                           {(() => {
                                             const remaining = (g.targetAmount || 0) - (g.currentAmount || 0)
                                             if (!g.targetDate || remaining <= 0) return formatCurrency(0)
                                             
                                             const now = new Date()
                                             const deadline = new Date(g.targetDate)
                                             const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
                                             
                                             return formatCurrency(remaining / monthsRemaining)
                                           })()}
                                       </span>
                                   </div>
                               </div>
                               
                               {/* Progress Bar */}
                               <div className="w-full bg-secondary/50 h-1.5 rounded-full overflow-hidden">
                                   <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                               </div>
                               <div className="flex justify-end mt-1 text-[10px] text-muted-foreground font-medium">
                                   <span>{progress}% complete</span>
                               </div>
                           </div>
                      )
                  })}
              </div>
          </section>

          {/* Section 3: Debts (Conditional) */}
          {hasDebts && (
              <section className="mt-4 pt-4 border-t-2 border-dashed border-rose-100 dark:border-rose-900/30">
                  <h3 className="text-sm font-semibold text-rose-600 flex items-center gap-2 mb-3 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" /> Debt Obligations Detected
                  </h3>
                  
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg overflow-hidden">
                      {debts.map(d => {
                             const isSelected = selectedDebtIds.includes(d.id)
                             return (
                                 <div 
                                    key={d.id} 
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    onClick={() => toggleDebt(d.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            toggleDebt(d.id)
                                        }
                                    }}
                                    className={`px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${isSelected ? 'bg-rose-100 dark:bg-rose-900/60' : 'hover:bg-rose-100/50 dark:hover:bg-rose-900/40 opacity-70 hover:opacity-100'}`}
                                 >
                                    <div className="flex items-center gap-3">
                                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-300'}`}>
                                             {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                         </div>
                                         <CreditCard className="w-4 h-4 text-rose-500" />
                                         <span className="font-medium text-rose-900 dark:text-rose-100">{d.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-rose-700 dark:text-rose-400">{formatCurrency(d.minimum_payment)}</span>
                                        <Badge variant="outline" className="bg-white border-rose-200">Required</Badge>
                                    </div>
                                 </div>
                             )
                      })}
                  </div>
              </section>
          )}

      </div>
    </div>
  )
}
