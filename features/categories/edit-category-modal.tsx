"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { updateCategory } from "@/features/categories/categoriesSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { Category } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

type UpdateCategoryForm = {
  name: string
  type: "income" | "expense" | "transfer"
  parent_id?: string | "none"
  icon: string
  color: string
  is_active: boolean
}

const updateCategorySchema = (t: (key: string, options?: any) => string) => z.object({
  name: z.string().min(2, t("validation.nameMin")).max(100, t("validation.nameMax")),
  type: z.enum(["income", "expense", "transfer"]),
  parent_id: z.string().uuid().optional().or(z.literal("none")),
  icon: z.string().min(1, t("validation.iconRequired")),
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, t("validation.colorInvalid")),
  is_active: z.boolean().default(true),
})

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector((state) => state.categories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation("categories")
  const { t: tCommonActions } = useTranslation("common.actions")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateCategoryForm>({
    resolver: zodResolver(updateCategorySchema(t)),
  })

  useEffect(() => {
    if (category) {
      setValue("name", category.name)
      setValue("type", category.type)
      setValue("parent_id", category.parent_id || "none")
      setValue("icon", category.icon)
      setValue("color", category.color)
      setValue("is_active", category.is_active)
    }
  }, [category, setValue])

  const selectedType = watch("type")
  const isActive = watch("is_active")

  const parentCategories = useMemo(() => {
    return categories.filter(
      (c) => !c.parent_id && c.type === selectedType && c.id !== category?.id && c.is_active
    )
  }, [categories, selectedType, category])

  const onSubmit = async (data: UpdateCategoryForm) => {
    if (!category) return
    try {
      setIsSubmitting(true)
      const payload = {
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        is_active: data.is_active,
        parent_id: data.parent_id && data.parent_id !== "none" ? data.parent_id : undefined,
      }
      await dispatch(updateCategory({ id: category.id, data: payload })).unwrap()
      toast.success(t("modals.edit.success"))
      reset()
      onClose()
    } catch (error) {
      toast.error(t("modals.edit.error", { values: { error: String(error) } }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!category) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("modals.edit.title")}</DialogTitle>
          <DialogDescription>{t("modals.edit.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.labels.name")} *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("form.labels.type")} *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as UpdateCategoryForm["type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t("types.income")}</SelectItem>
                <SelectItem value="expense">{t("types.expense")}</SelectItem>
                <SelectItem value="transfer">{t("types.transfer")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">{t("form.labels.parent")}</Label>
            <Select
              value={watch("parent_id") || "none"}
              onValueChange={(value) => setValue("parent_id", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.placeholders.parent")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("form.placeholders.parent")}</SelectItem>
                {parentCategories.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">{t("form.labels.icon")}</Label>
              <Input id="icon" {...register("icon")} />
              {errors.icon && <p className="text-sm text-red-500">{errors.icon.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">{t("form.labels.color")}</Label>
              <div className="flex items-center space-x-2">
                <Input id="color" type="color" className="h-10 w-12 p-1" {...register("color")} />
                <Input value={watch("color")} onChange={(e) => setValue("color", e.target.value)} />
              </div>
              {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t("form.labels.isActive")}</p>
              <p className="text-xs text-muted-foreground">{t("form.helpers.isActive")}</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {tCommonActions("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("modals.edit.submitting") : t("modals.edit.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


