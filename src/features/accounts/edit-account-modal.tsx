"use client"

import { useState, useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { updateAccount } from "@/features/accounts/accountsSlice"
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
import type { Account } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"
import type { InstitutionName } from "@/services/api/accounts.service"

const updateAccountSchema = z.object({
  accountName: z
    .string()
    .min(1, { message: "validation.accountNameRequired" })
    .max(255, { message: "validation.accountNameTooLong" }),
  accountType: z.enum(["cash", "bank", "savings", "credit_card", "investment", "crypto_wallet"], {
    required_error: "validation.accountTypeRequired",
  }),
  institutionName: z.string().optional(),
  currentBalance: z.number().min(0, { message: "validation.balanceMin" }),
  currency: z.string().length(3, { message: "validation.currencyLength" }).default("VND"),
  accountNumberMasked: z
    .string()
    .max(50, { message: "validation.accountNumberTooLong" })
    .optional(),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
  includeInNetWorth: z.boolean().default(true),
})

type UpdateAccountForm = z.infer<typeof updateAccountSchema>

interface EditAccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: Account | null
}

export function EditAccountModal({ isOpen, onClose, account }: EditAccountModalProps) {
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation("accounts")
  const { t: tCommonActions } = useTranslation("common.actions")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateAccountForm>({
    resolver: zodResolver(updateAccountSchema),
  })

  useEffect(() => {
    if (account) {
      setValue("accountName", account.accountName)
      setValue("accountType", account.accountType)
      setValue("institutionName", account.institutionName || "")
      setValue("currentBalance", account.currentBalance)
      setValue("currency", account.currency)
      setValue("accountNumberMasked", account.accountNumberMasked || "")
      setValue("isActive", account.isActive)
      setValue("isPrimary", account.isPrimary)
      setValue("includeInNetWorth", account.includeInNetWorth)
    }
  }, [account, setValue])

  const selectedType = watch("accountType")
  const institutionName = watch("institutionName")
  const isActive = watch("isActive")
  const isPrimary = watch("isPrimary")
  const includeInNetWorth = watch("includeInNetWorth")

  // Institution options by account type
  const getInstitutionOptions = () => {
    if (selectedType === "investment") {
      return [
        { value: "SSI", label: t("institutions.SSI") },
        { value: "CONSUMERID", label: t("institutions.CONSUMERID") },
        { value: "VNDIRECT", label: t("institutions.VNDIRECT") },
        { value: "VCBS", label: t("institutions.VCBS") },
        { value: "HSC", label: t("institutions.HSC") },
        { value: "FPTS", label: t("institutions.FPTS") },
        { value: "SSI_IB", label: t("institutions.SSI_IB") },
        { value: "OTHER", label: t("institutions.OTHER") },
      ]
    }
    if (selectedType === "crypto_wallet") {
      return [
        { value: "OKX", label: t("institutions.OKX") },
        { value: "BINANCE", label: t("institutions.BINANCE") },
        { value: "COINBASE", label: t("institutions.COINBASE") },
        { value: "BYBIT", label: t("institutions.BYBIT") },
        { value: "GATEIO", label: t("institutions.GATEIO") },
        { value: "KUCOIN", label: t("institutions.KUCOIN") },
        { value: "HUOBI", label: t("institutions.HUOBI") },
        { value: "OTHER", label: t("institutions.OTHER") },
      ]
    }
    if (selectedType === "bank" || selectedType === "savings" || selectedType === "credit_card") {
      return [
        { value: "VCB", label: t("institutions.VCB") },
        { value: "TCB", label: t("institutions.TCB") },
        { value: "ACB", label: t("institutions.ACB") },
        { value: "VPB", label: t("institutions.VPB") },
        { value: "TPB", label: t("institutions.TPB") },
        { value: "MBB", label: t("institutions.MBB") },
        { value: "BID", label: t("institutions.BID") },
        { value: "CTG", label: t("institutions.CTG") },
        { value: "HDB", label: t("institutions.HDB") },
        { value: "VIB", label: t("institutions.VIB") },
        { value: "MSB", label: t("institutions.MSB") },
        { value: "EIB", label: t("institutions.EIB") },
        { value: "OCB", label: t("institutions.OCB") },
        { value: "SHB", label: t("institutions.SHB") },
        { value: "MOOMO", label: t("institutions.MOOMO") },
        { value: "VNPAY", label: t("institutions.VNPAY") },
        { value: "ZALOPAY", label: t("institutions.ZALOPAY") },
        { value: "VIETTELPAY", label: t("institutions.VIETTELPAY") },
        { value: "OTHER", label: t("institutions.OTHER") },
      ]
    }
    return []
  }

  const onSubmit = async (data: UpdateAccountForm) => {
    if (!account) return

    try {
      setIsSubmitting(true)
      await dispatch(updateAccount({ id: account.id, data })).unwrap()
      toast.success(t("modals.edit.success"))
      reset()
      onClose()
    } catch (error) {
      toast.error(
        t("modals.edit.error", {
          values: { error: error instanceof Error ? error.message : String(error) },
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("modals.edit.title")}</DialogTitle>
          <DialogDescription>{t("modals.edit.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">{t("form.labels.accountName")} *</Label>
            <Input
              id="accountName"
              {...register("accountName")}
              placeholder={t("form.placeholders.accountName")}
            />
            {errors.accountName && (
              <p className="text-sm text-red-500">{t(errors.accountName.message || "validation.accountNameRequired")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">{t("form.labels.accountType")} *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("accountType", value as UpdateAccountForm['accountType'])}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.labels.accountType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("accountTypes.cash")}</SelectItem>
                <SelectItem value="bank">{t("accountTypes.bank")}</SelectItem>
                <SelectItem value="savings">{t("accountTypes.savings")}</SelectItem>
                <SelectItem value="credit_card">{t("accountTypes.credit_card")}</SelectItem>
                <SelectItem value="investment">{t("accountTypes.investment")}</SelectItem>
                <SelectItem value="crypto_wallet">{t("accountTypes.crypto_wallet")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-500">{t(errors.accountType.message || "validation.accountTypeRequired")}</p>
            )}
          </div>

          {getInstitutionOptions().length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="institutionName">{t("form.labels.institutionName")}</Label>
              <Select
                value={institutionName || ""}
                onValueChange={(value) => setValue("institutionName", value as InstitutionName)}
              >
                <SelectTrigger id="institutionName">
                  <SelectValue placeholder={t("form.placeholders.institutionName")} />
                </SelectTrigger>
                <SelectContent>
                  {getInstitutionOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentBalance">{t("form.labels.currentBalance")} *</Label>
              <Input
                id="currentBalance"
                type="number"
                step="0.01"
                {...register("currentBalance", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.currentBalance && (
                <p className="text-sm text-red-500">{t(errors.currentBalance.message || "validation.balanceMin")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("form.labels.currency")}</Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumberMasked">{t("form.labels.accountNumberMasked")}</Label>
            <Input
              id="accountNumberMasked"
              {...register("accountNumberMasked")}
              placeholder={t("form.placeholders.accountNumberMasked")}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">{t("form.labels.isActive")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isActive")}</p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPrimary">{t("form.labels.isPrimary")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isPrimary")}</p>
              </div>
              <Switch
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setValue("isPrimary", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeInNetWorth">{t("form.labels.includeInNetWorth")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.includeInNetWorth")}</p>
              </div>
              <Switch
                id="includeInNetWorth"
                checked={includeInNetWorth}
                onCheckedChange={(checked) => setValue("includeInNetWorth", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
