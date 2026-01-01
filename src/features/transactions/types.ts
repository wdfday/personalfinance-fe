/**
 * Transactions Types
 * Re-export types from centralized API types
 */

export type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryFilters,
  TransactionListResponse,
  TransactionSummary,
  TransactionDirection,
  TransactionInstrument,
  TransactionSource,
  TransactionCounterparty,
  TransactionClassification,
  TransactionLink,
} from '@/types/api'

// Alias for backwards compatibility
export type { TransactionQueryFilters as TransactionQueryParams } from '@/types/api'

// Additional helper types for UI
export interface PaginationInfo {
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
}
