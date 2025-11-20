/**
 * Transactions Feature - Main Export
 */

// Types
export type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionQueryParams,
} from './types'

// Service
export { transactionsService } from './services/transactions.service'

// Redux
export {
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
} from './transactionsSlice'

// Hooks
export { useTransactionsRedux } from './hooks/use-transactions-redux'

// Components
export { CreateTransactionModal } from './create-transaction-modal'
export { EditTransactionModal } from './edit-transaction-modal'
export { DeleteTransactionModal } from './delete-transaction-modal'

// Slice default export
export { default as transactionsSlice } from './transactionsSlice'
