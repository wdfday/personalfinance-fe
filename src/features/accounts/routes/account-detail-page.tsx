"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, Info, Wallet, Shield, TrendingUp, AlertCircle, Coins } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchAccount, setSelectedAccount } from "@/features/accounts/accountsSlice"
import { transactionsService, investmentsService, type Transaction, type Investment } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/contexts/i18n-context"

type AsyncState<T> = {
  data: T
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
  }
}

const initialTransactionsState: AsyncState<Transaction[]> = {
  data: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 0,
    totalCount: 0,
  },
}

const initialAssetsState: AsyncState<Investment[]> = {
  data: [],
  isLoading: false,
  error: null,
}

export default function AccountDetailPage() {
  const router = useRouter()
  const params = useParams<{ accountId?: string }>()
  const accountIdParam = params?.accountId
  const accountId = Array.isArray(accountIdParam) ? accountIdParam[0] : accountIdParam
  const dispatch = useAppDispatch()
  const { t, locale } = useTranslation("accounts")
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US"

  const { accounts, selectedAccount, isLoading: isAccountLoading, error: accountError } = useAppSelector(
    (state) => state.accounts,
  )

  const account = useMemo(() => {
    if (!accountId) return null
    return accounts.find((acc) => acc.id === accountId) ?? (selectedAccount?.id === accountId ? selectedAccount : null)
  }, [accountId, accounts, selectedAccount])

  const [transactionsState, setTransactionsState] = useState(initialTransactionsState)
  const [assetsState, setAssetsState] = useState(initialAssetsState)

  const isAssetAccount =
    account?.accountType === "investment" || account?.accountType === "crypto_wallet"

  useEffect(() => {
    if (!accountId) return
    if (!account || selectedAccount?.id !== accountId) {
      dispatch(fetchAccount(accountId))
    } else {
      dispatch(setSelectedAccount(account))
    }
  }, [accountId, account, dispatch, selectedAccount])

  // Load initial transactions
  useEffect(() => {
    if (!accountId) return
    let isMounted = true
    setTransactionsState((prev) => ({ ...prev, isLoading: true, error: null, data: [] }))
    transactionsService
      .getAll({ account_id: accountId, page: 1, pageSize: 20 })
      .then((response) => {
        if (!isMounted) return
        const pagination = response.pagination || {
          page: 1,
          pageSize: 20,
          totalPages: 0,
          totalCount: 0,
        }
        setTransactionsState({
          data: response.transactions || [],
          isLoading: false,
          isLoadingMore: false,
          hasMore: pagination.page < pagination.totalPages,
          error: null,
          pagination,
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setTransactionsState((prev) => ({
          ...prev,
          data: [],
          isLoading: false,
          isLoadingMore: false,
          error: error instanceof Error ? error.message : t("detail.transactions.error"),
        }))
      })
    return () => {
      isMounted = false
    }
  }, [accountId, t])

  // Load more transactions when scrolling
  useEffect(() => {
    let loadingMore = false
    let isMounted = true
    
    const handleScroll = () => {
      if (!accountId || loadingMore) return
      
      // Check if we're near the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      // Load more when user is within 200px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        setTransactionsState((prev) => {
          if (!prev.hasMore || prev.isLoading || prev.isLoadingMore || loadingMore) {
            return prev
          }
          
          loadingMore = true
          const nextPage = prev.pagination.page + 1
          
          // Start loading
          transactionsService
            .getAll({ account_id: accountId, page: nextPage, pageSize: 20 })
            .then((response) => {
              if (!isMounted) return
              const pagination = response.pagination || {
                page: nextPage,
                pageSize: 20,
                totalPages: 0,
                totalCount: 0,
              }
              const newTransactions = response.transactions || []
              
              setTransactionsState((current) => {
                // Avoid duplicates
                const existingIds = new Set(current.data.map(t => t.id))
                const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t.id))
                loadingMore = false
                return {
                  ...current,
                  data: [...current.data, ...uniqueNewTransactions],
                  isLoadingMore: false,
                  hasMore: pagination.page < pagination.totalPages,
                  pagination,
                }
              })
            })
            .catch((error) => {
              if (!isMounted) return
              setTransactionsState((prev) => {
                loadingMore = false
                return {
                  ...prev,
                  isLoadingMore: false,
                  error: error instanceof Error ? error.message : t("detail.transactions.error"),
                }
              })
            })
          
          return { ...prev, isLoadingMore: true }
        })
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      isMounted = false
      window.removeEventListener('scroll', handleScroll)
    }
  }, [accountId, t])

  useEffect(() => {
    if (!isAssetAccount || !account) return
    let isMounted = true
    setAssetsState((prev) => ({ ...prev, isLoading: true, error: null }))
    investmentsService
      .getInvestments()
      .then(({ investments }) => {
        if (!isMounted) return
        const filtered =
          account.accountType === "crypto_wallet"
            ? investments.filter((inv) => inv.type === "crypto")
            : investments.filter((inv) => inv.type !== "crypto")
        setAssetsState({ data: filtered, isLoading: false, error: null })
      })
      .catch((error) => {
        if (!isMounted) return
        setAssetsState({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : t("detail.assets.error"),
        })
      })
    return () => {
      isMounted = false
    }
  }, [account, isAssetAccount, t])

  const formatCurrency = (amount?: number, currency: string = "VND") => {
    if (amount === undefined || amount === null) return "—"
    return new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency,
    }).format(amount)
  }

  const formatDate = (value?: string) => {
    if (!value) return t("detail.common.notAvailable")
    try {
      return new Intl.DateTimeFormat(numberLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const getAccountTypeLabel = (type?: string) => {
    if (!type) return t("detail.common.notAvailable")
    return t(`accountTypes.${type}`, { defaultValue: type })
  }

  const getStatusVariant = (active?: boolean) => (active ? "default" : "secondary")

  if (!accountId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-center text-muted-foreground">{t("detail.common.invalidId")}</p>
        <Button onClick={() => router.push("/accounts")}>{t("detail.common.backToList")}</Button>
      </div>
    )
  }

  if (accountError && !account) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <p className="font-semibold">{t("detail.common.loadError")}</p>
          <p className="text-sm text-muted-foreground">{accountError}</p>
        </div>
        <Button variant="outline" onClick={() => dispatch(fetchAccount(accountId))}>
          {t("detail.common.retry")}
        </Button>
      </div>
    )
  }

  if (isAccountLoading && !account) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <p className="text-center text-muted-foreground">{t("detail.common.notFound")}</p>
        <Button onClick={() => router.push("/accounts")}>{t("detail.common.backToList")}</Button>
      </div>
    )
  }

  const infoItems = [
    {
      label: t("detail.info.accountType"),
      value: getAccountTypeLabel(account.accountType),
    },
    {
      label: t("detail.info.institution"),
      value: account.institutionName || t("detail.common.notAvailable"),
    },
    {
      label: t("detail.info.accountNumber"),
      value: account.accountNumberMasked || t("detail.info.hiddenNumber"),
    },
    {
      label: t("detail.info.currency"),
      value: account.currency,
    },
    {
      label: t("detail.info.includeInNetWorth"),
      value: account.includeInNetWorth ? t("detail.common.yes") : t("detail.common.no"),
    },
    {
      label: t("detail.info.primary"),
      value: account.isPrimary ? t("detail.info.primaryYes") : t("detail.info.primaryNo"),
    },
    {
      label: t("detail.info.createdAt"),
      value: formatDate(account.createdAt),
    },
    {
      label: t("detail.info.updatedAt"),
      value: formatDate(account.updatedAt),
    },
  ]

  const transactions = transactionsState.data
  const totalAssetValue = assetsState.data.reduce((sum, asset) => sum + (asset.current_value || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="px-0 text-muted-foreground" onClick={() => router.push("/accounts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("detail.common.backToList")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.accountName}</h1>
            <p className="text-muted-foreground">
              {t("detail.common.subtitle", { name: account.accountName })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getAccountTypeLabel(account.accountType)}</Badge>
            {account.institutionName && <Badge variant="outline">{account.institutionName}</Badge>}
            <Badge variant={getStatusVariant(account.isActive)}>
              {account.isActive ? t("detail.overview.active") : t("detail.overview.inactive")}
            </Badge>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">{t("detail.overview.currentBalance")}</p>
          <p className="text-4xl font-bold">{formatCurrency(account.currentBalance, account.currency)}</p>
          {account.availableBalance !== undefined && account.availableBalance !== account.currentBalance && (
            <p className="text-sm text-muted-foreground">
              {t("detail.overview.availableBalance")}: {formatCurrency(account.availableBalance, account.currency)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("detail.cards.netWorthImpact")}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.includeInNetWorth ? formatCurrency(account.currentBalance, account.currency) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {account.includeInNetWorth ? t("detail.cards.included") : t("detail.cards.excluded")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("detail.cards.activityStatus")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.isActive ? t("detail.cards.statusActive") : t("detail.cards.statusInactive")}
            </div>
            <p className="text-xs text-muted-foreground">{t("detail.cards.lastSynced", { value: formatDate(account.lastSyncedAt) })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("detail.cards.syncStatus")}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.syncStatus || t("detail.common.notAvailable")}
            </div>
            {account.syncErrorMessage && (
              <p className="text-xs text-red-500">{account.syncErrorMessage}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("detail.cards.primaryStatus")}</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.isPrimary ? t("detail.cards.primary") : t("detail.cards.secondary")}
            </div>
            <p className="text-xs text-muted-foreground">{t("detail.cards.primaryHelper")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("detail.transactions.title")}</CardTitle>
              <CardDescription>{t("detail.transactions.subtitle")}</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/transactions?account=${account.id}`}>
                {t("detail.transactions.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsState.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : transactionsState.error ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-sm text-red-500">{transactionsState.error}</p>
                <Button variant="outline" onClick={() => router.refresh()}>
                  {t("detail.transactions.retry")}
                </Button>
              </div>
            ) : transactions.length === 0 && !transactionsState.isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-10 text-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">{t("detail.transactions.emptyTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("detail.transactions.emptyDescription")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("detail.transactions.table.date")}</TableHead>
                        <TableHead>{t("detail.transactions.table.description")}</TableHead>
                        <TableHead>{t("table.headers.type", { defaultValue: "Loại" })}</TableHead>
                        <TableHead className="text-right">{t("detail.transactions.table.amount")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const getTransactionTypeLabel = (direction?: string) => {
                          if (direction === 'CREDIT') return 'Thu nhập'
                          if (direction === 'DEBIT') return 'Chi tiêu'
                          return direction || '-'
                        }
                        const getTransactionTypeColor = (direction?: string) => {
                          if (direction === 'CREDIT') return 'text-green-600 dark:text-green-400'
                          if (direction === 'DEBIT') return 'text-red-600 dark:text-red-400'
                          return 'text-gray-600'
                        }
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="whitespace-nowrap">
                              {transaction.bookingDate || transaction.booking_date ? (
                                <div title={`Thời gian giao dịch: ${new Date(transaction.bookingDate || transaction.booking_date).toLocaleString('vi-VN')}`}>
                                  {new Date(transaction.bookingDate || transaction.booking_date).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              ) : transaction.createdAt || transaction.created_at ? (
                                <div title={`Tạo lúc: ${new Date(transaction.createdAt || transaction.created_at).toLocaleString('vi-VN')}`}>
                                  {new Date(transaction.createdAt || transaction.created_at).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{transaction.description || 'Không có mô tả'}</div>
                              {transaction.reference && (
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                  Ref: {transaction.reference}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {(transaction.direction === 'CREDIT' || (transaction as any).direction === 'CREDIT') ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm">
                                  {getTransactionTypeLabel(transaction.direction || (transaction as any).direction)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={getTransactionTypeColor(transaction.direction || (transaction as any).direction)}>
                                {(transaction.direction === 'CREDIT' || (transaction as any).direction === 'CREDIT') ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Loading more indicator */}
                {transactionsState.isLoadingMore && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Đang tải thêm...</p>
                  </div>
                )}
                
                {/* End of list indicator */}
                {!transactionsState.hasMore && transactions.length > 0 && !transactionsState.isLoadingMore && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Đã hiển thị tất cả giao dịch</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("detail.info.title")}</CardTitle>
            <CardDescription>{t("detail.info.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {infoItems.map((item) => (
              <div key={item.label}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("detail.info.securityTitle")}</p>
              <p className="text-sm">{t("detail.info.securityDescription")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAssetAccount && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {account.accountType === "crypto_wallet"
                  ? t("detail.assets.cryptoTitle")
                  : t("detail.assets.investmentTitle")}
              </CardTitle>
              <CardDescription>{t("detail.assets.subtitle")}</CardDescription>
            </div>
            <Coins className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {assetsState.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : assetsState.error ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-sm text-red-500">{assetsState.error}</p>
                <Button variant="outline" onClick={() => router.refresh()}>
                  {t("detail.assets.retry")}
                </Button>
              </div>
            ) : assetsState.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-10 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">{t("detail.assets.emptyTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("detail.assets.emptyDescription")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-sm text-muted-foreground">{t("detail.assets.totalValue")}</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAssetValue, account.currency)}</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("detail.assets.table.asset")}</TableHead>
                        <TableHead className="text-right">{t("detail.assets.table.quantity")}</TableHead>
                        <TableHead className="text-right">{t("detail.assets.table.currentValue")}</TableHead>
                        <TableHead className="text-right">{t("detail.assets.table.gainLoss")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assetsState.data.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="font-medium">{asset.name}</div>
                            <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                          </TableCell>
                          <TableCell className="text-right">{asset.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(asset.current_value, asset.currency)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${asset.total_gain_loss > 0
                                ? "text-green-600 dark:text-green-400"
                                : asset.total_gain_loss < 0
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                              }`}
                          >
                            {formatCurrency(asset.total_gain_loss, asset.currency)} (
                            {asset.total_gain_loss_percentage?.toFixed(2)}%)
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

