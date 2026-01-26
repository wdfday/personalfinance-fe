"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createConstraint } from "@/features/budget-constraints/budgetConstraintsSlice"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { BudgetPeriod } from "@/types/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CategoryPickerPopover } from "@/components/categories/category-picker-popover"

interface CreateConstraintModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateConstraintModal({
    open,
    onOpenChange,
    onSuccess,
}: CreateConstraintModalProps) {
    const dispatch = useAppDispatch()
    const { categories } = useAppSelector((state) => state.categories)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch categories when modal opens
    useEffect(() => {
        if (open && categories.length === 0) {
            dispatch(fetchCategories())
        }
    }, [open, categories.length, dispatch])


    const [formData, setFormData] = useState({
        category_id: "",
        minimum_amount: "",
        maximum_amount: "",
        is_flexible: false,
        priority: "5",
        period: "monthly" as BudgetPeriod,
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const payload = {
                category_id: formData.category_id,
                minimum_amount: parseFloat(formData.minimum_amount),
                maximum_amount: formData.maximum_amount ? parseFloat(formData.maximum_amount) : undefined,
                is_flexible: formData.is_flexible,
                priority: parseInt(formData.priority),
                period: formData.period,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
            }

            await dispatch(createConstraint(payload)).unwrap()
            onSuccess?.()
            onOpenChange(false)
            // Reset form
            setFormData({
                category_id: "",
                minimum_amount: "",
                maximum_amount: "",
                is_flexible: false,
                priority: "5",
                period: "monthly",
                start_date: new Date().toISOString().split('T')[0],
                end_date: "",
            })
        } catch (error) {
            console.error("Failed to create constraint:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Budget Constraint</DialogTitle>
                    <DialogDescription>
                        Define minimum/maximum spending requirements for a category. These constraints help the
                        DSS optimize your budget allocation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category */}
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category *</Label>
                        <CategoryPickerPopover
                            categories={categories}
                            value={formData.category_id}
                            onChange={(categoryId) => setFormData({ ...formData, category_id: categoryId })}
                            placeholder="Chọn danh mục..."
                        />
                        <p className="text-xs text-muted-foreground">
                            The category this constraint applies to (e.g., Food, Rent, Transport)
                        </p>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="minimum_amount">Minimum Amount *</Label>
                            <Input
                                id="minimum_amount"
                                type="number"
                                step="0.01"
                                placeholder="2000000"
                                value={formData.minimum_amount}
                                onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Required minimum spending</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="maximum_amount">
                                Maximum Amount <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="maximum_amount"
                                type="number"
                                step="0.01"
                                placeholder="3000000"
                                value={formData.maximum_amount}
                                onChange={(e) => setFormData({ ...formData, maximum_amount: e.target.value })}
                                disabled={!formData.is_flexible}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData.is_flexible ? "Max spending limit" : "Enable flexible first"}
                            </p>
                        </div>
                    </div>

                    {/* Period */}
                    <div className="grid gap-2">
                        <Label htmlFor="period">Period</Label>
                        <Select
                            value={formData.period}
                            onValueChange={(value) => setFormData({ ...formData, period: value as BudgetPeriod })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            How often this constraint resets
                        </p>
                    </div>

                    {/* Flexibility */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_flexible">Flexible Constraint</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow DSS to adjust within min-max range
                            </p>
                        </div>
                        <Switch
                            id="is_flexible"
                            checked={formData.is_flexible}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, is_flexible: checked, maximum_amount: checked ? formData.maximum_amount : "" })
                            }
                        />
                    </div>

                    {/* Priority */}
                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority (1-10)</Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                                    <SelectItem key={p} value={p.toString()}>
                                        {p} {p === 1 ? "(Highest)" : p === 10 ? "(Lowest)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Higher priority = more important for DSS allocation
                        </p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">
                                End Date <span className="text-xs text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Constraint"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
