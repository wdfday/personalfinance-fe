// Broker Types - matches server/internal/module/identify/broker/dto

export interface BrokerConnection {
  id: string
  user_id: string
  broker_type: BrokerType
  broker_name: string
  status: BrokerStatus
  token_expires_at?: string
  last_refreshed_at?: string
  is_token_valid: boolean
  auto_sync: boolean
  sync_frequency: number
  sync_assets: boolean
  sync_transactions: boolean
  sync_prices: boolean
  sync_balance: boolean
  last_sync_at?: string
  last_sync_status?: string
  last_sync_error?: string
  total_syncs: number
  successful_syncs: number
  failed_syncs: number
  external_account_id?: string
  external_account_number?: string
  external_account_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type BrokerType = 'ssi' | 'okx' | 'sepay'
export type BrokerStatus = 'active' | 'disconnected' | 'error' | 'pending'

export interface CreateSSIBrokerRequest {
  consumer_id: string
  consumer_secret: string
  otp_code: string
  otp_method: 'sms' | 'email'
}

export interface CreateOKXBrokerRequest {
  api_key: string
  api_secret: string
  passphrase: string
}

export interface CreateSepayBrokerRequest {
  api_key: string
}

export interface UpdateBrokerRequest {
  auto_sync?: boolean
  sync_frequency?: number
  sync_assets?: boolean
  sync_transactions?: boolean
  sync_prices?: boolean
  sync_balance?: boolean
  notes?: string
}

export interface BrokerProviderInfo {
  broker_type: BrokerType
  display_name: string
  description: string
  required_fields: string[]
  supported_features: string[]
  logo?: string
}

export interface SyncResult {
  success: boolean
  synced_at: string
  assets_count: number
  transactions_count: number
  updated_prices_count: number
  balance_updated: boolean
  error?: string
  details?: Record<string, unknown>
}
