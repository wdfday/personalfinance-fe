import React from "react"
import type { Category } from "@/services/api/types/categories"
import { cn } from "@/lib/utils"

interface CategoryChipSelectorProps {
  categories: Category[]
  value?: string
  onChange: (categoryId: string) => void
  className?: string
}

export function CategoryChipSelector({
  categories,
  value,
  onChange,
  className
}: CategoryChipSelectorProps) {
  const expenseCategories = categories.filter((c) => c.type === "expense" && c.is_active)

  if (expenseCategories.length === 0) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        Không có danh mục chi tiêu khả dụng. Hãy tạo category trước.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-md border bg-background/80 p-2",
        className
      )}
    >
      {expenseCategories.map((cat) => {
        const selected = cat.id === value
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              "hover:border-primary hover:bg-primary/5",
              selected
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted text-muted-foreground border-muted-foreground/30"
            )}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

