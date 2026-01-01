/**
 * Investments Service
 * Quản lý danh mục đầu tư
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'

// Investment types
export type InvestmentAssetType = 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'gold' | 'other'

export interface Investment {
  id: string
  user_id: string
  account_id?: string
  asset_type: InvestmentAssetType
  symbol: string
  name: string
  quantity: number
  purchase_price: number
  current_price: number
  currency: string
  purchase_date: string
  current_value: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvestmentRequest {
  account_id?: string
  asset_type: InvestmentAssetType
  symbol: string
  name: string
  quantity: number
  purchase_price: number
  currency: string
  purchase_date: string
  notes?: string
}

export interface UpdateInvestmentRequest {
  account_id?: string
  asset_type?: InvestmentAssetType
  symbol?: string
  name?: string
  quantity?: number
  purchase_price?: number
  current_price?: number
  currency?: string
  purchase_date?: string
  notes?: string
  is_active?: boolean
}

export interface InvestmentListResponse {
  items: Investment[]
  total: number
}

export interface InvestmentSummary {
  total_investments: number
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  by_asset_type: Record<string, {
    count: number
    value: number
    gain_loss: number
    percentage: number
  }>
}

class InvestmentsService {
  /**
   * Lấy danh sách investments
   */
  async getInvestments(): Promise<InvestmentListResponse> {
    return baseApiClient.get<InvestmentListResponse>('/investments')
  }

  /**
   * Lấy thông tin một investment
   */
  async getInvestment(id: string): Promise<Investment> {
    return baseApiClient.get<Investment>(`/investments/${id}`)
  }

  /**
   * Tạo investment mới
   */
  async createInvestment(data: CreateInvestmentRequest): Promise<Investment> {
    return baseApiClient.post<Investment>('/investments', data)
  }

  /**
   * Cập nhật investment
   */
  async updateInvestment(id: string, data: UpdateInvestmentRequest): Promise<Investment> {
    return baseApiClient.put<Investment>(`/investments/${id}`, data)
  }

  /**
   * Xóa investment (soft delete)
   */
  async deleteInvestment(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/investments/${id}`)
  }

  /**
   * Lấy investment summary
   */
  async getInvestmentSummary(): Promise<InvestmentSummary> {
    return baseApiClient.get<InvestmentSummary>('/investments/summary')
  }

  /**
   * Cập nhật giá hiện tại của investment
   */
  async updateCurrentPrice(id: string, currentPrice: number): Promise<Investment> {
    return this.updateInvestment(id, { current_price: currentPrice })
  }

  /**
   * Lấy investments theo asset type
   */
  async getInvestmentsByAssetType(assetType: InvestmentAssetType): Promise<Investment[]> {
    const response = await this.getInvestments()
    return response.items.filter(inv => inv.asset_type === assetType)
  }
}

// Export singleton instance
export const investmentsService = new InvestmentsService()
export default investmentsService
