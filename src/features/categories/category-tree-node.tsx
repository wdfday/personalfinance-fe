"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { Category } from "@/types/api"
import { useTranslation } from "@/contexts/i18n-context"
import { cn } from "@/lib/utils"

interface CategoryTreeNodeProps {
  category: Category
  level: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (parentId: string) => void
  expandedNodes: Set<string>
  onToggleExpand: (categoryId: string) => void
  selectedCategoryId?: string
  onSelect: (category: Category) => void
}

export function CategoryTreeNode({
  category,
  level,
  onEdit,
  onDelete,
  onAddChild,
  expandedNodes,
  onToggleExpand,
  selectedCategoryId,
  onSelect,
}: CategoryTreeNodeProps) {
  const { t } = useTranslation("categories")
  const [isHovered, setIsHovered] = useState(false)
  
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedNodes.has(category.id)
  const isSelected = selectedCategoryId === category.id
  const indentSize = level * 24 // 24px per level

  const getTypeBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expense: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      both: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    }
    return map[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getTypeLabel = (type: string) => {
    return t(`types.${type}`, { defaultValue: type })
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          {/* Node Row */}
          <div
            className={cn(
              "group relative flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer",
              "hover:bg-muted/50",
              isHovered && "bg-muted/30",
              isSelected && "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
            style={{ paddingLeft: `${indentSize + 12}px` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(category)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(category)
              }
            }}
            role="button"
            tabIndex={0}
          >
        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0 w-5 h-5">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(category.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          ) : (
            <div className="w-5" /> // Spacer for alignment
          )}
        </div>

        {/* Icon & Color */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {category.color && (
            <div
              className="h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm truncate",
              level === 0 && "font-semibold text-base",
              !category.is_active && "text-muted-foreground line-through"
            )}
          >
            {category.name}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasChildren && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {category.children!.length}
            </Badge>
          )}
          <Badge className={cn("text-xs px-2 py-0.5", getTypeBadgeClass(category.type))}>
            {getTypeLabel(category.type)}
          </Badge>
          {/* <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs px-2 py-0.5">
            {category.is_active ? t("table.active") : t("table.inactive")}
          </Badge> */}
          {category.is_system && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              System
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            "flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity",
            isHovered && "opacity-100"
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(category)
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(category)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem 
            onClick={() => onAddChild(category.id)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("tree.addChild", { defaultValue: "Add Child Category" })}
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => onEdit(category)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("actions.edit", { defaultValue: "Edit" })}
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => onDelete(category)}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("actions.delete", { defaultValue: "Delete" })}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children (Recursive) */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Connecting Lines */}
          <div
            className="absolute top-0 bottom-0 border-l-2 border-muted"
            style={{ left: `${indentSize + 22}px` }}
          />
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
