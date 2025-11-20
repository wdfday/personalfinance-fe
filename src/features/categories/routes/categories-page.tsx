"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Tag, Search, Filter, Layers } from "lucide-react"
import { CreateCategoryModal } from "@/features/categories/create-category-modal"
import { EditCategoryModal } from "@/features/categories/edit-category-modal"
import { DeleteCategoryModal } from "@/features/categories/delete-category-modal"
import type { Category } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const { categories, isLoading, error } = useAppSelector((state) => state.categories)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const { t, locale } = useTranslation("categories")
  const { t: tCommonActions } = useTranslation("common.actions")
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US"

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "transfer">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.icon?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === "all" || category.type === typeFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.is_active) ||
        (statusFilter === "inactive" && !category.is_active)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [categories, searchTerm, typeFilter, statusFilter])

  const stats = useMemo(() => {
    const totalParents = categories.filter((c) => !c.parent_id).length
    return {
      total: categories.length,
      income: categories.filter((c) => c.type === "income").length,
      expense: categories.filter((c) => c.type === "expense").length,
      transfer: categories.filter((c) => c.type === "transfer").length,
      active: categories.filter((c) => c.is_active).length,
      inactive: categories.filter((c) => !c.is_active).length,
      parents: totalParents,
    }
  }, [categories])

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expense: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("page.title")}</h1>
          <p className="text-muted-foreground">{t("page.subtitle")}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("page.addAction")}
        </Button>
      </div>

      {/* Summary Cards */}
      {categories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.total.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">{t("summary.income.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.income}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">{t("summary.expense.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expense}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">{t("summary.transfer.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.transfer}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.active.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {t("summary.active.subtitle", { values: { inactive: stats.inactive } })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.parents.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.parents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {t("filters.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("filters.search.label")}</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("filters.search.placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("filters.type.label")}</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.type.all")}</SelectItem>
                    <SelectItem value="income">{t("filters.type.income")}</SelectItem>
                    <SelectItem value="expense">{t("filters.type.expense")}</SelectItem>
                    <SelectItem value="transfer">{t("filters.type.transfer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("filters.status.label")}</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.status.all")}</SelectItem>
                    <SelectItem value="active">{t("filters.status.active")}</SelectItem>
                    <SelectItem value="inactive">{t("filters.status.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      {categories.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("table.title")}</CardTitle>
            <CardDescription>
              {t("table.description", {
                values: { filtered: filteredCategories.length, total: categories.length },
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.headers.name")}</TableHead>
                  <TableHead>{t("table.headers.type")}</TableHead>
                  <TableHead>{t("table.headers.parent")}</TableHead>
                  <TableHead>{t("table.headers.iconColor")}</TableHead>
                  <TableHead>{t("table.headers.status")}</TableHead>
                  <TableHead>{t("table.headers.createdAt")}</TableHead>
                  <TableHead>{t("table.headers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const parent = categories.find((c) => c.id === category.parent_id)
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{category.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(category.type)}>
                          {getTypeLabel(category.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {parent ? (
                          <span className="text-sm text-muted-foreground">{parent.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{t("table.noParent")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {category.icon && <span className="text-xl">{category.icon}</span>}
                          {category.color && (
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {!category.icon && !category.color && (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? t("table.active") : t("table.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(category.created_at).toLocaleDateString(numberLocale)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredCategories.length === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                {t("table.noResults")}
              </div>
            )}
          </CardContent>
        </Card>
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

