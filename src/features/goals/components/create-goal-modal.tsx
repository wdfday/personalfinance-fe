"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { createGoal } from "@/features/goals/goalsSlice"
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
import type { CreateGoalRequest, GoalBehavior, GoalCategory, GoalPriority, ContributionFrequency } from "@/types/api"

interface CreateGoalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateGoalModal({ open, onOpenChange }: CreateGoalModalProps) {
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<CreateGoalRequest>({
        name: "",
        description: "",
        behavior: "flexible",
        category: "savings",
        priority: "medium",
        targetAmount: 0,
        accountId: "",
        startDate: new Date().toISOString().split('T')[0],
        targetDate: "",
        contributionFrequency: undefined,
        notes: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || formData.targetAmount <= 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Convert date strings to RFC3339 datetime format and add currency
            const requestData = {
                ...formData,
                currency: "VND",
                startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : new Date().toISOString(),
                targetDate: formData.targetDate ? `${formData.targetDate}T23:59:59Z` : undefined,
            }

            await dispatch(createGoal(requestData)).unwrap()
            toast({
                title: "Goal created",
                description: `"${formData.name}" has been created successfully.`,
            })
            onOpenChange(false)
            // Reset form
            setFormData({
                name: "",
                description: "",
                behavior: "flexible",
                category: "savings",
                priority: "medium",
                targetAmount: 0,
                accountId: "",
                startDate: new Date().toISOString().split('T')[0],
                targetDate: "",
                contributionFrequency: undefined,
                notes: "",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create goal. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                        Set a financial goal and track your progress toward achieving it.
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
                                placeholder="e.g., Emergency Fund, Vacation, New Car"
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
                                placeholder="Add more details about your goal..."
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
                                    <SelectItem value="flexible">Flexible (no fixed deadline)</SelectItem>
                                    <SelectItem value="willing">Willing (target date, converts to budget)</SelectItem>
                                    <SelectItem value="recurring">Recurring (regular contributions)</SelectItem>
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
                            <Label htmlFor="targetAmount">Target Amount (VND) *</Label>
                            <Input
                                id="targetAmount"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.targetAmount || ""}
                                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                                placeholder="0"
                                required
                            />
                        </div>

                        {/* Contribution Frequency */}
                        <div>
                            <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
                            <Select
                                value={formData.contributionFrequency || ""}
                                onValueChange={(value: ContributionFrequency) => setFormData({ ...formData, contributionFrequency: value })}
                            >
                                <SelectTrigger id="contributionFrequency">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one_time">One Time</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <Label htmlFor="targetDate">Target Date</Label>
                            <Input
                                id="targetDate"
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes or reminders..."
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
                            {isSubmitting ? "Creating..." : "Create Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
