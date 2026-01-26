"use client"

import { useEffect, useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { useCategories } from "@/hooks/use-categories"
import { useBudgetConstraints } from "@/hooks/use-budget-constraints"
import { useBudgets } from "@/hooks/use-budgets"
import { BudgetConstraint } from "@/services/api/types/budget-constraints"
import { Budget } from "@/services/api/types/budgets"
import { Transaction } from "@/services/api/types/transactions"
import { Button } from "@/components/ui/button"
import { Plus, ArchiveRestore, Wallet, TrendingUp, Target } from "lucide-react"
import { ConstraintCard } from "@/features/budget-constraints/components/constraint-card"
import { ConstraintDetail } from "@/features/budget-constraints/components/constraint-detail"
import { ConstraintStats } from "@/features/budget-constraints/components/constraint-stats"
import { OtherItemsView } from "@/features/budget-constraints/components/other-items-view"
import { BudgetDetail } from "@/features/budgets/components/budget-detail"
import { BudgetCharts } from "@/features/budgets/components/budget-charts"
import { CreateConstraintModal } from "@/features/budget-constraints/components/create-constraint-modal"
import { EditConstraintModal } from "@/features/budget-constraints/components/edit-constraint-modal"
import { CreateBudgetModal } from "@/features/budgets/components/create-budget-modal"
import { transactionsService } from "@/services/api/services/transactions.service"

export default function BudgetsPage() {
  const dispatch = useAppDispatch()
  const { categories, refreshCategories } = useCategories()
  const { 
      constraints, 
      summary, 
      isLoading: constraintsLoading, 
      refreshConstraints, 
      refreshSummary,
      endConstraint,
      editConstraint
  } = useBudgetConstraints()
  const { budgets, refreshBudgets, isLoading: budgetsLoading } = useBudgets()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedConstraintId, setSelectedConstraintId] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [editingConstraint, setEditingConstraint] = useState<BudgetConstraint | null>(null)
  const [viewMode, setViewMode] = useState<"active" | "ended" | "other">("active")
  const [otherBudgets, setOtherBudgets] = useState<Budget[]>([])
  const [otherTransactions, setOtherTransactions] = useState<Transaction[]>([])
  const [isLoadingOther, setIsLoadingOther] = useState(false)
  
  useEffect(() => {
    refreshConstraints()
    refreshSummary()
    refreshCategories()
    refreshBudgets()
  }, [refreshConstraints, refreshSummary, refreshCategories, refreshBudgets])

  useEffect(() => {
    dispatch(fetchTransactions({ 
      direction: "DEBIT",
      pageSize: 100
    }))
  }, [dispatch])

  // Fetch other items when switching to "other" tab
  useEffect(() => {
    if (viewMode === "other") {
      fetchOtherItems()
    }
  }, [viewMode, constraints, budgets])

  const fetchOtherItems = async () => {
    setIsLoadingOther(true)
    try {
      // Get budgets without constraints
      const constraintCategoryIds = new Set(constraints.map(c => c.category_id))
      const budgetsWithoutConstraints = (budgets || []).filter(b => 
        !b.category_id || !constraintCategoryIds.has(b.category_id)
      )
      setOtherBudgets(budgetsWithoutConstraints)

      // Get transactions without links (DEBIT direction, no links or no BUDGET/GOAL/DEBT links)
      const transactionsData = await transactionsService.getAll({
        direction: 'DEBIT',
        limit: 100
      })
      
      const transactionsWithoutLinks = transactionsData.transactions.filter((tx: Transaction) => {
        // No links at all
        if (!tx.links || tx.links.length === 0) {
          return true
        }
        // Has links but none are BUDGET, GOAL, or DEBT (exclude INCOME_PROFILE)
        const hasRelevantLink = tx.links.some((link) => 
          link.type === 'BUDGET' || link.type === 'GOAL' || link.type === 'DEBT'
        )
        return !hasRelevantLink
      })
      
      setOtherTransactions(transactionsWithoutLinks)
    } catch (error) {
      console.error("Failed to fetch other items:", error)
    } finally {
      setIsLoadingOther(false)
    }
  }

  const handleEdit = (constraint: BudgetConstraint) => {
      setEditingConstraint(constraint)
      setIsEditModalOpen(true)
  }

  const handleEnd = async (id: string) => {
      if (confirm("Are you sure you want to mark this constraint as ended?")) {
          await endConstraint(id)
          refreshConstraints()
          refreshSummary()
      }
  }

  // Filter items
  const activeItems = constraints.filter(c => c.status === 'active')
  const historyItems = constraints.filter(c => c.status !== 'active') // Includes both 'ended' and 'archived'
  
  const displayedItems = viewMode === "active" ? activeItems : historyItems
  
  const selectedConstraint = constraints.find(c => c.id === selectedConstraintId)

  const handleBudgetClick = (budget: Budget) => {
    setSelectedBudget(budget)
    setSelectedConstraintId(null) // Clear constraint selection
  }

  const handleConstraintClick = (id: string) => {
    setSelectedConstraintId(id)
    setSelectedBudget(null) // Clear budget selection
  }

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
        {/* Left Sidebar - List */}
        <div className="w-full md:w-1/3 lg:w-3/12 border-r bg-gradient-to-b from-background to-muted/20 flex flex-col">
            <div className="p-5 border-b bg-background/80 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Constraints</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsCreateBudgetModalOpen(true)} className="shadow-sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Budget
                        </Button>
                        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1">
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button 
                            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${viewMode === 'active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setViewMode('active')}
                        >
                            Active ({activeItems.length})
                        </button>
                        <button 
                            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${viewMode === 'ended' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setViewMode('ended')}
                        >
                            Ended ({historyItems.length})
                        </button>
                    </div>
                    <button 
                        className={`w-full text-xs font-medium py-1.5 px-3 rounded-md transition-all ${viewMode === 'other' ? 'bg-background shadow-sm text-foreground border border-primary' : 'text-muted-foreground hover:text-foreground border border-transparent'}`}
                        onClick={() => setViewMode('other')}
                    >
                        Other
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {viewMode === 'other' ? (
                     <OtherItemsView 
                         budgets={otherBudgets}
                         transactions={otherTransactions}
                         isLoading={isLoadingOther || budgetsLoading}
                         onBudgetClick={handleBudgetClick}
                         selectedBudgetId={selectedBudget?.id || null}
                     />
                 ) : constraintsLoading ? (
                     <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
                 ) : displayedItems.length === 0 ? (
                     <div className="text-center py-16 px-4">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
                             <Wallet className="h-10 w-10 text-muted-foreground/50" />
                         </div>
                         <p className="text-sm font-medium text-muted-foreground mb-1">
                             {viewMode === 'active' ? "No active constraints" : "No history records"}
                         </p>
                         <p className="text-xs text-muted-foreground/70">
                             {viewMode === 'active' ? "Create your first constraint to get started" : "Ended constraints will appear here"}
                         </p>
                     </div>
                 ) : (
                     displayedItems.map(constraint => (
                         <ConstraintCard 
                             key={constraint.id} 
                             constraint={constraint} 
                             onEdit={handleEdit}
                             onClick={handleConstraintClick}
                             onEnd={handleEnd}
                             isSelected={selectedConstraintId === constraint.id}
                         />
                     ))
                 )}
            </div>
        </div>
        
        {/* Right Content - Detail */}
        <div className="flex-1 bg-background overflow-y-auto">
             {selectedBudget ? (
                 <div className="p-6 md:p-8 max-w-4xl mx-auto">
                     <BudgetDetail 
                         budget={selectedBudget} 
                         onClose={() => setSelectedBudget(null)}
                     />
                 </div>
             ) : selectedConstraint ? (
                 <div className="p-6 md:p-8 max-w-4xl mx-auto">
                     <ConstraintDetail 
                         constraint={selectedConstraint} 
                         onClose={() => setSelectedConstraintId(null)}
                         onEdit={handleEdit}
                         onEnd={selectedConstraint.status === 'active' ? handleEnd : undefined}
                     />
                 </div>
             ) : (
                 <div className="p-6 md:p-8 h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
                     <div className="mb-8">
                         <div className="flex items-center gap-3 mb-3">
                             <div className="p-3 rounded-xl bg-primary/10">
                                 <TrendingUp className="h-6 w-6 text-primary" />
                             </div>
                             <div>
                                 <h1 className="text-3xl font-bold tracking-tight">Budget Constraints Overview</h1>
                                 <p className="text-muted-foreground mt-1">Select a constraint to view details or manage your budget limits below.</p>
                             </div>
                         </div>
                     </div>
                     <div className="max-w-4xl w-full mx-auto space-y-6 mb-8">
                         <ConstraintStats summary={summary} isLoading={constraintsLoading} />
                         <BudgetCharts />
                     </div>
                     <div className="flex-1 flex items-center justify-center">
                         <div className="text-center max-w-md">
                             <div className="relative inline-block mb-6">
                                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                                 <div className="relative p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 backdrop-blur-sm">
                                     <Wallet className="h-16 w-16 mx-auto text-primary/60 mb-4" />
                                 </div>
                             </div>
                             <h3 className="text-lg font-semibold mb-2 text-foreground">Select a constraint</h3>
                             <p className="text-sm text-muted-foreground">
                                 Choose a constraint from the list to view detailed information, edit settings, or manage your budget limits.
                             </p>
                         </div>
                     </div>
                 </div>
             )}
        </div>

      <CreateConstraintModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          refreshConstraints()
          refreshSummary()
        }}
      />

      <CreateBudgetModal 
        open={isCreateBudgetModalOpen} 
        onOpenChange={setIsCreateBudgetModalOpen}
        onSuccess={() => {
          refreshBudgets()
        }}
      />

      {editingConstraint && (
        <EditConstraintModal 
          open={isEditModalOpen} 
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) setEditingConstraint(null)
          }}
          constraint={editingConstraint}
          onSuccess={() => {
            refreshConstraints()
            refreshSummary()
            setEditingConstraint(null)
          }}
        />
      )}
    </div>
  )
}
