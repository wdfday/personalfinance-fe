"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { createAccount } from "@/features/accounts/accountsSlice"
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
import { useTranslation } from "@/contexts/i18n-context"
import type { InstitutionName, DebitCreditInstitution, InvestmentInstitution, CryptoInstitution } from "@/services/api/accounts.service"

const createAccountSchema = z.object({
  account_name: z
    .string()
    .min(1, { message: "validation.accountNameRequired" })
    .max(255, { message: "validation.accountNameTooLong" }),
  account_type: z.enum(["cash", "bank", "savings", "credit_card", "investment", "crypto_wallet"], {
    required_error: "validation.accountTypeRequired",
  }),
  institution_name: z.string().optional(),
  current_balance: z.number().min(0, { message: "validation.balanceMin" }),
  available_balance: z.number().optional(),
  currency: z.string().length(3, { message: "validation.currencyLength" }).default("VND"),
  account_number_masked: z
    .string()
    .max(50, { message: "validation.accountNumberTooLong" })
    .optional(),
  is_active: z.boolean().default(true),
  is_primary: z.boolean().default(false),
  include_in_net_worth: z.boolean().default(true),
  // API credentials
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  consumer_id: z.string().optional(),
  consumer_key: z.string().optional(),
})

type CreateAccountForm = z.infer<typeof createAccountSchema>

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
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
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      account_name: "",
      account_type: "cash",
      institution_name: "",
      current_balance: 0,
      currency: "VND",
      is_active: true,
      is_primary: false,
      include_in_net_worth: true,
    },
  })

  const selectedType = watch("account_type")
  const institutionName = watch("institution_name")
  const isActive = watch("is_active")
  const isPrimary = watch("is_primary")
  const includeInNetWorth = watch("include_in_net_worth")

  // Determine which API fields to show
  const needsConsumerCredentials = selectedType === "investment" && (institutionName === "SSI" || institutionName === "CONSUMERID")
  const needsCryptoCredentials = selectedType === "crypto_wallet"

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

  const onSubmit = async (data: CreateAccountForm) => {
    try {
      setIsSubmitting(true)
      await dispatch(createAccount(data)).unwrap()
      toast.success(t("modals.create.success"))
      reset()
      onClose()
    } catch (error) {
      toast.error(
        t("modals.create.error", {
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

  // Render investment-specific form
  if (selectedType === "investment") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("modals.create.investment.title", { defaultValue: "Tạo tài khoản Đầu tư" })}</DialogTitle>
            <DialogDescription>
              {t("modals.create.investment.description", { defaultValue: "Kết nối tài khoản đầu tư với API credentials" })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">{t("form.labels.accountType")} *</Label>
              <Select
                value="investment"
                onValueChange={(value) => setValue("account_type", value as CreateAccountForm['account_type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">{t("accountTypes.investment")}</SelectItem>
                  <SelectItem value="cash">{t("accountTypes.cash")}</SelectItem>
                  <SelectItem value="bank">{t("accountTypes.bank")}</SelectItem>
                  <SelectItem value="savings">{t("accountTypes.savings")}</SelectItem>
                  <SelectItem value="credit_card">{t("accountTypes.credit_card")}</SelectItem>
                  <SelectItem value="crypto_wallet">{t("accountTypes.crypto_wallet")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <input type="hidden" {...register("currency")} value="VND" />
            <input type="hidden" {...register("is_active")} value={true} />
            <input type="hidden" {...register("include_in_net_worth")} value={true} />

            <div className="space-y-2">
              <Label htmlFor="account_name">{t("form.labels.accountName")} *</Label>
              <Input
                id="account_name"
                {...register("account_name")}
                placeholder={t("form.placeholders.accountName")}
              />
              {errors.account_name && (
                <p className="text-sm text-red-500">{t(errors.account_name.message || "validation.accountNameRequired")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution_name">{t("form.labels.institutionName")} *</Label>
              <Select
                value={institutionName || ""}
                onValueChange={(value) => {
                  setValue("institution_name", value as InstitutionName)
                  // Reset credentials when institution changes
                  if (value !== "SSI" && value !== "CONSUMERID") {
                    setValue("consumer_id", "")
                    setValue("consumer_key", "")
                  }
                }}
              >
                <SelectTrigger id="institution_name">
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

            {/* API Credentials for Investment (SSI, ConsumerID) */}
            {(institutionName === "SSI" || institutionName === "CONSUMERID") && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">{t("apiCredentials.investment.title")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("apiCredentials.investment.description", {
                      values: { institution: institutionName === "SSI" ? t("institutions.SSI") : t("institutions.CONSUMERID") },
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer_id">{t("apiCredentials.investment.consumerId")} *</Label>
                  <Input
                    id="consumer_id"
                    type="text"
                    {...register("consumer_id", { required: true })}
                    placeholder={t("apiCredentials.investment.consumerIdPlaceholder")}
                  />
                  {errors.consumer_id && (
                    <p className="text-sm text-red-500">{t("validation.consumerIdRequired", { defaultValue: "Consumer ID là bắt buộc" })}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer_key">{t("apiCredentials.investment.consumerKey")} *</Label>
                  <Input
                    id="consumer_key"
                    type="password"
                    {...register("consumer_key", { required: true })}
                    placeholder={t("apiCredentials.investment.consumerKeyPlaceholder")}
                  />
                  {errors.consumer_key && (
                    <p className="text-sm text-red-500">{t("validation.consumerKeyRequired", { defaultValue: "Consumer Key là bắt buộc" })}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_balance">{t("form.labels.currentBalance")} *</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  {...register("current_balance", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.current_balance && (
                  <p className="text-sm text-red-500">{t(errors.current_balance.message || "validation.balanceMin")}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_primary">{t("form.labels.isPrimary")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isPrimary")}</p>
              </div>
              <Switch
                id="is_primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setValue("is_primary", checked)}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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

  // Render crypto-specific form
  if (selectedType === "crypto_wallet") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("modals.create.crypto.title", { defaultValue: "Tạo tài khoản Crypto" })}</DialogTitle>
            <DialogDescription>
              {t("modals.create.crypto.description", { defaultValue: "Kết nối ví crypto với API credentials" })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">{t("form.labels.accountType")} *</Label>
              <Select
                value="crypto_wallet"
                onValueChange={(value) => setValue("account_type", value as CreateAccountForm['account_type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto_wallet">{t("accountTypes.crypto_wallet")}</SelectItem>
                  <SelectItem value="cash">{t("accountTypes.cash")}</SelectItem>
                  <SelectItem value="bank">{t("accountTypes.bank")}</SelectItem>
                  <SelectItem value="savings">{t("accountTypes.savings")}</SelectItem>
                  <SelectItem value="credit_card">{t("accountTypes.credit_card")}</SelectItem>
                  <SelectItem value="investment">{t("accountTypes.investment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <input type="hidden" {...register("currency")} value="USD" />
            <input type="hidden" {...register("is_active")} value={true} />
            <input type="hidden" {...register("include_in_net_worth")} value={true} />

            <div className="space-y-2">
              <Label htmlFor="account_name">{t("form.labels.accountName")} *</Label>
              <Input
                id="account_name"
                {...register("account_name")}
                placeholder={t("form.placeholders.accountName")}
              />
              {errors.account_name && (
                <p className="text-sm text-red-500">{t(errors.account_name.message || "validation.accountNameRequired")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution_name">{t("form.labels.institutionName")} *</Label>
              <Select
                value={institutionName || ""}
                onValueChange={(value) => {
                  setValue("institution_name", value as InstitutionName)
                  // Reset API keys when institution changes
                  setValue("api_key", "")
                  setValue("api_secret", "")
                }}
              >
                <SelectTrigger id="institution_name">
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

            {/* API Credentials for Crypto */}
            {institutionName && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">{t("apiCredentials.crypto.title")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("apiCredentials.crypto.description", {
                      values: { institution: institutionName ? t(`institutions.${institutionName}`) : t("institutions.OTHER") },
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">{t("apiCredentials.crypto.apiKey")} *</Label>
                  <Input
                    id="api_key"
                    type="text"
                    {...register("api_key", { required: true })}
                    placeholder={t("apiCredentials.crypto.apiKeyPlaceholder")}
                  />
                  {errors.api_key && (
                    <p className="text-sm text-red-500">{t("validation.apiKeyRequired", { defaultValue: "API Key là bắt buộc" })}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_secret">{t("apiCredentials.crypto.apiSecret")} *</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    {...register("api_secret", { required: true })}
                    placeholder={t("apiCredentials.crypto.apiSecretPlaceholder")}
                  />
                  {errors.api_secret && (
                    <p className="text-sm text-red-500">{t("validation.apiSecretRequired", { defaultValue: "API Secret là bắt buộc" })}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                  <p className="font-semibold mb-1">Lưu ý bảo mật:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>API keys sẽ được mã hóa và lưu trữ an toàn</li>
                    <li>Chỉ cấp quyền đọc (read-only) khi có thể</li>
                    <li>Không chia sẻ API keys với người khác</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_balance">{t("form.labels.currentBalance")} *</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  {...register("current_balance", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.current_balance && (
                  <p className="text-sm text-red-500">{t(errors.current_balance.message || "validation.balanceMin")}</p>
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
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_primary">{t("form.labels.isPrimary")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isPrimary")}</p>
              </div>
              <Switch
                id="is_primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setValue("is_primary", checked)}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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

  // Default form for other account types
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("modals.create.title")}</DialogTitle>
          <DialogDescription>{t("modals.create.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">{t("form.labels.accountName")} *</Label>
            <Input
              id="account_name"
              {...register("account_name")}
              placeholder={t("form.placeholders.accountName")}
            />
            {errors.account_name && (
              <p className="text-sm text-red-500">{t(errors.account_name.message || "validation.accountNameRequired")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">{t("form.labels.accountType")} *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("account_type", value as CreateAccountForm['account_type'])}
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
            {errors.account_type && (
              <p className="text-sm text-red-500">{t(errors.account_type.message || "validation.accountTypeRequired")}</p>
            )}
          </div>

          {getInstitutionOptions().length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="institution_name">{t("form.labels.institutionName")}</Label>
              <Select
                value={institutionName || ""}
                onValueChange={(value) => setValue("institution_name", value as InstitutionName)}
              >
                <SelectTrigger id="institution_name">
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

          {/* API Credentials for Investment (SSI, ConsumerID) */}
          {needsConsumerCredentials && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t("apiCredentials.investment.title")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("apiCredentials.investment.description", {
                    values: { institution: institutionName === "SSI" ? t("institutions.SSI") : t("institutions.CONSUMERID") },
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumer_id">{t("apiCredentials.investment.consumerId")} *</Label>
                <Input
                  id="consumer_id"
                  type="text"
                  {...register("consumer_id")}
                  placeholder={t("apiCredentials.investment.consumerIdPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumer_key">{t("apiCredentials.investment.consumerKey")} *</Label>
                <Input
                  id="consumer_key"
                  type="password"
                  {...register("consumer_key")}
                  placeholder={t("apiCredentials.investment.consumerKeyPlaceholder")}
                />
              </div>
            </div>
          )}

          {/* API Credentials for Crypto */}
          {needsCryptoCredentials && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t("apiCredentials.crypto.title")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("apiCredentials.crypto.description", {
                    values: { institution: institutionName ? t(`institutions.${institutionName}`) : t("institutions.OTHER") },
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">{t("apiCredentials.crypto.apiKey")} *</Label>
                <Input
                  id="api_key"
                  type="text"
                  {...register("api_key")}
                  placeholder={t("apiCredentials.crypto.apiKeyPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_secret">{t("apiCredentials.crypto.apiSecret")} *</Label>
                <Input
                  id="api_secret"
                  type="password"
                  {...register("api_secret")}
                  placeholder={t("apiCredentials.crypto.apiSecretPlaceholder")}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_balance">{t("form.labels.currentBalance")} *</Label>
              <Input
                id="current_balance"
                type="number"
                step="0.01"
                {...register("current_balance", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.current_balance && (
                <p className="text-sm text-red-500">{t(errors.current_balance.message || "validation.balanceMin")}</p>
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
            <Label htmlFor="account_number_masked">{t("form.labels.accountNumberMasked")}</Label>
            <Input
              id="account_number_masked"
              {...register("account_number_masked")}
              placeholder={t("form.placeholders.accountNumberMasked")}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">{t("form.labels.isActive")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isActive")}</p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_primary">{t("form.labels.isPrimary")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.isPrimary")}</p>
              </div>
              <Switch
                id="is_primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setValue("is_primary", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include_in_net_worth">{t("form.labels.includeInNetWorth")}</Label>
                <p className="text-sm text-muted-foreground">{t("form.helpers.includeInNetWorth")}</p>
              </div>
              <Switch
                id="include_in_net_worth"
                checked={includeInNetWorth}
                onCheckedChange={(checked) => setValue("include_in_net_worth", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
