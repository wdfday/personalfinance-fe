import { Budget } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, Edit, Trash2, RefreshCw } from 'lucide-react'

interface BudgetCardProps {
    budget: Budget
    onView?: (id: string) => void
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onRecalculate?: (id: string) => void
    onClick?: (id: string) => void
    variant?: 'active' | 'past'
    compact?: boolean
}

export function BudgetCard({
    budget,
    onView,
    onEdit,
    onDelete,
    onRecalculate,
    onClick,
    variant = 'active',
}: BudgetCardProps) {
    const formatCurrency = (amount: number, currency: string = 'VND') => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'exceeded':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'paused':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            case 'expired':
                return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const progressPercentage = Math.min((budget.spent_amount / budget.amount) * 100, 100)
    const isOverBudget = budget.spent_amount > budget.amount

    if (variant === 'past') {
        return (
            <Card className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{budget.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(budget.status)}>
                        ENDED
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Spent</span>
                            <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                                {formatCurrency(budget.spent_amount, budget.currency)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Budget</span>
                            <span>{formatCurrency(budget.amount, budget.currency)}</span>
                        </div>

                        <Progress value={progressPercentage} className="h-1" />

                        <div className="text-xs text-muted-foreground">
                            <div>
                                Ended: {budget.end_date && new Date(budget.end_date).toLocaleDateString('vi-VN')}
                            </div>
                            <div>{progressPercentage.toFixed(1)}% used</div>
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full"
                            onClick={() => onView?.(budget.id)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card 
            className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
            onClick={() => onClick?.(budget.id)}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{budget.name}</CardTitle>
                <Badge className={getStatusColor(budget.status)}>{budget.status.toUpperCase()}</Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Spent</span>
                            <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                                {formatCurrency(budget.spent_amount, budget.currency)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Budget</span>
                            <span>{formatCurrency(budget.amount, budget.currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className={budget.remaining_amount < 0 ? 'text-red-600 font-medium' : ''}>
                                {formatCurrency(budget.remaining_amount, budget.currency)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressPercentage} className={isOverBudget ? 'bg-red-100' : ''} />
                    </div>

                    <div className="text-xs text-muted-foreground">
                        <div>Period: {budget.period}</div>
                        <div>Start: {new Date(budget.start_date).toLocaleDateString('vi-VN')}</div>
                        {budget.end_date && (
                            <div>End: {new Date(budget.end_date).toLocaleDateString('vi-VN')}</div>
                        )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => onRecalculate?.(budget.id)}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onView?.(budget.id)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit?.(budget.id)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => onDelete?.(budget.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
