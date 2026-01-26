"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Target, Wallet, CreditCard, DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TransactionLink, TransactionLinkType } from "@/types/api"

interface LinkOption {
    id: string
    name: string
    type: TransactionLinkType
}

interface TransactionLinkSelectorProps {
    value: TransactionLink[]
    onChange: (links: TransactionLink[]) => void
    budgets?: { id: string; name: string }[]
    debts?: { id: string; name: string }[]
    incomeProfiles?: { id: string; name: string }[]
    className?: string
    compact?: boolean // For table cell display
    direction?: 'DEBIT' | 'CREDIT' // Filter links based on transaction direction
}

export function TransactionLinkSelector({
    value = [],
    onChange,
    budgets = [],
    debts = [],
    incomeProfiles = [],
    className,
    compact = false,
    direction,
}: TransactionLinkSelectorProps) {
    const [open, setOpen] = useState(false)

    // Filter options based on transaction direction
    // DEBIT (outcome/expense): only Budget and Debt
    // CREDIT (income): only Income Profile
    let filteredBudgets: { id: string; name: string }[] = []
    let filteredDebts: { id: string; name: string }[] = []
    let filteredIncomeProfiles: { id: string; name: string }[] = []

    if (direction === 'DEBIT') {
        // For expenses: show Budget and Debt only
        filteredBudgets = budgets
        filteredDebts = debts
    } else if (direction === 'CREDIT') {
        // For income: show Income Profile only
        filteredIncomeProfiles = incomeProfiles
    } else {
        // No direction specified: show all (except Goals - Goals use contribution mechanism)
        filteredBudgets = budgets
        filteredDebts = debts
        filteredIncomeProfiles = incomeProfiles
    }

    // Combine filtered options with their types
    const allOptions: LinkOption[] = [
        ...filteredBudgets.map(b => ({ id: b.id, name: b.name, type: 'BUDGET' as TransactionLinkType })),
        ...filteredDebts.map(d => ({ id: d.id, name: d.name, type: 'DEBT' as TransactionLinkType })),
        ...filteredIncomeProfiles.map(i => ({ id: i.id, name: i.name, type: 'INCOME_PROFILE' as TransactionLinkType })),
    ]

    const getLinkIcon = (type: TransactionLinkType) => {
        switch (type) {
            case 'GOAL': return <Target className="h-3 w-3" />
            case 'BUDGET': return <Wallet className="h-3 w-3" />
            case 'DEBT': return <CreditCard className="h-3 w-3" />
            case 'INCOME_PROFILE': return <DollarSign className="h-3 w-3" />
        }
    }

    const getLinkColor = (type: TransactionLinkType) => {
        switch (type) {
            case 'GOAL': return 'border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950'
            case 'BUDGET': return 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
            case 'DEBT': return 'border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950'
            case 'INCOME_PROFILE': return 'border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950'
        }
    }

    const getLinkTypeLabel = (type: TransactionLinkType) => {
        switch (type) {
            case 'GOAL': return 'Mục tiêu'
            case 'BUDGET': return 'Ngân sách'
            case 'DEBT': return 'Nợ'
            case 'INCOME_PROFILE': return 'Thu nhập'
        }
    }

    const isSelected = (optionId: string) => {
        return value.some(link => link.id === optionId)
    }

    const handleSelect = (option: LinkOption) => {
        const isAlreadySelected = isSelected(option.id)

        if (isAlreadySelected) {
            // Remove from selection
            onChange(value.filter(link => link.id !== option.id))
        } else {
            // Add to selection
            onChange([...value, { type: option.type, id: option.id }])
        }
    }

    const handleRemove = (linkId: string) => {
        onChange(value.filter(link => link.id !== linkId))
    }

    // Get option details for selected links
    const getSelectedOption = (link: TransactionLink): LinkOption | undefined => {
        return allOptions.find(opt => opt.id === link.id && opt.type === link.type)
    }

    return (
        <div className={compact ? "space-y-1" : "space-y-2"}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        size={compact ? "sm" : "default"}
                        className={`${compact ? "h-7 text-xs w-full" : "w-full"} justify-between ${className || ""}`}
                    >
                        <span className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground truncate`}>
                            {value.length > 0 ? `${value.length} liên kết` : compact ? "Chọn..." : "Chọn liên kết..."}
                        </span>
                        <ChevronsUpDown className={`ml-2 ${compact ? "h-3 w-3" : "h-4 w-4"} shrink-0 opacity-50`} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Tìm kiếm..." />
                        <CommandList>
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>

                            {/* Budgets */}
                            {filteredBudgets.length > 0 && (
                                <CommandGroup heading="💰 Ngân sách">
                                    {filteredBudgets.map((budget) => {
                                        const option: LinkOption = { id: budget.id, name: budget.name, type: 'BUDGET' }
                                        return (
                                            <CommandItem
                                                key={budget.id}
                                                value={`budget-${budget.id}-${budget.name}`}
                                                onSelect={() => handleSelect(option)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {getLinkIcon('BUDGET')}
                                                    <span className="text-sm">{budget.name}</span>
                                                </div>
                                                <Check
                                                    className={`h-4 w-4 ${isSelected(budget.id) ? "opacity-100" : "opacity-0"}`}
                                                />
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )}

                            {/* Debts */}
                            {filteredDebts.length > 0 && (
                                <CommandGroup heading="💳 Nợ">
                                    {filteredDebts.map((debt) => {
                                        const option: LinkOption = { id: debt.id, name: debt.name, type: 'DEBT' }
                                        return (
                                            <CommandItem
                                                key={debt.id}
                                                value={`debt-${debt.id}-${debt.name}`}
                                                onSelect={() => handleSelect(option)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {getLinkIcon('DEBT')}
                                                    <span className="text-sm">{debt.name}</span>
                                                </div>
                                                <Check
                                                    className={`h-4 w-4 ${isSelected(debt.id) ? "opacity-100" : "opacity-0"}`}
                                                />
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )}

                            {/* Income Profiles */}
                            {filteredIncomeProfiles.length > 0 && (
                                <CommandGroup heading="💵 Thu nhập">
                                    {filteredIncomeProfiles.map((profile) => {
                                        const option: LinkOption = { id: profile.id, name: profile.name, type: 'INCOME_PROFILE' }
                                        return (
                                            <CommandItem
                                                key={profile.id}
                                                value={`income-${profile.id}-${profile.name}`}
                                                onSelect={() => handleSelect(option)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {getLinkIcon('INCOME_PROFILE')}
                                                    <span className="text-sm">{profile.name}</span>
                                                </div>
                                                <Check
                                                    className={`h-4 w-4 ${isSelected(profile.id) ? "opacity-100" : "opacity-0"}`}
                                                />
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected Links Display - Only show in non-compact mode */}
            {!compact && value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((link) => {
                        const option = getSelectedOption(link)
                        if (!option) return null

                        return (
                            <Badge
                                key={link.id}
                                variant="outline"
                                className={`flex items-center gap-1 ${getLinkColor(link.type)}`}
                            >
                                {getLinkIcon(link.type)}
                                <span className="text-xs">{getLinkTypeLabel(link.type)}</span>
                                <span className="text-xs font-medium">{option.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(link.id)}
                                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
