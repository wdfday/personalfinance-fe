'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { format, addMonths } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateMonthModalProps {
    onCreateMonth: (monthStr: string) => Promise<void>; // Format "YYYY-MM"
    latestMonth?: string; // To suggest next month
}

export function CreateMonthModal({ onCreateMonth, latestMonth }: CreateMonthModalProps) {
    const [open, setOpen] = useState(false)
    const [monthStr, setMonthStr] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Suggest next month when opening
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            setError(null)
            if (latestMonth) {
                // Parse "YYYY-MM" and add 1 month
                try {
                    const date = new Date(latestMonth + "-01") // Append day to make parsable?
                    // Or just manual string manipulation? JS Date needs full date or handles "2024-02"?
                    // Safari/old browsers might fail on "2024-02". "2024-02-01" is safer.
                    const nextDate = addMonths(date, 1)
                    setMonthStr(format(nextDate, 'yyyy-MM'))
                } catch (e) {
                    setMonthStr('')
                }
            } else {
                // Default to current month
                setMonthStr(format(new Date(), 'yyyy-MM'))
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!monthStr) return

        setIsLoading(true)
        setError(null)

        try {
            await onCreateMonth(monthStr)
            setOpen(false)
        } catch (err: any) {
            setError(err.message || "Failed to create month")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Month
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Budget Month</DialogTitle>
                        <DialogDescription>
                            Create a new month for your budget. Unbudgeted amounts and category settings will be carried over.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="month" className="text-right">
                                Month
                            </Label>
                            <Input
                                id="month"
                                type="month" // Browser native month picker
                                value={monthStr}
                                onChange={(e) => setMonthStr(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 text-center">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
