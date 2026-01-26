import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, ChevronsUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Category } from "@/services/api/types/categories"
import { cn } from "@/lib/utils"

interface CategoryPickerPopoverProps {
  categories: Category[]
  value?: string
  onChange: (categoryId: string) => void
  placeholder?: string
  className?: string
  categoryType?: "income" | "expense" | "both"
}

export function CategoryPickerPopover({
  categories,
  value,
  onChange,
  placeholder = "Chọn danh mục...",
  className,
  categoryType = "expense"
}: CategoryPickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  type TreeNode = Category & { children: TreeNode[] }

  const builtTree = useMemo(() => {
    const filtered = categories.filter((c) => {
      if (!c.is_active) return false
      if (categoryType === "income") return c.type === "income" || c.type === "both"
      if (categoryType === "expense") return c.type === "expense" || c.type === "both"
      return true // both: show all
    }).map((c) => ({ ...c })) // shallow copy

    const map = new Map<string, TreeNode>()
    filtered.forEach((c) => {
      map.set(c.id, { ...(c as Category), children: [] })
    })

    const roots: TreeNode[] = []
    filtered.forEach((c) => {
      const node = map.get(c.id)
      if (!node) return
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    })

    const sortFn = (a: Category, b: Category) =>
      (a.display_order ?? 0) - (b.display_order ?? 0) || a.name.localeCompare(b.name, "vi")

    const sortChildren = (n: TreeNode) => {
      n.children.sort(sortFn)
      n.children.forEach(sortChildren)
    }
    roots.sort(sortFn)
    roots.forEach(sortChildren)

    return roots
  }, [categories, categoryType])

  const flatCategories = useMemo(
    () => categories.filter((c) => {
      if (!c.is_active) return false
      if (categoryType === "income") return c.type === "income" || c.type === "both"
      if (categoryType === "expense") return c.type === "expense" || c.type === "both"
      return true // both: show all
    }),
    [categories, categoryType]
  )

  const selected = flatCategories.find((c) => c.id === value)

  const collectLeaves = (node: TreeNode): Category[] => {
    if (!node.children || node.children.length === 0) return [node]
    return node.children.flatMap(collectLeaves)
  }

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return builtTree

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matches = node.name.toLowerCase().includes(q)
      const children = node.children.map(filterNode).filter((x): x is TreeNode => x !== null)
      if (matches || children.length > 0) return { ...node, children }
      return null
    }

    return builtTree.map(filterNode).filter((x): x is TreeNode => x !== null)
  }, [builtTree, query])

  // Khi search thì auto expand tất cả node có children để dễ chọn (giống /categories)
  useEffect(() => {
    if (!query.trim()) return
    const ids = new Set<string>()
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children.length > 0) {
          ids.add(n.id)
          walk(n.children)
        }
      })
    }
    walk(filteredTree)
    setExpanded(ids)
  }, [query, filteredTree])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Expand root chứa selected để user thấy ngay (khi mở dropdown)
  useEffect(() => {
    if (!open || !value) return
    // best-effort: expand all roots by default if chưa có state
    if (expanded.size === 0) {
      setExpanded(new Set(builtTree.map((r) => r.id)))
    }
  }, [open, value, builtTree, expanded.size])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-background rounded-md", className)}
        >
          <span className={cn("truncate text-left", selected ? "text-foreground" : "text-muted-foreground")}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[520px] p-0 rounded-sm"
        align="start"
        sideOffset={8}
      >
        {/* Search */}
        <div className="p-3 border-b bg-popover">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm danh mục..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Tree */}
        <div className="max-h-[420px] overflow-y-auto p-3 space-y-4">
          {filteredTree.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy danh mục.
            </div>
          ) : (
            filteredTree.map((root) => {
              const hasChildren = root.children.length > 0
              const isExpanded = expanded.has(root.id)
              const leaves = collectLeaves(root)

              return (
                <div key={root.id} className="rounded-md border bg-background/50">
                  {/* Header row */}
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5",
                      "hover:bg-muted/40 transition-colors"
                    )}
                    onClick={() => hasChildren && toggleExpand(root.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                      <span className="font-medium truncate">{root.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{leaves.length}</span>
                  </button>

                  {/* Body: level cuối hiển thị chip như Medium */}
                  {(isExpanded || !hasChildren) && (
                    <div className="px-3 pb-3">
                      <div className="flex flex-wrap gap-2 pt-1">
                        {leaves.map((leaf) => {
                          const picked = leaf.id === value
                          return (
                            <button
                              key={leaf.id}
                              type="button"
                              onClick={() => {
                                onChange(leaf.id)
                                setOpen(false)
                              }}
                              className={cn(
                                "px-4 py-2 rounded-full border text-sm transition-colors",
                                "hover:bg-muted/30",
                                picked
                                  ? "border-primary text-primary bg-primary/5"
                                  : "border-sky-200 text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-background"
                              )}
                            >
                              {leaf.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

