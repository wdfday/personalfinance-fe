
"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBudgets } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { useBudgetConstraints } from "@/hooks/use-budget-constraints"
import { transactionsService } from "@/services/api/services/transactions.service"
import { Budget } from "@/services/api/types/budgets"
import { BudgetConstraint } from "@/services/api/types/budget-constraints"
import { Transaction } from "@/services/api/types/transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Wallet, ArrowUpRight, TrendingUp, TrendingDown, History } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BudgetCard } from "@/features/budgets/components/budget-card"
import { ConstraintCard } from "@/features/budget-constraints/components/constraint-card"
import { CreateBudgetModal } from "@/features/budgets/components/create-budget-modal"
import { CreateConstraintModal } from "@/features/budget-constraints/components/create-constraint-modal"

export default function UnifiedBudgetsPage() {
  const router = useRouter()
  
  // Use custom hooks
  const { budgets, isLoading: budgetsLoading, refreshBudgets, removeBudget } = useBudgets()
  const { categories, refreshCategories } = useCategories()
  const { 
      constraints, 
      summary, 
      isLoading: constraintsLoading, 
      refreshConstraints, 
      refreshSummary,
      removeConstraint 
  } = useBudgetConstraints()

  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false)
  const [isCreateConstraintModalOpen, setIsCreateConstraintModalOpen] = useState(false)
  
  // Selection State
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleBudgetSelect = async (budget: Budget) => {
      setSelectedBudget(budget)
      setDetailsLoading(true)
      try {
          const res = await transactionsService.getAll({
              category_id: budget.category_id,
              start_date: budget.start_date,
              end_date: budget.end_date,
              limit: 5 // Only need top 5 for preview
          })
          setSelectedTransactions(res.transactions)
      } catch (error) {
          console.error("Failed to load transactions for budget", error)
          setSelectedTransactions([])
      } finally {
          setDetailsLoading(false)
      }
  }

  useEffect(() => {
    refreshBudgets()
    refreshConstraints()
    refreshSummary()
    refreshCategories()
  }, [refreshBudgets, refreshConstraints, refreshSummary, refreshCategories])

  // Create category lookup map
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {} as Record<string, string>)

  // Enrich constraints with category names
  const enrichedConstraints = constraints.map(constraint => ({
    ...constraint,
    category_name: categoryMap[constraint.category_id] || `Category ${constraint.category_id.slice(0, 8)}...`
  }))



  // Separate budgets into Active, Future, and Past
  const now = new Date()
  
  // Sort all budgets descending by date first
  const sortedBudgets = [...(budgets || [])].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  const futureBudgets = sortedBudgets.filter((b) => {
    return new Date(b.start_date) > now
  })

  // activeBudgets: current, not expired, not ended
  const activeBudgets = sortedBudgets.filter((b) => {
    if (new Date(b.start_date) > now) return false
    if (b.status === 'expired') return false
    if (b.end_date && new Date(b.end_date) < now) return false
    return true
  })

  // pastBudgets: expired or ended
  const pastBudgets = sortedBudgets.filter((b) => {
    if (b.status === 'expired') return true
    if (b.end_date && new Date(b.end_date) < now) return true
    return false
  })

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await removeBudget(id)
      refreshBudgets()
    }
  }

  const handleDeleteConstraint = async (id: string) => {
    if (confirm('Are you sure you want to delete this constraint?')) {
      await removeConstraint(id)
      refreshConstraints()
      refreshSummary()
    }
  }

  if (budgetsLoading || constraintsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets & Constraints</h1>
          <p className="text-muted-foreground">Manage your budget constraints and spending limits</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateConstraintModalOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Constraint
          </Button>
          <Button onClick={() => setIsCreateBudgetModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </div>
      </div>

      {/* Main Content - 4 Column Grid (1:1:2 ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Column 1 & 2: Budget Graph (Constraint -> Budget) */}
        <div className="lg:col-span-2 overflow-y-auto pr-2 border-r custom-scrollbar">
            <div className="flex items-center justify-between sticky top-0 bg-background z-20 py-2 border-b mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Budget Map</h2>
                    <Badge variant="outline">{budgets.length}</Badge>
                </div>
            </div>

            <div className="space-y-8 pb-8">
                {/* 1. Mapped Constraints */}
                {enrichedConstraints.map((constraint) => {
                    const constraintBudgets = sortedBudgets.filter(b => b.category_id === constraint.category_id);
                    
                    return (
                        <div key={constraint.id} className="relative grid grid-cols-2 gap-8 group/row">
                            {/* Connector Line (Vertical Spine) - Only if multiple budgets or visual preference */}
                            {/* We can use simple Horizontal connectors from Constraint Right to Budgets Left */}
                            
                            {/* Left: Constraint Node */}
                            <div className="relative z-10">
                                <div className="sticky top-16"> {/* Sticky allows it to follow scroll if list is long */}
                                    <ConstraintCard
                                        constraint={constraint}
                                        onEdit={(id) => console.log('Edit', id)}
                                        onClick={(id) => router.push(`/budgets/constraints/${id}`)}
                                        onDelete={handleDeleteConstraint}
                                    />
                                    {/* Connector Point */}
                                    {constraintBudgets.length > 0 && (
                                        <div className="absolute top-1/2 -right-4 w-4 h-px bg-border group-hover/row:bg-primary/50 transition-colors" />
                                    )}
                                </div>
                            </div>

                            {/* Right: Budget Nodes */}
                            <div className="relative space-y-4">
                                {/* Vertical Tree Line if we want tree structure */}
                                {constraintBudgets.length > 0 && (
                                     <div className="absolute -left-4 top-0 bottom-0 w-px bg-border group-hover/row:bg-primary/50 transition-colors" />
                                )}

                                {constraintBudgets.length === 0 ? (
                                    <div className="h-full flex items-center text-muted-foreground text-sm italic py-4">
                                        No budgets linked
                                    </div>
                                ) : (
                                    constraintBudgets.map((budget) => {
                                        const isActive = selectedBudget?.id === budget.id;
                                        return (
                                            <div key={budget.id} className="relative">
                                                {/* Horizontal Link */}
                                                <div className={`absolute -left-4 top-1/2 w-4 h-px transition-colors ${isActive ? 'bg-primary' : 'bg-border'}`} />
                                                
                                                <div className={`transition-all duration-200 ${isActive ? 'ring-2 ring-primary rounded-lg shadow-md scale-[1.02]' : ''}`}>
                                                    <BudgetCard
                                                        budget={budget}
                                                        variant={budget.status === 'active' ? "active" : "past"}
                                                        onClick={() => handleBudgetSelect(budget)}
                                                        onView={() => handleBudgetSelect(budget)}
                                                        onDelete={handleDeleteBudget}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* 2. Unmapped / Other Budgets */}
                {(() => {
                    const constraintIds = new Set(enrichedConstraints.map(c => c.category_id));
                    const otherBudgets = sortedBudgets.filter(b => !constraintIds.has(b.category_id));
                    
                    if (otherBudgets.length === 0) return null;

                    return (
                        <div className="relative grid grid-cols-2 gap-8 group/other">
                            {/* Left: Other Node */}
                            <div className="relative z-10">
                                <div className="sticky top-16 p-4 border border-dashed rounded-lg bg-muted/20 flex flex-col items-center justify-center text-center h-[120px]">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mb-2">
                                        <span className="text-muted-foreground text-xs font-bold">?</span>
                                    </div>
                                    <h3 className="font-semibold text-muted-foreground">Uncategorized</h3>
                                    <p className="text-xs text-muted-foreground">{otherBudgets.length} budgets</p>

                                    {/* Connector */}
                                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-border group-hover/other:bg-slate-400 transition-colors" />
                                </div>
                            </div>

                            {/* Right: Budget Nodes */}
                            <div className="relative space-y-4">
                                <div className="absolute -left-4 top-0 bottom-0 w-px bg-border group-hover/other:bg-slate-400 transition-colors" />
                                {otherBudgets.map((budget) => {
                                     const isActive = selectedBudget?.id === budget.id;
                                     return (
                                        <div key={budget.id} className="relative">
                                            <div className={`absolute -left-4 top-1/2 w-4 h-px transition-colors ${isActive ? 'bg-primary' : 'bg-border'}`} />
                                            <div className={`transition-all duration-200 ${isActive ? 'ring-2 ring-primary rounded-lg shadow-md scale-[1.02]' : ''}`}>
                                                <BudgetCard
                                                    budget={budget}
                                                    variant={budget.status === 'active' ? "active" : "past"}
                                                    onClick={() => handleBudgetSelect(budget)}
                                                    onView={() => handleBudgetSelect(budget)}
                                                    onDelete={handleDeleteBudget}
                                                />
                                            </div>
                                        </div>
                                     )
                                })}
                            </div>
                        </div>
                    )
                })()}
            </div>
        </div>

        {/* Column 3 & 4: Detail Panel (Placeholder -> Stats) */}
        {!selectedBudget ? (
            <div className="lg:col-span-2 border-dashed border-2 rounded-lg bg-muted/10 flex flex-col items-center justify-center m-4 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                     <Wallet className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium">Select a Budget</h3>
                <p className="text-sm">Click on any budget in the map to view detailed statistics.</p>
            </div>
        ) : (
            <div className="lg:col-span-2 flex flex-col p-1 overflow-y-auto animate-in slide-in-from-right-4 duration-300">
                 {/* Detail View Header */}
                 <div className="flex items-start justify-between mb-6 pb-4 border-b">
                     <div>
                         <h2 className="text-2xl font-bold">{selectedBudget.name}</h2>
                         <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                             <Badge variant={selectedBudget.status === 'active' ? 'default' : 'secondary'}>{selectedBudget.status}</Badge>
                             <span>•</span>
                             <span>{formatDate(selectedBudget.start_date)} - {formatDate(selectedBudget.end_date)}</span>
                         </div>
                     </div>
                     <Button variant="outline" size="sm" onClick={() => router.push(`/budgets/${selectedBudget.id}`)}>
                         Full Detail <ArrowUpRight className="ml-2 h-4 w-4" />
                     </Button>
                 </div>

                 {/* Key Stats Grid */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                     <Card>
                         <CardContent className="pt-6">
                             <div className="text-sm font-medium text-muted-foreground">Spent</div>
                             <div className="text-2xl font-bold text-primary">{formatCurrency(selectedBudget.spent_amount)}</div>
                             <Progress value={Math.min((selectedBudget.spent_amount / selectedBudget.amount) * 100, 100)} className="h-2 mt-2" />
                         </CardContent>
                     </Card>
                     <Card>
                         <CardContent className="pt-6">
                             <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                             <div className="text-2xl font-bold">{formatCurrency(selectedBudget.amount - selectedBudget.spent_amount)}</div>
                             <div className="text-xs text-muted-foreground mt-2">
                                 of {formatCurrency(selectedBudget.amount)} total
                             </div>
                         </CardContent>
                     </Card>
                 </div>

                 {/* Transactions Preview */}
                 <div className="flex-1 min-h-0 flex flex-col">
                     <h3 className="font-semibold mb-4 flex items-center gap-2">
                         <History className="h-4 w-4" /> Recent Transactions
                     </h3>
                     {detailsLoading ? (
                         <div className="flex-1 flex items-center justify-center">Loading transactions...</div>
                     ) : selectedTransactions.length === 0 ? (
                         <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">No transactions found</div>
                     ) : (
                         <div className="space-y-3 overflow-y-auto pr-2">
                             {selectedTransactions.map((tx) => (
                                 <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                     <div className="flex items-center gap-3">
                                         <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.amount < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                             {tx.amount < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                         </div>
                                         <div>
                                             <div className="font-medium text-sm">{tx.description || "Unnamed Transaction"}</div>
                                             <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                                         </div>
                                     </div>
                                     <div className={`font-semibold text-sm ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                         {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                     </div>
                                 </div>
                             ))}
                             <Button variant="ghost" className="w-full text-xs" onClick={() => router.push(`/budgets/${selectedBudget.id}`)}>
                                 View All Transactions
                             </Button>
                         </div>
                     )}
                 </div>
            </div>
        )}
      </div>

      {/* Modals */}
      <CreateBudgetModal
        open={isCreateBudgetModalOpen}
        onOpenChange={setIsCreateBudgetModalOpen}
        onSuccess={() => {
          refreshBudgets()
        }}
      />

      <CreateConstraintModal
        open={isCreateConstraintModalOpen}
        onOpenChange={setIsCreateConstraintModalOpen}
        onSuccess={() => {
          refreshConstraints()
          refreshSummary()
        }}
      />
    </div>
  )
}
