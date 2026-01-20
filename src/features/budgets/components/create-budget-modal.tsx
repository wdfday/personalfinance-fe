"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { createBudget } from "@/features/budgets/budgetsSlice"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface CreateBudgetModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateBudgetModal({ open, onOpenChange, onSuccess }: CreateBudgetModalProps) {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        amount: "",
        currency: "VND",
        period: "monthly",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        category_id: "",
        account_id: "",
        enable_alerts: true,
        alert_thresholds: ["75", "90"],
        allow_rollover: false,
        carry_over_percent: "50",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                period: formData.period,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
                category_id: formData.category_id || undefined,
                account_id: formData.account_id || undefined,
                enable_alerts: formData.enable_alerts,
                alert_thresholds: formData.alert_thresholds,
                allow_rollover: formData.allow_rollover,
                carry_over_percent: formData.allow_rollover ? parseInt(formData.carry_over_percent) : undefined,
            }

            await dispatch(createBudget(payload)).unwrap()
            onSuccess?.()
            onOpenChange(false)
            // Reset form
            setFormData({
                name: "",
                description: "",
                amount: "",
                currency: "VND",
                period: "monthly",
                start_date: new Date().toISOString().split('T')[0],
                end_date: "",
                category_id: "",
                account_id: "",
                enable_alerts: true,
                alert_thresholds: ["75", "90"],
                allow_rollover: false,
                carry_over_percent: "50",
            })
        } catch (error) {
            console.error("Failed to create budget:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleAlertThreshold = (threshold: string) => {
        setFormData((prev) => ({
            ...prev,
            alert_thresholds: prev.alert_thresholds.includes(threshold)
                ? prev.alert_thresholds.filter((t) => t !== threshold)
                : [...prev.alert_thresholds, threshold].sort(),
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>
                        Set up a budget to track your spending for a specific category or account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Budget Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Monthly Food Budget"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="5000000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VND">VND</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Period & Dates */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="period">Period *</Label>
                            <Select
                                value={formData.period}
                                onValueChange={(value) => setFormData({ ...formData, period: value })}
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
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                                    End Date <span className="text-xs text-muted-foreground">(Optional - auto-calculated)</span>
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">
                                    Category ID <span className="text-xs text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                    id="category_id"
                                    placeholder="Leave empty for all categories"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="account_id">
                                    Account ID <span className="text-xs text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                    id="account_id"
                                    placeholder="Leave empty for all accounts"
                                    value={formData.account_id}
                                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alert Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="enable_alerts">Enable Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when budget thresholds are reached</p>
                            </div>
                            <Switch
                                id="enable_alerts"
                                checked={formData.enable_alerts}
                                onCheckedChange={(checked) => setFormData({ ...formData, enable_alerts: checked })}
                            />
                        </div>

                        {formData.enable_alerts && (
                            <div className="grid gap-2">
                                <Label>Alert Thresholds</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {["50", "75", "90", "100"].map((threshold) => (
                                        <Badge
                                            key={threshold}
                                            variant={formData.alert_thresholds.includes(threshold) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleAlertThreshold(threshold)}
                                        >
                                            {threshold}%
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rollover Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="allow_rollover">Allow Rollover</Label>
                                <p className="text-sm text-muted-foreground">Carry remaining budget to next period</p>
                            </div>
                            <Switch
                                id="allow_rollover"
                                checked={formData.allow_rollover}
                                onCheckedChange={(checked) => setFormData({ ...formData, allow_rollover: checked })}
                            />
                        </div>

                        {formData.allow_rollover && (
                            <div className="grid gap-2">
                                <Label htmlFor="carry_over_percent">Carry Over Percentage</Label>
                                <Input
                                    id="carry_over_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.carry_over_percent}
                                    onChange={(e) => setFormData({ ...formData, carry_over_percent: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Percentage of remaining budget to carry over (0-100%)
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Budget"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
