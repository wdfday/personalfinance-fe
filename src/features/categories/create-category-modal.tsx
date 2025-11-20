"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCategory, fetchCategories } from "@/features/categories/categoriesSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useTranslation } from "@/contexts/i18n-context"

type CreateCategoryForm = {
  name: string
  type: "income" | "expense" | "transfer"
  parent_id?: string | "none"
  icon: string
  color: string
}

const createCategorySchema = (t: (key: string, options?: any) => string) => z.object({
  name: z.string().min(2, t("validation.nameMin")).max(100, t("validation.nameMax")),
  type: z.enum(["income", "expense", "transfer"], {
    required_error: t("validation.typeRequired"),
  }),
  parent_id: z.string().uuid().optional().or(z.literal("none")),
  icon: z.string().min(1, t("validation.iconRequired")),
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, t("validation.colorInvalid")),
})

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector((state) => state.categories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation("categories")
  const { t: tCommonActions } = useTranslation("common.actions")

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      dispatch(fetchCategories())
    }
  }, [isOpen, categories.length, dispatch])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategorySchema(t)),
    defaultValues: {
      name: "",
      type: "expense",
      parent_id: "none",
      icon: "🧾",
      color: "#2563eb",
    },
  })

  const selectedType = watch("type")

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parent_id && category.type === selectedType && category.is_active),
    [categories, selectedType]
  )

  const onSubmit = async (data: CreateCategoryForm) => {
    try {
      setIsSubmitting(true)
      const payload = {
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        parent_id: data.parent_id && data.parent_id !== "none" ? data.parent_id : undefined,
      }
      await dispatch(createCategory(payload)).unwrap()
      toast.success(t("modals.create.success"))
      reset()
      onClose()
    } catch (error) {
      toast.error(t("modals.create.error", { values: { error: String(error) } }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("modals.create.title")}</DialogTitle>
          <DialogDescription>{t("modals.create.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.labels.name")} *</Label>
            <Input
              id="name"
              placeholder={t("form.placeholders.name")}
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("form.labels.type")} *</Label>
            <Select value={selectedType} onValueChange={(value) => setValue("type", value as CreateCategoryForm["type"])}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.labels.type")} />
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
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parent_id && (
              <p className="text-sm text-red-500">{errors.parent_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">{t("form.labels.icon")} *</Label>
              <Input
                id="icon"
                placeholder={t("form.placeholders.icon")}
                {...register("icon")}
              />
              {errors.icon && (
                <p className="text-sm text-red-500">{errors.icon.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t("form.labels.color")} *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  className="h-10 w-12 p-1"
                  {...register("color")}
                />
                <Input
                  value={watch("color")}
                  onChange={(e) => setValue("color", e.target.value)}
                />
              </div>
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {tCommonActions("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("modals.create.submitting") : t("modals.create.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


