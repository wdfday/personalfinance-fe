"use client"

import { useState } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, Send, CreditCard, MoreHorizontal } from "lucide-react"
import { AddMoneyModal } from "./add-money-modal"
import { SendMoneyModal } from "./send-money-modal"
import { RequestMoneyModal } from "./request-money-modal"

export function AccountsOverview() {
  const { accounts } = useAppSelector((state) => state.accounts)
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false)
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false)

  const handleAddMoney = (amount: number) => {
    // This would typically dispatch an action to update the account balance
    console.log(`Adding $${amount} to account`)
  }

  const handleSendMoney = (amount: number, fromAccount: string) => {
    // This would typically dispatch an action to transfer money
    console.log(`Sending $${amount} from ${fromAccount}`)
  }

  // Calculate total net worth
  const netWorth = accounts
    .filter((a) => a.includeInNetWorth)
    .reduce((sum, account) => sum + account.currentBalance, 0)

  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const handleRequestMoney = (amount, contact) => {
    console.log(`Requested $${amount} from ${contact.name}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
            <h2 className="text-3xl font-bold">{formatCurrency(netWorth)}</h2>
          </div>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${account.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="font-medium">{account.accountName}</span>
                </div>
                <span>{formatCurrency(account.currentBalance, account.currency)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => setIsAddMoneyModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
          <Button size="sm" onClick={() => setIsSendMoneyModalOpen(true)}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button size="sm" onClick={() => setIsRequestMoneyModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> Request
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="mr-2 h-4 w-4" /> More
          </Button>
        </div>
      </CardContent>
      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onAddMoney={handleAddMoney}
      />
      <SendMoneyModal
        isOpen={isSendMoneyModalOpen}
        onClose={() => setIsSendMoneyModalOpen(false)}
        onSendMoney={handleSendMoney}
        accounts={accounts}
      />
      <RequestMoneyModal
        isOpen={isRequestMoneyModalOpen}
        onClose={() => setIsRequestMoneyModalOpen(false)}
        onRequestMoney={handleRequestMoney}
      />
    </Card>
  )
}
