/**
 * Hook to calculate and get available balance for accounts
 * Tính số dư khả dụng = số dư hiện tại - tổng contributions
 */

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import { goalsService } from "@/services/api/services/goals.service"
import { calculateNetContributions, calculateAvailableBalance, getAccountAvailableBalance } from "@/utils/account-balance"
import type { Account } from "@/services/api/types/accounts"
import { useState, useEffect } from "react"

interface Contribution {
  id: string
  goalId: string
  accountId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  currency: string
}

/**
 * Hook to fetch all contributions and calculate available balance for accounts
 */
export function useAccountAvailableBalance() {
  const accounts = useAppSelector((state) => state.accounts.accounts)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all goals and their contributions
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setIsLoading(true)
        const goalsResponse = await goalsService.getAll()
        const allContributions: Contribution[] = []

        // Fetch contributions for each goal
        for (const goal of goalsResponse.items) {
          try {
            const contributionsResponse = await goalsService.getContributions(goal.id)
            allContributions.push(...contributionsResponse.contributions.map(c => ({
              id: c.id,
              goalId: c.goalId,
              accountId: c.accountId,
              type: c.type,
              amount: c.amount,
              currency: c.currency,
            })))
          } catch (error) {
            console.error(`Failed to fetch contributions for goal ${goal.id}:`, error)
          }
        }

        setContributions(allContributions)
      } catch (error) {
        console.error('Failed to fetch contributions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (accounts.length > 0) {
      fetchContributions()
    } else {
      setIsLoading(false)
    }
  }, [accounts.length])

  // Calculate available balance for each account
  const accountsWithAvailableBalance = useMemo(() => {
    return accounts.map(account => {
      const netContributions = calculateNetContributions(account.id, contributions)
      const availableBalance = calculateAvailableBalance(account, netContributions)
      
      return {
        ...account,
        available_balance: availableBalance,
      }
    })
  }, [accounts, contributions])

  /**
   * Get available balance for a specific account
   */
  const getAvailableBalance = (accountId: string): number => {
    const account = accountsWithAvailableBalance.find(acc => acc.id === accountId)
    if (!account) return 0
    return getAccountAvailableBalance(account)
  }

  return {
    accounts: accountsWithAvailableBalance,
    isLoading,
    getAvailableBalance,
  }
}

/**
 * Hook to get available balance for a single account
 */
export function useAccountAvailableBalanceSingle(account: Account | null) {
  const { getAvailableBalance } = useAccountAvailableBalance()
  
  if (!account) {
    return {
      availableBalance: 0,
      currentBalance: 0,
    }
  }

  const availableBalance = getAvailableBalance(account.id)
  const currentBalance = account.current_balance || 0

  return {
    availableBalance,
    currentBalance,
    netContributions: currentBalance - availableBalance,
  }
}
