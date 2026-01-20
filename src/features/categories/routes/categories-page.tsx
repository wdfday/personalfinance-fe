"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCategories, fetchCategoriesTree } from "@/features/categories/categoriesSlice"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Layers } from "lucide-react"
import { CreateCategoryModal } from "@/features/categories/create-category-modal"
import { EditCategoryModal } from "@/features/categories/edit-category-modal"
import { DeleteCategoryModal } from "@/features/categories/delete-category-modal"
import { CategoryTree } from "@/features/categories/category-tree"
import { CategoryDetailView } from "@/features/categories/category-detail-view"
import type { Category } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const { categories, categoriesTree, isLoading, error } = useAppSelector((state) => state.categories)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const { t, locale } = useTranslation("categories")
  const { t: tCommonActions } = useTranslation("common.actions")
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US"

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchCategoriesTree())
  }, [dispatch])

  const getTypeBadge = (type: string) => {
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

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleAddChild = (parentId: string) => {
    // setCreateModalParentId(parentId) 
    setIsCreateModalOpen(true)
  }

  const handleSelectCategory = (category: Category) => {
    setSelectedCategoryId(category.id)
  }

  // Find selected category object for Detail View
  const selectedCategoryForDetail = categories.find(c => c.id === selectedCategoryId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">{t("status.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t("status.error", { values: { message: error } })}</p>
          <Button onClick={() => dispatch(fetchCategories())}>{tCommonActions("retry")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("page.title")}</h1>
          <p className="text-muted-foreground">{t("page.subtitle")}</p>
        </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => {
          // setCreateModalParentId(undefined)
          setIsCreateModalOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t("page.addAction")}
        </Button>
      </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Pane: Category Tree */}
        <div className={`flex-1 min-w-[300px] overflow-y-auto ${selectedCategoryId ? 'max-w-md border-r pr-6' : ''}`}>
           {categories && categories.length > 0 ? (
              <CategoryTree
                categories={categories || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                selectedCategoryId={selectedCategoryId || undefined}
                onSelect={handleSelectCategory}
              />
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{t("emptyState.title")}</h3>
                  <p className="text-muted-foreground mb-4">{t("emptyState.description")}</p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("emptyState.action")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Pane: Detail View */}
        {selectedCategoryId && selectedCategoryForDetail && (
          <div className="flex-[2] overflow-y-auto pl-2">
            <CategoryDetailView category={selectedCategoryForDetail} />
          </div>
        )}
        
        {/* Placeholder if nothing selected but we have categories */}
        {!selectedCategoryId && categories.length > 0 && (
           <div className="flex-[2] flex items-center justify-center text-muted-foreground border-l pl-6 border-dashed">
             <div className="text-center">
               <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
               <p>Select a category to view details</p>
             </div>
           </div>
        )}
      </div>

      {/* Modals */}
      <CreateCategoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
      />
    </div>
  )
}

