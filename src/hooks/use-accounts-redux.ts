/**
 * Custom hook for Accounts Redux state
 * Hook tùy chỉnh để làm việc với Redux state của Accounts
 */

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchAccounts,
  fetchAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  clearError,
  setSelectedAccount,
  clearSelectedAccount,
} from '@/features/accounts/accountsSlice'
import type { CreateAccountRequest, UpdateAccountRequest } from '@/services/api'

export function useAccountsRedux() {
  const dispatch = useAppDispatch()
  const accountsState = useAppSelector((state) => state.accounts)

  return {
    // State
    accounts: accountsState.accounts,
    selectedAccount: accountsState.selectedAccount,
    isLoading: accountsState.isLoading,
    error: accountsState.error,
    total: accountsState.total,

    // Actions
    fetchAccounts: () => dispatch(fetchAccounts()),
    fetchAccount: (id: string) => dispatch(fetchAccount(id)),
    createAccount: (data: CreateAccountRequest) => dispatch(createAccount(data)),
    updateAccount: (id: string, data: UpdateAccountRequest) => 
      dispatch(updateAccount({ id, data })),
    deleteAccount: (id: string) => dispatch(deleteAccount(id)),
    
    // Utility actions
    clearError: () => dispatch(clearError()),
    setSelectedAccount: (account: typeof accountsState.selectedAccount) => 
      dispatch(setSelectedAccount(account)),
    clearSelectedAccount: () => dispatch(clearSelectedAccount()),
  }
}

