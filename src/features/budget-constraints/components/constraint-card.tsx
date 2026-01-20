import { BudgetConstraint } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Archive } from 'lucide-react'

interface ConstraintCardProps {
    constraint: BudgetConstraint
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
    onClick?: (id: string) => void
}

export function ConstraintCard({ constraint, onEdit, onDelete, onArchive, onClick }: ConstraintCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <div 
            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
            onClick={() => onClick?.(constraint.id)}
        >
            <div className="flex-1 min-w-0 gap-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-medium truncate mr-2">
                        {constraint.category_name || `Category ${constraint.category_id}`}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">
                            P{constraint.priority}
                        </Badge>
                        <Badge
                            variant={constraint.is_flexible ? "secondary" : "default"}
                            className={`text-[10px] h-5 px-1.5 ${!constraint.is_flexible ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900' : ''}`}
                        >
                            {constraint.is_flexible ? 'Flexible' : 'Fixed'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize bg-background">
                            {constraint.period}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Min:</span>
                        <span>{formatCurrency(constraint.minimum_amount)}</span>
                    </div>
                    {constraint.maximum_amount !== undefined && constraint.maximum_amount > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">Max:</span>
                            <span>{formatCurrency(constraint.maximum_amount)}</span>
                        </div>
                    )}
                    {constraint.is_flexible && constraint.maximum_amount !== undefined && constraint.maximum_amount > 0 && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Range: {formatCurrency(constraint.maximum_amount - constraint.minimum_amount)}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground ml-auto sm:ml-0">
                        {new Date(constraint.start_date).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit?.(constraint.id)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-orange-600 hover:text-orange-700"
                    onClick={() => onArchive?.(constraint.id)}
                >
                    <Archive className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete?.(constraint.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
