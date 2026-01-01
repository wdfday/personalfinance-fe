"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchTransactions, setFilters } from "@/features/transactions/transactionsSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Edit, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { CreateTransactionModal } from "@/features/transactions/create-transaction-modal"
import { EditTransactionModal } from "@/features/transactions/edit-transaction-modal"
import { DeleteTransactionModal } from "@/features/transactions/delete-transaction-modal"
import { useTranslation } from "@/contexts/i18n-context"
import type { Transaction } from "@/types/api"

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { t } = useTranslation("transactions")
  const { t: tCommonActions } = useTranslation("common.actions")
  const { transactions, isLoading, error, filters, pagination, summary } = useAppSelector((state) => state.transactions)
  const { accounts } = useAppSelector((state) => state.accounts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Read account query parameter from URL on mount and when URL changes
  useEffect(() => {
    const accountId = searchParams.get("account")
    // Only update filter if URL param differs from current filter
    if (accountId !== filters.accountId) {
      if (accountId) {
        dispatch(setFilters({ accountId: accountId }))
      } else if (filters.accountId) {
        // If URL has no account param but filter does, clear the filter
        dispatch(setFilters({ accountId: undefined }))
      }
    }
  }, [searchParams, dispatch, filters.accountId])

  useEffect(() => {
    dispatch(fetchTransactions(filters))
    if (accounts.length === 0) {
      dispatch(fetchAccounts())
    }
  }, [dispatch, filters, accounts.length])

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value || undefined }))

    // Update URL query parameter for account
    if (key === "account_id") {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("account", value)
      } else {
        params.delete("account")
      }
      router.push(`/transactions?${params.toString()}`, { scroll: false })
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  // Local search filter
  const filteredTransactions = transactions.filter(transaction =>
    (transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transaction.userNote?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getTransactionTypeLabel = (direction: string) => {
    if (direction === 'CREDIT') return t('types.income', { defaultValue: 'Income' })
    if (direction === 'DEBIT') return t('types.expense', { defaultValue: 'Expense' })
    return direction
  }

  const getTransactionTypeColor = (direction: string) => {
    const colors: Record<string, string> = {
      CREDIT: 'text-green-600 dark:text-green-400',
      DEBIT: 'text-red-600 dark:text-red-400',
    }
    return colors[direction] || 'text-gray-600'
  }

  const getStatusLabel = (status: string) => {
    return t(`statuses.${status}`, { defaultValue: status })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || colors.completed
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
          <Button onClick={() => dispatch(fetchTransactions(filters))}>{t("status.retry")}</Button>
        </div>
      </div>
    )
  }

  const selectedAccountId = filters.accountId || "all"
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)

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

      {/* Account Navigator */}
      {accounts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">{t("accountNavigator.selectAccount")}</Label>
              </div>
              <Tabs
                value={selectedAccountId}
                onValueChange={(value) => handleFilterChange("account_id", value === "all" ? "" : value)}
                className="w-full"
              >
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex w-auto h-auto p-1 bg-muted/50 gap-1">
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
                    >
                      <span className="text-sm font-medium">{t("accountNavigator.all")}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {pagination.totalCount}
                      </Badge>
                    </TabsTrigger>
                    {accounts.map((account) => {
                      const accountTransactionCount = filteredTransactions.filter(
                        t => t.accountId === account.id
                      ).length
                      return (
                        <TabsTrigger
                          key={account.id}
                          value={account.id}
                          className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
                        >
                          <Wallet className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium">{account.accountName}</span>
                          <Badge variant="secondary" className="ml-1 text-xs shrink-0">
                            {accountTransactionCount}
                          </Badge>
                          {account.isPrimary && (
                            <Badge variant="default" className="ml-1 text-xs shrink-0">{t("accountNavigator.primary")}</Badge>
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>
              </Tabs>
              {selectedAccount && selectedAccountId !== "all" && (
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                  <span>{t("accountNavigator.balance")}: <span className="font-semibold text-foreground">{formatCurrency(selectedAccount.currentBalance, selectedAccount.currency)}</span></span>
                  {selectedAccount.accountType && (
                    <span>{t("accountNavigator.type")}: <span className="font-semibold text-foreground">{selectedAccount.accountType}</span></span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.totalIncome")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalCredit || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.totalExpense")}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalDebit || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.totalTransfer")}</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("summary.netAmount")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("summary.transactions", { values: { count: summary.count } })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
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
              <label className="text-sm font-medium">{t("filters.search")}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("filters.type")}</label>
              <Select
                value={filters.direction || "all"}
                onValueChange={(value) => handleFilterChange("direction", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.typeAll")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.typeAll")}</SelectItem>
                  <SelectItem value="CREDIT">{t("types.income")}</SelectItem>
                  <SelectItem value="DEBIT">{t("types.expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("filters.source")}</label>
              <Select
                value={filters.source || "all"}
                onValueChange={(value) => handleFilterChange("source", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.sourceAll", { defaultValue: "All Sources" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.sourceAll", { defaultValue: "All Sources" })}</SelectItem>
                  <SelectItem value="BANK_API">{t("sources.bankApi", { defaultValue: "Bank API" })}</SelectItem>
                  <SelectItem value="MANUAL">{t("sources.manual", { defaultValue: "Manual" })}</SelectItem>
                  <SelectItem value="CSV_IMPORT">{t("sources.csvImport", { defaultValue: "CSV Import" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("table.title")}</CardTitle>
          <CardDescription>
            {t("table.description", { values: { filtered: filteredTransactions.length, total: pagination.totalCount } })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.headers.description")}</TableHead>
                <TableHead>{t("table.headers.type")}</TableHead>
                <TableHead>{t("table.headers.amount")}</TableHead>
                <TableHead>{t("table.headers.account")}</TableHead>
                <TableHead>{t("table.headers.date")}</TableHead>
                <TableHead>{t("table.headers.status")}</TableHead>
                <TableHead>{t("table.headers.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description || t("table.noDescription")}</div>
                      {transaction.userNote && (
                        <div className="text-sm text-muted-foreground">
                          {transaction.userNote}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {transaction.direction === 'CREDIT' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span>{getTransactionTypeLabel(transaction.direction)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getTransactionTypeColor(transaction.direction)}>
                      {transaction.direction === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {accounts.find(acc => acc.id === transaction.accountId)?.accountName || t("table.unknownAccount")}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.bookingDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t('statuses.completed', { defaultValue: 'Completed' })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("table.noResults")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />

      <DeleteTransactionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}
