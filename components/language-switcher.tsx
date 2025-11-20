"use client"

import { useTranslation } from "@/contexts/i18n-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/i18n/translations"

interface LanguageSwitcherProps {
  triggerClassName?: string
  variant?: "compact" | "full"
  id?: string
}

const triggerSizes: Record<"full" | "compact", string> = {
  full: "w-full",
  compact: "w-[110px]",
}

export function LanguageSwitcher({ triggerClassName, variant = "compact", id }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation("common.language")

  const handleChange = (value: string) => {
    setLocale(value as Locale)
  }

  const triggerClasses = cn(triggerSizes[variant], triggerClassName)

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger id={id} className={triggerClasses}>
        <SelectValue placeholder={t("label")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("english")}</SelectItem>
        <SelectItem value="vi">{t("vietnamese")}</SelectItem>
      </SelectContent>
    </Select>
  )
}

