/**
 * Custom hook for Transactions Redux state
 * Hook tùy chỉnh để làm việc với Redux state của Transactions
 */

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  fetchTransactions,
  fetchTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  clearError,
  setSelectedTransaction,
  clearSelectedTransaction,
  setFilters,
  clearFilters,
} from '@/features/transactions/transactionsSlice'
import type { CreateTransactionRequest, UpdateTransactionRequest, TransactionQueryParams } from '@/features/transactions/types'

export function useTransactionsRedux() {
  const dispatch = useAppDispatch()
  const transactionsState = useAppSelector((state) => state.transactions)

  return {
    // State
    transactions: transactionsState.transactions,
    selectedTransaction: transactionsState.selectedTransaction,
    isLoading: transactionsState.isLoading,
    error: transactionsState.error,
    pagination: transactionsState.pagination,
    summary: transactionsState.summary,
    filters: transactionsState.filters,

    // Actions
    fetchTransactions: (params?: TransactionQueryParams) => dispatch(fetchTransactions(params)),
    fetchTransaction: (id: string) => dispatch(fetchTransaction(id)),
    createTransaction: (data: CreateTransactionRequest) => dispatch(createTransaction(data)),
    updateTransaction: (id: string, data: UpdateTransactionRequest) => 
      dispatch(updateTransaction({ id, data })),
    deleteTransaction: (id: string) => dispatch(deleteTransaction(id)),
    
    // Utility actions
    clearError: () => dispatch(clearError()),
    setSelectedTransaction: (transaction: typeof transactionsState.selectedTransaction) => 
      dispatch(setSelectedTransaction(transaction)),
    clearSelectedTransaction: () => dispatch(clearSelectedTransaction()),
    setFilters: (filters: Partial<TransactionQueryParams>) => dispatch(setFilters(filters)),
    clearFilters: () => dispatch(clearFilters()),
  }
}

