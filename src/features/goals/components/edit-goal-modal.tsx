"use client"

import { useState, useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { updateGoal } from "@/features/goals/goalsSlice"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Goal, UpdateGoalRequest, GoalBehavior, GoalCategory, GoalPriority } from "@/services/api/types/goals"

interface EditGoalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goal: Goal | null
}

export function EditGoalModal({ open, onOpenChange, goal }: EditGoalModalProps) {
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<UpdateGoalRequest>({
        name: "",
        description: "",
        behavior: "flexible",
        category: "savings",
        priority: "medium",
        target_amount: 0,
        start_date: "",
        target_date: "",
        notes: "",
    })

    // Pre-fill form when goal changes
    useEffect(() => {
        if (goal) {
            setFormData({
                name: goal.name,
                description: goal.description || "",
                behavior: goal.behavior || "flexible",
                category: goal.category || "savings",
                priority: goal.priority,
                target_amount: goal.target_amount,
                start_date: goal.start_date ? goal.start_date.split('T')[0] : "",
                target_date: goal.target_date ? goal.target_date.split('T')[0] : "",
                notes: goal.notes || "",
            })
        }
    }, [goal])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!goal || !formData.name || (formData.target_amount !== undefined && formData.target_amount <= 0)) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Convert dates to RFC3339 if they changed
            const requestData: UpdateGoalRequest = {
                ...formData,
                start_date: formData.start_date ? `${formData.start_date}T00:00:00Z` : undefined,
                target_date: formData.target_date ? `${formData.target_date}T23:59:59Z` : undefined,
            }

            await dispatch(updateGoal({ id: goal.id, data: requestData })).unwrap()
            toast({
                title: "Goal updated",
                description: `"${formData.name}" has been updated successfully.`,
            })
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update goal. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!goal) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Goal</DialogTitle>
                    <DialogDescription>
                        Update your financial goal details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="col-span-2">
                            <Label htmlFor="name">Goal Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: GoalCategory) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="debt">Debt Payoff</SelectItem>
                                    <SelectItem value="investment">Investment</SelectItem>
                                    <SelectItem value="purchase">Purchase</SelectItem>
                                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                                    <SelectItem value="retirement">Retirement</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Behavior */}
                        <div>
                            <Label htmlFor="behavior">Behavior *</Label>
                            <Select
                                value={formData.behavior}
                                onValueChange={(value: GoalBehavior) => setFormData({ ...formData, behavior: value })}
                            >
                                <SelectTrigger id="behavior">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flexible">Flexible</SelectItem>
                                    <SelectItem value="willing">Willing (converts to budget)</SelectItem>
                                    <SelectItem value="recurring">Recurring</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div>
                            <Label htmlFor="priority">Priority *</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: GoalPriority) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Target Amount */}
                        <div>
                            <Label htmlFor="target_amount">Target Amount (VND) *</Label>
                            <Input
                                id="target_amount"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.target_amount || ""}
                                onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                                required
                            />
                        </div>



                        {/* Start Date */}
                        <div>
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <Label htmlFor="target_date">Target Date</Label>
                            <Input
                                id="target_date"
                                type="date"
                                value={formData.target_date}
                                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
