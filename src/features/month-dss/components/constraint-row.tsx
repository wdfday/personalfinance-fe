import { useState, useEffect, useRef } from "react"
import { CheckCircle2, Edit2, Trash2, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BudgetConstraint } from "@/services/api/types/budget-constraints"
import type { Category } from "@/services/api/types/categories"
import { CategoryPickerPopover } from "@/components/categories/category-picker-popover"

interface ConstraintRowProps {
  constraint: BudgetConstraint
  categories: Category[]
  isSelected: boolean
  isEditing: boolean
  onToggle: (id: string) => void
  onEditStart: (id: string) => void
  onEditEnd: () => void
  onUpdate: (id: string, updates: Partial<BudgetConstraint>) => void
  onDelete: (id: string) => void
}

export function ConstraintRow({
  constraint: c,
  categories,
  isSelected,
  isEditing,
  onToggle,
  onEditStart,
  onEditEnd,
  onUpdate,
  onDelete
}: ConstraintRowProps) {
  // Local state for inputs to allow smooth typing without re-formatting interference
  const [localCategoryId, setLocalCategoryId] = useState(c.category_id || '')
  const [localName, setLocalName] = useState(c.category_name || c.description || '')
  const [localMin, setLocalMin] = useState(c.minimum_amount?.toString() || '0')
  const [localMax, setLocalMax] = useState((c.maximum_amount || c.minimum_amount)?.toString() || '0')
  const [localFlexible, setLocalFlexible] = useState(c.is_flexible)
  const [localError, setLocalError] = useState<string | null>(null)

  // Sync local state when external constraint changes
  useEffect(() => {
    if (!isEditing) {
      setLocalCategoryId(c.category_id || '')
      setLocalName(c.category_name || c.description || '')
      setLocalMin(c.minimum_amount?.toString() || '0')
      setLocalMax((c.maximum_amount || c.minimum_amount)?.toString() || '0')
      setLocalFlexible(c.is_flexible)
      setLocalError(null)
    }
  }, [c, isEditing])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleSave = () => {
    if (!localCategoryId) {
      setLocalError("Vui lòng chọn danh mục (category) trước khi lưu")
      return
    }

    const minVal = parseFloat(localMin) || 0
    let maxVal = parseFloat(localMax) || 0

    // Validation: Max > Min if flexible
    if (localFlexible) {
        if (maxVal <= minVal) {
            maxVal = minVal // Auto-correct to at least min, or maybe min + 1? 
            // Better to just set equal if invalid, effectively fixed but marked flexible. Not ideal but safe.
            // User asked for max > min. If user typed 500k min, 200k max -> invalid.
            // Let's set max = min if it's invalid
            maxVal = minVal
        }
    } else {
        // If fixed, max = min
        maxVal = minVal
    }

    onUpdate(c.id, {
      category_id: localCategoryId,
      category_name: localName,
      description: localName,
      minimum_amount: minVal,
      maximum_amount: maxVal,
      is_flexible: localFlexible
    })
    onEditEnd()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onEditEnd()
    }
  }

  const isWarning = (c.minimum_amount || 0) <= 0

  return (
    <tr 
      className={`transition-colors ${isSelected ? 'bg-card' : 'bg-muted/30 opacity-60'} hover:bg-accent`}
    >
      <td className="px-4 py-3 text-center">
        <div 
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
          onClick={() => onToggle(c.id)}
          onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault()
                 onToggle(c.id)
             }
          }}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
        >
          {isSelected && <CheckCircle2 className="w-3 h-3" />}
        </div>
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="space-y-2">
            <CategoryPickerPopover
              categories={categories}
              value={localCategoryId}
              onChange={(nextId) => {
                setLocalCategoryId(nextId)
                const picked = categories.find((x) => x.id === nextId)
                if (picked) {
                  setLocalName(picked.name)
                }
                setLocalError(null)
              }}
              placeholder="Chọn danh mục (category)..."
            />

            {localError && (
              <div className="text-xs text-red-600">{localError}</div>
            )}
          </div>
        ) : (
          <div>
            <div className="font-medium">{c.category_name || c.description || 'Unnamed'}</div>
            {c.is_flexible && <span className="text-[10px] text-muted-foreground">Flexible</span>}
          </div>
        )}
      </td>
      
      <td className="px-4 py-3 text-right tabular-nums">
        {isEditing ? (
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-28 px-2 py-1 border rounded text-sm text-right bg-background"
            step="1000"
          />
        ) : (
          formatCurrency(c.minimum_amount)
        )}
      </td>
      
      <td className="px-4 py-3 text-right tabular-nums">
        {isEditing ? (
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-28 px-2 py-1 border rounded text-sm text-right ${localFlexible ? 'bg-background' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            step="1000"
            disabled={!localFlexible}
          />
        ) : (
          <span className={c.is_flexible ? '' : 'text-muted-foreground opacity-50'}>
              {c.is_flexible ? formatCurrency(c.maximum_amount || c.minimum_amount) : '-'}
          </span>
        )}
      </td>
      
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <select
            value={localFlexible ? 'flexible' : 'fixed'}
            onChange={(e) => setLocalFlexible(e.target.value === 'flexible')}
            className="px-2 py-1 border rounded text-xs bg-background"
          >
            <option value="fixed">Fixed</option>
            <option value="flexible">Flexible</option>
          </select>
        ) : (
          <Badge variant="outline" className={c.is_flexible ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-slate-600 border-slate-200 bg-slate-50'}>
            {c.is_flexible ? 'Flexible' : 'Fixed'}
          </Badge>
        )}
      </td>
      
      <td className="px-4 py-3 text-center">
        <div className="flex gap-1 justify-center">
          {isEditing ? (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => onEditStart(c.id)}>
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(c.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
