/**
 * Investments Service
 * Quản lý đầu tư (cổ phiếu, trái phiếu, quỹ, crypto, etc.)
 */

import { baseApiClient } from './base'

// Types
export interface Investment {
  id: string
  user_id: number
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate'
  quantity: number
  purchase_price: number
  current_price: number
  currency: string
  purchase_date: string
  current_value: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvestmentRequest {
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate'
  quantity: number
  purchase_price: number
  currency: string
  purchase_date: string
}

export interface UpdateInvestmentRequest {
  symbol?: string
  name?: string
  type?: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate'
  quantity?: number
  purchase_price?: number
  current_price?: number
  currency?: string
  purchase_date?: string
  is_active?: boolean
}

export interface InvestmentListResponse {
  investments: Investment[]
  total: number
}

class InvestmentsService {
  /**
   * Lấy danh sách tất cả investments
   */
  async getInvestments(): Promise<InvestmentListResponse> {
    const investments = await baseApiClient.get<Investment[]>('/investments')
    return {
      investments: Array.isArray(investments) ? investments : [],
      total: Array.isArray(investments) ? investments.length : 0,
    }
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
   * Xóa investment
   */
  async deleteInvestment(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/investments/${id}`)
  }

  /**
   * Lấy active investments
   */
  async getActiveInvestments(): Promise<Investment[]> {
    const { investments } = await this.getInvestments()
    return investments.filter(i => i.is_active)
  }

  /**
   * Lấy investments theo type
   */
  async getInvestmentsByType(type: Investment['type']): Promise<Investment[]> {
    const { investments } = await this.getInvestments()
    return investments.filter(i => i.type === type)
  }

  /**
   * Tính tổng giá trị portfolio
   */
  async getPortfolioValue(): Promise<number> {
    const { investments } = await this.getInvestments()
    return investments
      .filter(i => i.is_active)
      .reduce((sum, i) => sum + i.current_value, 0)
  }

  /**
   * Tính tổng lãi/lỗ
   */
  async getTotalGainLoss(): Promise<{
    amount: number
    percentage: number
  }> {
    const { investments } = await this.getInvestments()
    const activeInvestments = investments.filter(i => i.is_active)
    
    const totalGainLoss = activeInvestments.reduce(
      (sum, i) => sum + i.total_gain_loss,
      0
    )
    
    const totalInvested = activeInvestments.reduce(
      (sum, i) => sum + (i.purchase_price * i.quantity),
      0
    )
    
    const percentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

    return {
      amount: totalGainLoss,
      percentage,
    }
  }

  /**
   * Phân bổ portfolio theo type
   */
  async getPortfolioAllocation(): Promise<Record<string, number>> {
    const { investments } = await this.getInvestments()
    const activeInvestments = investments.filter(i => i.is_active)
    
    const totalValue = activeInvestments.reduce(
      (sum, i) => sum + i.current_value,
      0
    )
    
    const allocation: Record<string, number> = {}
    
    activeInvestments.forEach(inv => {
      if (!allocation[inv.type]) {
        allocation[inv.type] = 0
      }
      allocation[inv.type] += (inv.current_value / totalValue) * 100
    })
    
    return allocation
  }
}

// Export singleton instance
export const investmentsService = new InvestmentsService()
export default investmentsService

