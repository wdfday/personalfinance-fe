/**
 * Accounts Service
 * Quản lý tài khoản ngân hàng, ví điện tử, tiền mặt
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'investment' | 'crypto_wallet'

// Institution enums by category
export type DebitCreditInstitution = 
  | 'VCB' // Vietcombank
  | 'TCB' // Techcombank
  | 'ACB' // Asia Commercial Bank
  | 'VPB' // VPBank
  | 'TPB' // TPBank
  | 'MBB' // Military Bank
  | 'BID' // BIDV
  | 'CTG' // VietinBank
  | 'HDB' // HDBank
  | 'VIB' // VIB
  | 'MSB' // Maritime Bank
  | 'EIB' // Eximbank
  | 'OCB' // OCB
  | 'SHB' // SHB
  | 'MOOMO' // MoMo
  | 'VNPAY' // VNPay
  | 'ZALOPAY' // ZaloPay
  | 'VIETTELPAY' // ViettelPay
  | 'OTHER'

export type InvestmentInstitution =
  | 'SSI' // SSI Securities
  | 'CONSUMERID' // ConsumerID integration
  | 'VNDIRECT' // VNDirect
  | 'VCBS' // VCBS Securities
  | 'HSC' // HSC Securities
  | 'FPTS' // FPTS Securities
  | 'SSI_IB' // SSI Investment Banking
  | 'OTHER'

export type CryptoInstitution =
  | 'OKX' // OKX Exchange
  | 'BINANCE' // Binance
  | 'COINBASE' // Coinbase
  | 'BYBIT' // Bybit
  | 'GATEIO' // Gate.io
  | 'KUCOIN' // KuCoin
  | 'HUOBI' // Huobi
  | 'OTHER'

export type InstitutionName = DebitCreditInstitution | InvestmentInstitution | CryptoInstitution

export interface Account {
  id: string
  user_id: string
  account_name: string
  account_type: AccountType
  institution_name?: InstitutionName
  current_balance: number
  available_balance?: number
  currency: string
  account_number_masked?: string
  is_active: boolean
  is_primary: boolean
  include_in_net_worth: boolean
  last_synced_at?: string
  sync_status?: string
  sync_error_message?: string
  // API credentials for third-party integrations
  api_key?: string
  api_secret?: string
  consumer_id?: string
  consumer_key?: string
  created_at: string
  updated_at: string
}

export interface CreateAccountRequest {
  account_name: string
  account_type: AccountType
  institution_name?: InstitutionName
  current_balance: number
  available_balance?: number
  currency: string
  account_number_masked?: string
  is_active?: boolean
  is_primary?: boolean
  include_in_net_worth?: boolean
  // API credentials for third-party integrations
  // For Investment (SSI, ConsumerID): use consumer_id and consumer_key
  // For Crypto (OKX, Binance, etc): use api_key and api_secret
  api_key?: string
  api_secret?: string
  consumer_id?: string
  consumer_key?: string
}

export interface UpdateAccountRequest {
  account_name?: string
  account_type?: AccountType
  institution_name?: InstitutionName
  current_balance?: number
  available_balance?: number
  currency?: string
  account_number_masked?: string
  is_active?: boolean
  is_primary?: boolean
  include_in_net_worth?: boolean
  // API credentials for third-party integrations
  // For Investment (SSI, ConsumerID): use consumer_id and consumer_key
  // For Crypto (OKX, Binance, etc): use api_key and api_secret
  api_key?: string
  api_secret?: string
  consumer_id?: string
  consumer_key?: string
}

export interface AccountListResponse {
  items: Account[]
  total: number
}

class AccountsService {
  /**
   * Lấy danh sách tất cả accounts
   */
  async getAccounts(): Promise<AccountListResponse> {
    return baseApiClient.get<AccountListResponse>('/accounts')
  }

  /**
   * Lấy thông tin một account
   */
  async getAccount(id: string): Promise<Account> {
    return baseApiClient.get<Account>(`/accounts/${id}`)
  }

  /**
   * Tạo account mới
   */
  async createAccount(data: CreateAccountRequest): Promise<Account> {
    return baseApiClient.post<Account>('/accounts', data)
  }

  /**
   * Cập nhật account
   */
  async updateAccount(id: string, data: UpdateAccountRequest): Promise<Account> {
    return baseApiClient.put<Account>(`/accounts/${id}`, data)
  }

  /**
   * Xóa account
   */
  async deleteAccount(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/accounts/${id}`)
  }

  /**
   * Lấy tổng số dư tất cả accounts
   */
  async getTotalBalance(): Promise<{ total: number; currency: string }> {
    const response = await this.getAccounts()
    const total = response.items
      .filter(acc => acc.is_active && acc.include_in_net_worth)
      .reduce((sum, acc) => sum + acc.current_balance, 0)
    
    return {
      total,
      currency: 'VND', // TODO: Handle multiple currencies
    }
  }
}

// Export singleton instance
export const accountsService = new AccountsService()
export default accountsService
