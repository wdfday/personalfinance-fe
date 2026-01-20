// Investment Types
export interface InvestmentAsset {
  id: string
  user_id: string
  symbol: string
  name: string
  asset_type: string
  asset_class?: string
  sector?: string
  industry?: string
  currency: string
  quantity: number
  average_cost_per_unit: number
  total_cost: number
  current_price: number
  current_value: number
  unrealized_gain: number
  unrealized_gain_pct: number
  realized_gain: number
  realized_gain_pct: number
  portfolio_weight: number
  total_dividends: number
  dividend_yield: number
  last_dividend_amount?: number
  last_dividend_date?: string
  status: string
  is_watchlist: boolean
  notes?: string
  tags?: string
  auto_update_price: boolean
  last_price_update?: string
  total_return: number
  total_return_pct: number
  created_at: string
  updated_at: string
}

export interface PortfolioSummary {
  total_assets: number
  total_invested: number
  total_value: number
  total_unrealized_gain: number
  total_realized_gain: number
  total_gain: number
  total_gain_pct: number
  total_dividends: number
  by_asset_type: Record<string, AssetTypeSummary>
}

export interface AssetTypeSummary {
  asset_type: string
  total_value: number
  total_cost: number
  asset_count: number
  percentage: number
}

export interface PortfolioSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  snapshot_type: string
  period?: string
  total_value: number
  total_cost: number
  total_unrealized_gain: number
  total_realized_gain: number
  total_dividends: number
  total_return: number
  total_return_pct: number
  day_change: number
  day_change_pct: number
  total_assets: number
  active_assets: number
  asset_types?: string
  sector_allocation?: string
  cash_inflow: number
  cash_outflow: number
  net_cash_flow: number
  created_at: string
}

export interface CreateAssetRequest {
  symbol: string
  name: string
  asset_type: string
  currency: string
  quantity?: number
  average_cost_per_unit?: number
  current_price?: number
  notes?: string
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  is_watchlist?: boolean
  auto_update_price?: boolean
}

export interface TransactionResponse {
  asset: InvestmentAsset
  transaction_id?: string
  realized_gain?: number
  message: string
}
