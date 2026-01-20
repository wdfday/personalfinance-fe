// Investment Service - matches /api/v1/investment/* backend routes
import { apiClient } from '../client'
import type { 
  InvestmentAsset, 
  CreateAssetRequest, 
  UpdateAssetRequest, 
  PortfolioSummary,
  PortfolioSnapshot,
  TransactionResponse
} from '../types/investments'

export const investmentsService = {
  // Assets - /api/v1/investment/assets
  async getAssets(): Promise<{ assets: InvestmentAsset[]; total: number }> {
    return apiClient.get<{ assets: InvestmentAsset[]; total: number }>('/investment/assets')
  },

  async getAsset(id: string): Promise<InvestmentAsset> {
    return apiClient.get<InvestmentAsset>(`/investment/assets/${id}`)
  },

  async createAsset(data: CreateAssetRequest): Promise<InvestmentAsset> {
    return apiClient.post<InvestmentAsset>('/investment/assets', data)
  },

  async updateAsset(id: string, data: UpdateAssetRequest): Promise<InvestmentAsset> {
    return apiClient.put<InvestmentAsset>(`/investment/assets/${id}`, data)
  },

  async deleteAsset(id: string): Promise<void> {
    return apiClient.delete(`/investment/assets/${id}`)
  },

  // Portfolio Summary - /api/v1/investment/assets/summary
  async getSummary(): Promise<PortfolioSummary> {
    return apiClient.get<PortfolioSummary>('/investment/assets/summary')
  },

  // Snapshots - /api/v1/investment/snapshots
  async getSnapshots(limit = 10): Promise<{ snapshots: PortfolioSnapshot[]; total: number }> {
    return apiClient.get<{ snapshots: PortfolioSnapshot[]; total: number }>(`/investment/snapshots?limit=${limit}`)
  },

  async getLatestSnapshot(): Promise<PortfolioSnapshot> {
    return apiClient.get<PortfolioSnapshot>('/investment/snapshots/latest')
  },

  // Transactions - /api/v1/investment/transactions
  async buyAsset(id: string, data: { quantity: number; price: number; date: string }): Promise<TransactionResponse> {
    return apiClient.post<TransactionResponse>(`/investment/transactions`, { ...data, asset_id: id, type: 'buy' })
  },

  async sellAsset(id: string, data: { quantity: number; price: number; date: string }): Promise<TransactionResponse> {
    return apiClient.post<TransactionResponse>(`/investment/transactions`, { ...data, asset_id: id, type: 'sell' })
  }
}

export default investmentsService
