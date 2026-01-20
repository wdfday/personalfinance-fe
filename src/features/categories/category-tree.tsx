"use client"

import { useState, useMemo } from "react"
import { CategoryTreeNode } from "./category-tree-node"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Category } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

interface CategoryTreeProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  searchTerm?: string
  typeFilter?: "all" | "income" | "expense" | "both"
  statusFilter?: "all" | "active" | "inactive"
  onAddChild: (parentId: string) => void
  selectedCategoryId?: string
  onSelect: (category: Category) => void
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  searchTerm = "",
  typeFilter = "all",
  statusFilter = "all",
  onAddChild,
  selectedCategoryId,
  onSelect,
}: CategoryTreeProps) {
  const { t } = useTranslation("categories")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Build hierarchical tree from flat list
  const builtTree = useMemo(() => {
    const categoryMap = new Map<string, Category & { children: Category[] }>()
    
    // Initialize map with clones
    categories.forEach(cat => {
      // Create a shallow copy and robustly initialize children array
      // Ignore API-provided children as we rebuild from flat list for consistency
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    const roots: Category[] = []

    // Build connections
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id)
      if (!node) return

      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)
        parent?.children.push(node)
      } else {
        roots.push(node)
      }
    })

    // Sort function (optional, if API sort isn't enough given the map rebuild)
    const sortParams = (a: Category, b: Category) => {
       // Primary: Display Order
       if ((a.display_order ?? 0) !== (b.display_order ?? 0)) {
         return (a.display_order ?? 0) - (b.display_order ?? 0)
       }
       // Secondary: Name
       return a.name.localeCompare(b.name)
    }

    // Sort roots
    roots.sort(sortParams)
    
    // Recursive sort children
    const sortChildren = (node: Category) => {
      if (node.children?.length) {
        node.children.sort(sortParams)
        node.children.forEach(sortChildren)
      }
    }
    roots.forEach(sortChildren)

    return roots
  }, [categories])

  // Filter the built tree
  const filteredTree = useMemo(() => {
    if (!searchTerm && typeFilter === "all" && statusFilter === "all") {
      return builtTree
    }

    const filterCategory = (category: Category): Category | null => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.icon?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === "all" || category.type === typeFilter
      
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.is_active) ||
        (statusFilter === "inactive" && !category.is_active)

      // Recursively filter children
      const filteredChildren = category.children
        ? category.children.map(filterCategory).filter((c): c is Category => c !== null)
        : []

      // Include category if it matches filters OR has matching children
      const shouldInclude =
        (matchesSearch && matchesType && matchesStatus) ||
        filteredChildren.length > 0

      if (!shouldInclude) return null

      return {
        ...category,
        children: filteredChildren,
      }
    }

    return builtTree.map(filterCategory).filter((c): c is Category => c !== null)
  }, [builtTree, searchTerm, typeFilter, statusFilter])

  // Auto-expand nodes that have matching children when filtering
  useMemo(() => {
    if (searchTerm || typeFilter !== "all" || statusFilter !== "all") {
      const nodesToExpand = new Set<string>()
      
      const collectExpandableNodes = (cats: Category[]) => {
        cats.forEach((cat) => {
          if (cat.children && cat.children.length > 0) {
            nodesToExpand.add(cat.id)
            collectExpandableNodes(cat.children)
          }
        })
      }
      
      collectExpandableNodes(filteredTree)
      setExpandedNodes(nodesToExpand)
    }
  }, [searchTerm, typeFilter, statusFilter, filteredTree])

  const handleToggleExpand = (categoryId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleExpandAll = () => {
    const allIds = new Set<string>()
    
    const collectAllIds = (cats: Category[]) => {
      cats.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id)
          collectAllIds(cat.children)
        }
      })
    }
    
    collectAllIds(filteredTree)
    setExpandedNodes(allIds)
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  if (filteredTree.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>{t("table.noResults")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={expandedNodes.size > 0 ? handleCollapseAll : handleExpandAll}
          className="text-xs"
        >
          {expandedNodes.size > 0 ? (
            <>
              <ChevronRight className="h-3 w-3 mr-1" />
              {t("tree.collapseAll", { defaultValue: "Collapse All" })}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              {t("tree.expandAll", { defaultValue: "Expand All" })}
            </>
          )}
        </Button>
      </div>

      {/* Tree Nodes */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="divide-y">
          {filteredTree.map((category) => (
            <CategoryTreeNode
              key={category.id}
              category={category}
              level={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expandedNodes={expandedNodes}
              onToggleExpand={handleToggleExpand}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
