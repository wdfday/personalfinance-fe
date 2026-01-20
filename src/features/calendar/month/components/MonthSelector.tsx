import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Month } from "../types"

interface MonthSelectorProps {
    months: Month[];
    selectedMonthId?: string;
    onMonthSelect: (monthId: string) => void;
    isLoading?: boolean;
}

export function MonthSelector({ months, selectedMonthId, onMonthSelect, isLoading }: MonthSelectorProps) {
    if (isLoading && months.length === 0) {
        return <div className="h-10 w-[200px] animate-pulse rounded-md bg-muted"></div>
    }

    return (
        <Select value={selectedMonthId} onValueChange={onMonthSelect}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Months</SelectLabel>
                    {months.map((month) => (
                        <SelectItem key={month.id} value={month.id}> 
                           {/* Display formatted month or just the month string? 
                               API returns "2024-02", maybe format to "February 2024"?
                               Let's try basic formatting if possible, otherwise use raw string.
                           */}
                           {month.month}
                        </SelectItem>
                    ))}
                    {months.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">No months found</div>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
