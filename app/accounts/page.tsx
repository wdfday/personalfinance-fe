"use client"

import { useEffect, useState, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { CreateAccountModal } from "@/features/accounts/create-account-modal"
import { EditAccountModal } from "@/features/accounts/edit-account-modal"
import { DeleteAccountModal } from "@/features/accounts/delete-account-modal"
import type { Account } from "@/services/api"
import { useTranslation } from "@/contexts/i18n-context"

export default function AccountsPage() {
  const dispatch = useAppDispatch()
  const { accounts, isLoading, error } = useAppSelector((state) => state.accounts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const { t, locale } = useTranslation("accounts")
  const { t: tCommonActions } = useTranslation("common.actions")
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US"

  useEffect(() => {
    dispatch(fetchAccounts())
  }, [dispatch])

  const getAccountTypeLabel = useCallback(
    (type: string) => t(`accountTypes.${type}`, { defaultValue: type }),
    [t],
  )

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      savings: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      credit_card: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      investment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      crypto_wallet: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const formatCurrency = useCallback(
    (amount: number, currency: string = "VND") =>
      new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency,
      }).format(amount),
    [numberLocale],
  )

  const calculateTotalBalance = () => {
    return accounts
      .filter(acc => acc.include_in_net_worth)
      .reduce((sum, acc) => {
        // Convert all to VND for simplicity (in real app, use exchange rates)
        return sum + acc.current_balance
      }, 0)
  }

  const handleEdit = (account: Account) => {
    setSelectedAccount(account)
    setIsEditModalOpen(true)
  }

  const handleDelete = (account: Account) => {
    setSelectedAccount(account)
    setIsDeleteModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
          <Button onClick={() => dispatch(fetchAccounts())}>{tCommonActions("retry")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
      {accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.totalAssets.title")}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(calculateTotalBalance())}</div>
              <p className="text-xs text-muted-foreground">
                {t("summary.totalAssets.subtitle", {
                  values: { count: accounts.filter((a) => a.include_in_net_worth).length },
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.accountCount.title")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("summary.accountCount.subtitle", {
                  values: { primaryCount: accounts.filter((a) => a.is_primary).length },
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.accountTypes.title")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(accounts.map(a => a.account_type)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("summary.accountTypes.subtitle")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">{account.account_name}</CardTitle>
                {account.institution_name && (
                  <CardDescription className="text-xs mt-1">
                    {account.institution_name}
                  </CardDescription>
                )}
              </div>
              {account.is_primary && (
                <Badge variant="default" className="ml-2">{t("list.primary")}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(account.current_balance, account.currency)}
                  </div>
                  {account.available_balance !== undefined && 
                   account.available_balance !== account.current_balance && (
                    <div className="text-xs text-muted-foreground">
                      {t("list.available")}: {formatCurrency(account.available_balance, account.currency)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getAccountTypeColor(account.account_type)} variant="secondary">
                    {getAccountTypeLabel(account.account_type)}
                  </Badge>
                  {!account.include_in_net_worth && (
                    <Badge variant="outline" className="text-xs">
                      {t("list.excluded")}
                    </Badge>
                  )}
                </div>

                {account.account_number_masked && (
                  <div className="text-xs text-muted-foreground">
                    {account.account_number_masked}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {t("list.updatedAt")}: {new Date(account.updated_at).toLocaleDateString(numberLocale)}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(account)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("list.edit")}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
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
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
      />
    </div>
  )
}
