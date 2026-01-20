import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CategoryLineResponse } from "../types"
import { formatCurrency } from "@/lib/utils"

interface MonthGridProps {
    readonly categories: CategoryLineResponse[];
    readonly onAssignCategory: (categoryId: string, amount: number) => void;
    // onMoveMoney: (fromCategory: string, toCategory: string, amount: number) => void;
}

export function MonthGrid({ categories, onAssignCategory }: MonthGridProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Category</TableHead>
                        <TableHead className="text-right">Rollover</TableHead>
                        <TableHead className="text-right">Assigned</TableHead>
                        <TableHead className="text-right">Activity</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.length === 0 ? (
                        <TableRow>
                             <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No categories found. Please initialize categories in settings.
                             </TableCell>
                        </TableRow>
                    ) : (
                        categories.map((cat) => (
                            <TableRow key={cat.category_id}>
                                <TableCell className="font-medium">
                                    {cat.name}
                                    {cat.notes && <span className="text-xs text-muted-foreground block">{cat.notes}</span>}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {formatCurrency(cat.rollover)}
                                </TableCell>
                                <TableCell className="text-right">
                                     {/* 
                                        In a real app, this would be an editable input.
                                        For now, just display text. Click to edit could be added.
                                     */}
                                     <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') { 
                                         const newAmount = prompt(`Assign amount for ${cat.name}`, cat.assigned.toString());
                                         if (newAmount !== null && !Number.isNaN(Number(newAmount))) {
                                             onAssignCategory(cat.category_id, Number(newAmount));
                                         }
                                     }}} className="font-semibold text-blue-600 cursor-pointer hover:underline"
                                         onClick={() => {
                                             const newAmount = prompt(`Assign amount for ${cat.name}`, cat.assigned.toString());
                                             if (newAmount !== null && !Number.isNaN(Number(newAmount))) {
                                                 onAssignCategory(cat.category_id, Number(newAmount));
                                             }
                                         }}
                                     >
                                        {formatCurrency(cat.assigned)}
                                     </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(cat.activity)}
                                </TableCell>
                                <TableCell className={`text-right font-bold ${cat.available < 0 ? "text-red-500" : "text-green-600"}`}>
                                    {formatCurrency(cat.available)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
