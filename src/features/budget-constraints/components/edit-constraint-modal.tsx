"use client"

import { useState, useEffect } from "react"
import { useBudgetConstraints } from "@/hooks/use-budget-constraints"
import { BudgetConstraint } from "@/services/api/types/budget-constraints"
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

interface EditConstraintModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    constraint: BudgetConstraint | null
    onSuccess?: () => void
}

export function EditConstraintModal({
    open,
    onOpenChange,
    constraint,
    onSuccess,
}: EditConstraintModalProps) {
    const { editConstraint } = useBudgetConstraints()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        minimum_amount: "",
        maximum_amount: "",
        is_flexible: false,
        priority: "5",
        period: "monthly" as BudgetPeriod,
        end_date: "",
        description: "",
    })

    useEffect(() => {
        if (constraint) {
            setFormData({
                minimum_amount: constraint.minimum_amount.toString(),
                maximum_amount: constraint.maximum_amount?.toString() || "",
                is_flexible: constraint.is_flexible,
                priority: constraint.priority.toString(),
                period: constraint.period as BudgetPeriod,
                end_date: constraint.end_date ? new Date(constraint.end_date).toISOString().split('T')[0] : "",
                description: constraint.description || "",
            })
        }
    }, [constraint])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!constraint) return

        setIsSubmitting(true)

        try {
            const payload = {
                minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : undefined,
                maximum_amount: formData.maximum_amount ? parseFloat(formData.maximum_amount) : undefined,
                is_flexible: formData.is_flexible,
                priority: parseInt(formData.priority),
                period: formData.period,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
                description: formData.description || undefined,
            }

            await editConstraint(constraint.id, payload)
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update constraint:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!constraint) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Budget Constraint</DialogTitle>
                    <DialogDescription>
                        Update the constraint settings. This will create a new version and archive the old one.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="e.g., Tiền thuê nhà cố định"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional description for this constraint
                        </p>
                    </div>

                    {/* End Date */}
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Constraint"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
