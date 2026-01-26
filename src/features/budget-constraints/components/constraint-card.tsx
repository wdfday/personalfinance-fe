import type { BudgetConstraint } from '@/services/api/types/budget-constraints'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, XCircle, Calendar } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'

interface ConstraintCardProps {
    constraint: BudgetConstraint
    onEdit?: (constraint: BudgetConstraint) => void
    onEnd?: (id: string) => void
    onClick?: (id: string) => void
    isSelected?: boolean
}

export function ConstraintCard({ constraint, onEdit, onEnd, onClick, isSelected }: ConstraintCardProps) {
    const { categories } = useAppSelector((state) => state.categories)
    const categoryName = categories.find(c => c.id === constraint.category_id)?.name || `Category ${constraint.category_id.slice(0, 8)}...`
    const displayName = constraint.description || categoryName

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <div 
            className={`group flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all ${onClick ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary bg-primary/5 shadow-md' : ''}`}
            onClick={() => onClick?.(constraint.id)}
        >
            <div className="flex-1 min-w-0 gap-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold text-base truncate mr-2">
                        {displayName}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background font-medium">
                            P{constraint.priority}
                        </Badge>
                        <Badge
                            variant={constraint.is_flexible ? "secondary" : "default"}
                            className={`text-[10px] h-5 px-1.5 font-medium ${!constraint.is_flexible ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900' : ''}`}
                        >
                            {constraint.is_flexible ? 'Flexible' : 'Fixed'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize bg-background">
                            {constraint.period}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {constraint.is_flexible ? (
                        <>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-muted-foreground">Min:</span>
                                <span className="font-semibold text-foreground">{formatCurrency(constraint.minimum_amount)}</span>
                            </div>
                            {constraint.maximum_amount !== undefined && constraint.maximum_amount > 0 && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-muted-foreground">Max:</span>
                                        <span className="font-semibold text-foreground">{formatCurrency(constraint.maximum_amount)}</span>
                                    </div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                                        Range: {formatCurrency(constraint.maximum_amount - constraint.minimum_amount)}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-muted-foreground">Amount:</span>
                            <span className="font-semibold text-primary text-base">{formatCurrency(constraint.minimum_amount)}</span>
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground ml-auto sm:ml-0 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(constraint.start_date).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(constraint)
                }}>
                    <Edit className="h-4 w-4" />
                </Button>
                {constraint.status === 'active' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEnd?.(constraint.id)
                        }}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
