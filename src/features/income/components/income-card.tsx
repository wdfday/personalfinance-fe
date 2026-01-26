
import { IncomeProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, History, RotateCcw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface IncomeCardProps {
  income: IncomeProfile
  onEdit: (income: IncomeProfile) => void
  onDelete?: (id: string) => void
  onClick?: () => void
  isSelected?: boolean
}

export function IncomeCard({ income, onEdit, onDelete, onClick, isSelected }: IncomeCardProps) {
  return (
    <Card 
        className={`relative group mb-3 transition-all cursor-pointer hover:border-primary/50 ${isSelected ? 'border-primary shadow-md ring-1 ring-primary/20' : ''} ${!income.is_active ? 'opacity-70' : ''}`}
        onClick={onClick}
    >
       <div className="absolute right-2 top-2 flex space-x-1 opacity-100 group-hover:opacity-100 transition-opacity">
        {onEdit && (
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit(income) }}>
                <Edit className="h-3 w-3" />
             </Button>
        )}
      </div>

      <CardHeader className="pb-2 p-4">
        <div className="flex justify-between items-start">
             <div className="pr-8">
                 <CardTitle className="text-base font-semibold truncate leading-tight">{income.source}</CardTitle>
                 <CardDescription className="flex items-center gap-2 mt-1">
                     <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                         {income.status}
                     </span>
                     {income.is_recurring && (
                         <RotateCcw className="h-3 w-3 text-muted-foreground" />
                     )}
                 </CardDescription>
             </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
          <div className="flex justify-between items-end mt-1">
              <div className="text-xs text-muted-foreground">
                  <span className="block">{income.frequency}</span>
                  {income.start_date && (
                    <span className="flex items-center gap-1 mt-0.5">
                         <History className="h-3 w-3" /> {new Date(income.start_date).toLocaleDateString()}
                    </span>
                  )}
              </div>
              <div className="text-right">
                 <div className="text-lg font-bold text-green-600 dark:text-green-500">
                     {income.amount > 0 ? '+' : ''}{formatCurrency(income.amount, income.currency)}
                 </div>
              </div>
          </div>
      </CardContent>
    </Card>
  )
}
