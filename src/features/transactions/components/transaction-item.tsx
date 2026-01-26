"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/types/api"

interface TransactionItemProps {
  transaction: Transaction
  showCategory?: boolean
  showLinks?: boolean
  showDate?: boolean
  formatCurrency: (amount: number, currency: string) => string
  getTransactionTypeLabel: (direction?: string) => string
  getTransactionTypeColor: (direction?: string) => string
  categories?: Array<{ id: string; name: string }>
  onCategoryChange?: (transactionId: string, categoryId: string | undefined) => void
  onLinksChange?: (transactionId: string, links: any[]) => void
  budgets?: Array<{ id: string; name: string }>
  debts?: Array<{ id: string; name: string }>
  incomeProfiles?: Array<{ id: string; name: string }>
  TransactionLinkSelector?: any
  CategoryPickerPopover?: any
  getLinkIcon?: (type: string) => React.ReactNode
  getLinkColor?: (type: string) => string
  getLinkName?: (link: any) => string
}

export function TransactionItem({
  transaction,
  showCategory = false,
  showLinks = false,
  showDate = true,
  formatCurrency,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  categories = [],
  onCategoryChange,
  onLinksChange,
  budgets = [],
  debts = [],
  incomeProfiles = [],
  TransactionLinkSelector,
  CategoryPickerPopover,
  getLinkIcon,
  getLinkColor,
  getLinkName,
}: TransactionItemProps) {
  const direction = transaction.direction || (transaction as any).direction
  const bookingDate = transaction.bookingDate || transaction.booking_date
  const createdAt = transaction.createdAt || transaction.created_at

  return (
    <>
      {/* Description */}
      <div>
        <div className="font-medium">{transaction.description || "Không có mô tả"}</div>
        {transaction.reference && (
          <div className="text-xs text-muted-foreground font-mono mt-1">
            Ref: {transaction.reference}
          </div>
        )}
      </div>

      {/* Category */}
      {showCategory && (
        <div className="min-w-[150px]">
          {transaction.userCategoryId || transaction.categoryId ? (
            <Badge variant="secondary" className="text-xs">
              {categories.find(c => c.id === (transaction.userCategoryId || transaction.categoryId))?.name || "Category"}
            </Badge>
          ) : CategoryPickerPopover && onCategoryChange ? (
            <CategoryPickerPopover
              categories={categories}
              value={undefined}
              onChange={(categoryId: string) => onCategoryChange(transaction.id, categoryId)}
              placeholder="Chọn danh mục..."
              categoryType={direction === "CREDIT" ? "income" : "expense"}
              className="h-7 text-xs"
            />
          ) : null}
        </div>
      )}

      {/* Links */}
      {showLinks && (
        <div className="min-w-[150px]">
          {transaction.links && transaction.links.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {transaction.links.map((link, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`text-xs flex items-center gap-1 ${getLinkColor?.(link.type) || ""}`}
                >
                  {getLinkIcon?.(link.type)}
                  <span>{getLinkName?.(link) || link.type}</span>
                </Badge>
              ))}
            </div>
          ) : TransactionLinkSelector && onLinksChange ? (
            <TransactionLinkSelector
              value={[]}
              onChange={(links: any[]) => onLinksChange(transaction.id, links)}
              budgets={budgets.filter(b => b.status !== 'ended').map(b => ({ id: b.id, name: b.name }))}
              debts={debts.map(d => ({ id: d.id, name: d.name }))}
              incomeProfiles={incomeProfiles.map(i => ({ 
                id: i.id, 
                name: i.source || i.description || `Income ${i.id.slice(0, 8)}` 
              }))}
              direction={direction}
              compact={true}
              className="w-full"
            />
          ) : null}
        </div>
      )}

      {/* Type */}
      <div className="flex items-center gap-1">
        {direction === 'CREDIT' ? (
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm">{getTransactionTypeLabel(direction)}</span>
      </div>

      {/* Amount */}
      <span className={getTransactionTypeColor(direction)}>
        {direction === 'CREDIT' ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
      </span>

      {/* Date */}
      {showDate && (
        <div className="text-sm">
          {bookingDate ? (
            <div title={`Thời gian giao dịch: ${new Date(bookingDate).toLocaleString('vi-VN')}`}>
              {new Date(bookingDate).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          ) : createdAt ? (
            <div title={`Tạo lúc: ${new Date(createdAt).toLocaleString('vi-VN')}`}>
              {new Date(createdAt).toLocaleString('vi-VN', {
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
        </div>
      )}
    </>
  )
}
