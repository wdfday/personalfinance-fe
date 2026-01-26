
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchIncomeProfiles, deleteIncomeProfile, archiveIncomeProfile, unarchiveIncomeProfile, endIncomeProfile } from "../incomeSlice"
import { IncomeCard } from "../components/income-card"
import { IncomeStats } from "../components/income-stats"
import { IncomeDetail } from "../components/income-detail"
import { IncomeCharts } from "../components/income-charts"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { CreateIncomeModal } from "../components/create-income-modal"
import { EditIncomeModal } from "../components/edit-income-modal"
import { Button } from "@/components/ui/button"
import { Plus, Archive, ArchiveRestore } from "lucide-react"
import { IncomeProfile } from "@/lib/api"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IncomePage() {
  const dispatch = useAppDispatch()
  const { items, summary, isLoading } = useAppSelector((state) => state.income)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedIncomeId, setSelectedIncomeId] = useState<string | null>(null)
  const [editingIncome, setEditingIncome] = useState<IncomeProfile | null>(null)
  const [viewMode, setViewMode] = useState<"active" | "history">("active")
  
  useEffect(() => {
    dispatch(fetchIncomeProfiles())
    
    // Fetch income transactions cho charts
    dispatch(fetchTransactions({ 
      direction: "CREDIT",
      pageSize: 100
    }))
  }, [dispatch])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this income profile?")) {
      await dispatch(deleteIncomeProfile(id))
      if (selectedIncomeId === id) {
          setSelectedIncomeId(null)
      }
      dispatch(fetchIncomeProfiles())
    }
  }

  const handleEdit = (income: IncomeProfile) => {
      setEditingIncome(income)
      setIsEditModalOpen(true)
  }

  const handleArchive = async (id: string) => {
      if (confirm("Are you sure you want to archive this income profile?")) {
          await dispatch(archiveIncomeProfile(id))
          if (selectedIncomeId === id) {
              setSelectedIncomeId(null)
          }
          dispatch(fetchIncomeProfiles())
      }
  }

  const handleUnarchive = async (id: string) => {
      await dispatch(unarchiveIncomeProfile(id))
      dispatch(fetchIncomeProfiles())
  }

  const handleEnd = async (id: string) => {
      if (confirm("Are you sure you want to mark this income profile as ended?")) {
          await dispatch(endIncomeProfile(id))
          dispatch(fetchIncomeProfiles())
      }
  }

  // Filter items
  const activeItems = items.filter(i => i.status === 'active')
  const historyItems = items.filter(i => i.status !== 'active')
  
  const displayedItems = viewMode === "active" ? activeItems : historyItems
  
  const selectedIncome = items.find(i => i.id === selectedIncomeId)

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
        {/* Left Sidebar - List */}
        <div className="w-full md:w-1/3 lg:w-3/12 border-r bg-muted/10 flex flex-col">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Income</h2>
                    <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="flex bg-muted p-1 rounded-lg">
                    <button 
                        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${viewMode === 'active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setViewMode('active')}
                    >
                        Active ({activeItems.length})
                    </button>
                    <button 
                        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${viewMode === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setViewMode('history')}
                    >
                        Archive ({historyItems.length})
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {isLoading ? (
                     <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
                 ) : displayedItems.length === 0 ? (
                     <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-background/50">
                         {viewMode === 'active' ? "No active income profiles." : "No history records."}
                     </div>
                 ) : (
                     displayedItems.map(item => (
                         <IncomeCard 
                             key={item.id} 
                             income={item} 
                             onEdit={handleEdit}
                             onClick={() => setSelectedIncomeId(item.id)}
                             isSelected={selectedIncomeId === item.id}
                         />
                     ))
                 )}
            </div>
        </div>
        
        {/* Right Content - Detail */}
        <div className="flex-1 bg-background overflow-y-auto">
             {selectedIncome ? (
                 <div className="p-6 md:p-8 max-w-4xl mx-auto">
                     <IncomeDetail 
                         income={selectedIncome} 
                         onClose={() => setSelectedIncomeId(null)}
                         onEdit={handleEdit}
                         onArchive={selectedIncome.is_archived ? undefined : handleArchive}
                         onUnarchive={selectedIncome.is_archived ? handleUnarchive : undefined}
                         onEnd={selectedIncome.status === 'active' ? handleEnd : undefined}
                     />
                 </div>
             ) : (
                 <div className="p-6 md:p-8 h-full flex flex-col">
                     <div className="mb-8">
                         <h1 className="text-3xl font-bold tracking-tight mb-2">Income Overview</h1>
                         <p className="text-muted-foreground">Select an income source to view details or manage your verified earnings below.</p>
                     </div>
                     <div className="max-w-4xl w-full mx-auto space-y-6">
                         <IncomeStats summary={summary} isLoading={isLoading} />
                         <IncomeCharts />
                     </div>
                     <div className="flex-1 flex items-center justify-center text-muted-foreground opacity-20">
                         <div className="text-center">
                             <ArchiveRestore className="h-24 w-24 mx-auto mb-4" />
                             <p className="text-lg font-medium">Select an item to view details</p>
                         </div>
                     </div>
                 </div>
             )}
        </div>

      <CreateIncomeModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => dispatch(fetchIncomeProfiles())}
      />

      <EditIncomeModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        income={editingIncome}
        onSuccess={() => {
          dispatch(fetchIncomeProfiles())
          setEditingIncome(null)
        }}
      />
    </div>
  )
}
