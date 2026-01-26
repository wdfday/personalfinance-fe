/**
 * Utility functions for calculating account available balance
 * Số dư khả dụng = Số dư hiện tại - Tổng các contribution đã sử dụng
 */

import type { Account } from "@/services/api/types/accounts"
import type { Goal } from "@/services/api/types/goals"

export interface Contribution {
  id: string
  goalId: string
  accountId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  currency: string
}

/**
 * Calculate net contributions for an account
 * Net contributions = Sum of deposits - Sum of withdrawals
 */
export function calculateNetContributions(
  accountId: string,
  contributions: Contribution[]
): number {
  return contributions
    .filter(c => c.accountId === accountId)
    .reduce((sum, c) => {
      if (c.type === 'deposit') {
        return sum + c.amount
      } else {
        return sum - c.amount
      }
    }, 0)
}

/**
 * Calculate available balance for an account
 * Available balance = Current balance - Net contributions
 */
export function calculateAvailableBalance(
  account: Account,
  netContributions: number
): number {
  const currentBalance = account.current_balance || 0
  return Math.max(0, currentBalance - netContributions)
}

/**
 * Enrich accounts with available balance calculated from contributions
 */
export function enrichAccountsWithAvailableBalance(
  accounts: Account[],
  contributions: Contribution[]
): Account[] {
  return accounts.map(account => {
    const netContributions = calculateNetContributions(account.id, contributions)
    const availableBalance = calculateAvailableBalance(account, netContributions)
    
    return {
      ...account,
      available_balance: availableBalance,
    }
  })
}

/**
 * Get available balance for a single account
 * Falls back to current_balance if available_balance is not set
 */
export function getAccountAvailableBalance(account: Account): number {
  if (account.available_balance !== undefined && account.available_balance !== null) {
    return account.available_balance
  }
  return account.current_balance || 0
}
