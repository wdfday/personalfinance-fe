"use client"

import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function RecentTransactions() {
  const { transactions } = useAppSelector((state) => state.transactions)

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(transaction.bookingDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${transaction.direction === "CREDIT"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                    }`}
                >
                  {transaction.direction === "CREDIT" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                </span>
                {transaction.direction === "CREDIT" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 ml-1" />
                )}
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline">
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  )
}
