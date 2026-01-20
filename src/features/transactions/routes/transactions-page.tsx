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
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Edit, Trash2, TrendingUp, TrendingDown, Wallet, User, Tag, Target, CreditCard, DollarSign, ChevronDown, ChevronRight, Building } from "lucide-react"
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  const toggleRowExpansion = (transactionId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId)
    } else {
      newExpanded.add(transactionId)
    }
    setExpandedRows(newExpanded)
  }

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return <Target className="h-3 w-3" />
      case 'BUDGET': return <Wallet className="h-3 w-3" />
      case 'DEBT': return <CreditCard className="h-3 w-3" />
      case 'INCOME_PROFILE': return <DollarSign className="h-3 w-3" />
      default: return null
    }
  }

  const getLinkColor = (type: string) => {
    switch (type) {
      case 'GOAL': return 'border-green-500 text-green-700 dark:text-green-400'
      case 'BUDGET': return 'border-blue-500 text-blue-700 dark:text-blue-400'
      case 'DEBT': return 'border-red-500 text-red-700 dark:text-red-400'
      case 'INCOME_PROFILE': return 'border-purple-500 text-purple-700 dark:text-purple-400'
      default: return 'border-gray-500'
    }
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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Account Sidebar */}
        <div className="md:col-span-1 space-y-4">
            <Card>
                <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        {t("accountNavigator.title", { defaultValue: "Accounts" })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                    <div className="flex flex-col gap-1">
                        <Button
                            variant={selectedAccountId === "all" ? "secondary" : "ghost"}
                            className="justify-start font-normal h-auto py-2 px-3"
                            onClick={() => handleFilterChange("account_id", "")}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="truncate">{t("accountNavigator.all")}</span>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 min-w-[1.25rem] justify-center">{pagination.totalCount}</Badge>
                            </div>
                        </Button>
                        
                        {accounts.map((account) => {
                             const isActive = selectedAccountId === account.id;
                             const accountTransactionCount = filteredTransactions.filter(t => t.accountId === account.id).length;
                             
                             return (
                                <Button
                                    key={account.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="justify-start font-normal h-auto py-2 px-3"
                                    onClick={() => handleFilterChange("account_id", account.id)}
                                >
                                    <div className="flex flex-col items-start w-full gap-0.5 overflow-hidden">
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="truncate font-medium">{account.accountName}</span>
                                            {(isActive || accountTransactionCount > 0) && (
                                                <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 min-w-[1.25rem] justify-center shrink-0">
                                                    {accountTransactionCount}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {formatCurrency(account.currentBalance, account.currency)}
                                        </span>
                                    </div>
                                </Button>
                             )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Account Details (Visible only when specific account selected) */}
            {selectedAccount && (
                <Card className="bg-muted/40 border-dashed">
                    <CardContent className="p-4 space-y-2">
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Details</div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("accountNavigator.type")}</span>
                            <span className="font-medium">{selectedAccount.accountType || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Currency</span>
                            <span className="font-medium">{selectedAccount.currency}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right Column: Content */}
        <div className="md:col-span-4 space-y-6">
            
            {/* Summary Row */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("summary.totalIncome")}</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCredit || 0)}</div>
                  </Card>
                  <Card className="p-4 flex flex-col justify-between shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("summary.totalExpense")}</span>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDebit || 0)}</div>
                  </Card>
                   <Card className="p-4 flex flex-col justify-between shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("summary.totalTransfer")}</span>
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(0)}</div>
                  </Card>
                   <Card className="p-4 flex flex-col justify-between shadow-sm bg-muted/20">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("summary.netAmount")}</span>
                          {summary.netAmount >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                      </div>
                      <div>
                          <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.netAmount)}
                          </div>
                           <p className="text-xs text-muted-foreground mt-1">
                                {t("summary.transactions", { values: { count: summary.count } })}
                           </p>
                      </div>
                  </Card>
                </div>
            )}

            {/* Compact Toolbar & Tools */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-1 rounded-lg">
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("filters.searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Select
                        value={filters.direction || "all"}
                        onValueChange={(value) => handleFilterChange("direction", value === "all" ? "" : value)}
                    >
                        <SelectTrigger className="w-[130px] bg-background">
                           <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                           <SelectValue placeholder={t("filters.typeAll")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("filters.typeAll")}</SelectItem>
                            <SelectItem value="CREDIT">{t("types.income")}</SelectItem>
                            <SelectItem value="DEBIT">{t("types.expense")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.source || "all"}
                        onValueChange={(value) => handleFilterChange("source", value === "all" ? "" : value)}
                    >
                         <SelectTrigger className="w-[140px] bg-background">
                           <Target className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                           <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">{t("filters.sourceAll", { defaultValue: "All Sources" })}</SelectItem>
                             <SelectItem value="BANK_API">{t("sources.bankApi", { defaultValue: "Bank API" })}</SelectItem>
                             <SelectItem value="MANUAL">{t("sources.manual", { defaultValue: "Manual" })}</SelectItem>
                             <SelectItem value="CSV_IMPORT">{t("sources.csvImport", { defaultValue: "CSV Import" })}</SelectItem>
                        </SelectContent>
                    </Select>
                    
                     <Button variant="outline" size="icon" title="Clear Filters" onClick={() => {
                         dispatch(setFilters({ direction: undefined, source: undefined }))
                     }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                     </Button>
                </div>
            </div>

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
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>{t("table.headers.description")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("table.headers.counterparty", { defaultValue: "Đối tác" })}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("table.headers.tags", { defaultValue: "Tags" })}</TableHead>
                <TableHead className="hidden xl:table-cell">{t("table.headers.links", { defaultValue: "Liên kết" })}</TableHead>
                <TableHead>{t("table.headers.type")}</TableHead>
                <TableHead>{t("table.headers.amount")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("table.headers.date")}</TableHead>
                <TableHead>{t("table.headers.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const isExpanded = expandedRows.has(transaction.id)
                return (
                  <>
                    <TableRow key={transaction.id}>
                      {/* Expand Toggle */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRowExpansion(transaction.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description || t("table.noDescription")}</div>
                          {transaction.reference && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {transaction.reference}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Counterparty */}
                      <TableCell className="hidden md:table-cell">
                        {transaction.counterparty?.name ? (
                          <div className="flex items-center gap-1">
                            {transaction.counterparty.type === 'MERCHANT' ? (
                              <Building className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <User className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-sm truncate max-w-[150px]">
                              {transaction.counterparty.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Tags */}
                      <TableCell className="hidden lg:table-cell">
                        {transaction.classification?.tags && transaction.classification.tags.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {transaction.classification.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {transaction.classification.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{transaction.classification.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Links */}
                      <TableCell className="hidden xl:table-cell">
                        {transaction.links && transaction.links.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {transaction.links.map((link, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs flex items-center gap-1 ${getLinkColor(link.type)}`}
                              >
                                {getLinkIcon(link.type)}
                                <span className="capitalize">{link.type.toLowerCase()}</span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {transaction.direction === 'CREDIT' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{getTransactionTypeLabel(transaction.direction)}</span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className={getTransactionTypeColor(transaction.direction)}>
                          {transaction.direction === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="hidden md:table-cell">
                        {new Date(transaction.bookingDate).toLocaleDateString('vi-VN')}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30">
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Account */}
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Tài khoản</div>
                                <div className="text-sm flex items-center gap-1">
                                  <Wallet className="h-3 w-3" />
                                  {accounts.find(acc => acc.id === transaction.accountId)?.accountName || t("table.unknownAccount")}
                                </div>
                              </div>

                              {/* Instrument */}
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Phương thức</div>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.instrument}
                                </Badge>
                              </div>

                              {/* Source */}
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Nguồn</div>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.source}
                                </Badge>
                              </div>

                              {/* Counterparty Full */}
                              {transaction.counterparty && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Đối tác</div>
                                  <div className="text-sm space-y-1">
                                    <div className="flex items-center gap-1">
                                      {transaction.counterparty.type === 'MERCHANT' ? (
                                        <Building className="h-3 w-3" />
                                      ) : (
                                        <User className="h-3 w-3" />
                                      )}
                                      {transaction.counterparty.name}
                                    </div>
                                    {transaction.counterparty.accountNumber && (
                                      <div className="text-xs text-muted-foreground">
                                        STK: {transaction.counterparty.accountNumber}
                                      </div>
                                    )}
                                    {transaction.counterparty.bankName && (
                                      <div className="text-xs text-muted-foreground">
                                        {transaction.counterparty.bankName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* All Tags */}
                              {transaction.classification?.tags && transaction.classification.tags.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Tags</div>
                                  <div className="flex gap-1 flex-wrap">
                                    {transaction.classification.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* All Links */}
                              {transaction.links && transaction.links.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Liên kết</div>
                                  <div className="flex gap-1 flex-wrap">
                                    {transaction.links.map((link, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className={`text-xs flex items-center gap-1 ${getLinkColor(link.type)}`}
                                      >
                                        {getLinkIcon(link.type)}
                                        <span className="capitalize">{link.type.replace('_', ' ').toLowerCase()}</span>
                                        <span className="text-xs text-muted-foreground">({link.id.slice(0, 8)}...)</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* User Note */}
                            {transaction.userNote && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Ghi chú</div>
                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                  {transaction.userNote}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("table.noResults")}</p>
            </div>
          )}
        </CardContent>
      </Card>

        </div>
      </div>

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
