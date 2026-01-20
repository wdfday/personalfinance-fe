// Account Types - matches server/internal/module/cashflow/account/dto

export interface Account {
  id: string
  user_id: string
  account_name: string
  account_type: AccountType
  institution_name?: string
  current_balance: number
  available_balance?: number
  currency: string
  account_number_masked?: string
  is_active: boolean
  is_primary: boolean
  include_in_net_worth: boolean
  last_synced_at?: string
  sync_status?: SyncStatus
  sync_error_message?: string
  created_at: string
  updated_at: string
}

export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'investment' | 'crypto_wallet'
export type SyncStatus = 'active' | 'error' | 'disconnected'

export interface CreateAccountRequest {
  account_name: string
  account_type: AccountType
  institution_name?: string
  current_balance?: number
  available_balance?: number
  currency?: string
  account_number_masked?: string
  is_active?: boolean
  is_primary?: boolean
  include_in_net_worth?: boolean
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  sync_status?: SyncStatus
  sync_error_message?: string
}

export interface AccountsListResponse {
  items: Account[]
  total: number
}
