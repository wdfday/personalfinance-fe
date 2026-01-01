/**
 * Accounts Service
 * Quản lý tài khoản ngân hàng, ví điện tử, tiền mặt
 * Note: Broker integration đã được chuyển sang brokers.service.ts
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'investment' | 'crypto_wallet'
export type BrokerType = 'okx' | 'ssi'

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

// Broker Integration Interface
export interface BrokerIntegration {
  broker_type: BrokerType
  broker_name?: string
  is_active: boolean
  auto_sync: boolean
  sync_frequency: number // minutes
  total_syncs: number
  successful_syncs: number
  failed_syncs: number
  sync_assets: boolean
  sync_transactions: boolean
  sync_prices: boolean
  sync_balance: boolean
  // Note: Encrypted fields like api_key, access_token are not exposed to frontend
}

// Reference to broker connection (linked from brokers module)
export interface LinkedBrokerInfo {
  broker_connection_id?: string
  broker_type?: 'okx' | 'ssi' | 'sepay'
  broker_name?: string
}

export interface Account {
  id: string
  userId: string
  accountName: string
  accountType: AccountType
  institutionName?: InstitutionName
  currentBalance: number
  availableBalance?: number
  currency: string
  accountNumberMasked?: string
  isActive: boolean
  isPrimary: boolean
  includeInNetWorth: boolean
  lastSyncedAt?: string
  syncStatus?: 'active' | 'error' | 'disconnected'
  syncErrorMessage?: string
  // Reference to broker connection
  brokerConnectionId?: string
  linkedBroker?: LinkedBrokerInfo
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  accountName: string
  accountType: AccountType
  institutionName?: InstitutionName
  currentBalance: number
  availableBalance?: number
  currency: string
  accountNumberMasked?: string
  isActive?: boolean
  isPrimary?: boolean
  includeInNetWorth?: boolean
}

export interface UpdateAccountRequest {
  accountName?: string
  accountType?: AccountType
  institutionName?: InstitutionName
  currentBalance?: number
  availableBalance?: number
  currency?: string
  accountNumberMasked?: string
  isActive?: boolean
  isPrimary?: boolean
  includeInNetWorth?: boolean
}

// NOTE: CreateAccountWithBrokerRequest đã deprecated
// Sử dụng brokersService.createBroker() thay thế

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
   * Tạo account mới (standard)
   */
  async createAccount(data: CreateAccountRequest): Promise<Account> {
    return baseApiClient.post<Account>('/accounts', data)
  }

  // NOTE: createAccountWithBroker() đã deprecated
  // Sử dụng brokersService.createBroker() thay thế - server tự động sync accounts

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
      .filter(acc => acc.isActive && acc.includeInNetWorth)
      .reduce((sum, acc) => sum + acc.currentBalance, 0)

    return {
      total,
      currency: 'VND', // TODO: Handle multiple currencies
    }
  }

  /**
   * Check if account has linked broker
   */
  hasLinkedBroker(account: Account): boolean {
    return !!account.brokerConnectionId
  }
}

// Export singleton instance
export const accountsService = new AccountsService()
export default accountsService
