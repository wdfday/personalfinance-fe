/**
 * Brokers Service
 * Quản lý kết nối với các broker bên ngoài (OKX, SSI, SePay)
 * Backend tự động sync accounts và transactions khi thêm API key
 * 
 * API Endpoints:
 * - POST /broker-connections/ssi   - Create SSI connection
 * - POST /broker-connections/okx   - Create OKX connection
 * - POST /broker-connections/sepay - Create SePay connection
 * - GET  /broker-connections       - List all connections
 * - GET  /broker-connections/:id   - Get connection detail
 */

import { baseApiClient } from './base'

// Broker Types
export type BrokerType = 'okx' | 'ssi' | 'sepay'
export type BrokerConnectionStatus = 'active' | 'disconnected' | 'error' | 'pending'

// Broker Connection Entity (matches BE BrokerConnectionResponse)
export interface BrokerConnection {
    id: string
    user_id: string
    broker_type: BrokerType
    broker_name: string
    status: BrokerConnectionStatus

    // Token info
    token_expires_at?: string
    last_refreshed_at?: string
    is_token_valid: boolean

    // Sync settings
    auto_sync: boolean
    sync_frequency: number // minutes
    sync_assets: boolean
    sync_transactions: boolean
    sync_prices: boolean
    sync_balance: boolean

    // Sync status
    last_sync_at?: string
    last_sync_status?: string // 'success' | 'failed'
    last_sync_error?: string

    // Sync statistics
    total_syncs: number
    successful_syncs: number
    failed_syncs: number

    // External account info
    external_account_id?: string
    external_account_number?: string
    external_account_name?: string

    // Metadata
    notes?: string
    created_at: string
    updated_at: string
}

// ============================================================================
// Request DTOs - Separate for each broker type
// ============================================================================

// Base fields for all broker connections
interface BaseBrokerRequest {
    broker_name: string
    auto_sync?: boolean
    sync_frequency?: number
    sync_assets?: boolean
    sync_transactions?: boolean
    sync_prices?: boolean
    sync_balance?: boolean
    notes?: string
}

// SSI Request DTO
export interface CreateSSIConnectionRequest extends BaseBrokerRequest {
    consumer_id: string
    consumer_secret: string
    otp_code?: string
    otp_method?: 'PIN' | 'SMS' | 'EMAIL' | 'SMART'
}

// OKX Request DTO
export interface CreateOKXConnectionRequest extends BaseBrokerRequest {
    api_key: string
    api_secret: string
    passphrase: string
}

// SePay Request DTO - Only needs API key
export interface CreateSepayConnectionRequest extends BaseBrokerRequest {
    api_key: string
}

// Update Request (unified)
export interface UpdateBrokerConnectionRequest {
    broker_name?: string
    api_key?: string
    api_secret?: string
    passphrase?: string
    consumer_id?: string
    consumer_secret?: string
    otp_method?: string
    auto_sync?: boolean
    sync_frequency?: number
    sync_assets?: boolean
    sync_transactions?: boolean
    sync_prices?: boolean
    sync_balance?: boolean
    notes?: string
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface BrokerListResponse {
    connections: BrokerConnection[]  // Changed from 'items' to match BE
    total: number
}

// Broker Provider info (matches BE BrokerProviderInfo)
export interface BrokerProvider {
    broker_type: BrokerType
    display_name: string
    description: string
    required_fields: string[]
    supported_features: string[]
    logo?: string
}

export interface BrokerProviderListResponse {
    providers: BrokerProvider[]
}

export interface SyncResult {
    success: boolean
    synced_at: string
    assets_count: number
    transactions_count: number
    updated_prices_count: number
    balance_updated: boolean
    error?: string
    details?: Record<string, any>
}

// ============================================================================
// Service Class
// ============================================================================

class BrokersService {
    /**
     * Lấy danh sách các broker providers hỗ trợ
     */
    async getProviders(): Promise<BrokerProviderListResponse> {
        return baseApiClient.get<BrokerProviderListResponse>('/broker-connections/providers')
    }

    /**
     * Lấy danh sách tất cả broker connections của user
     */
    async getBrokers(): Promise<BrokerListResponse> {
        const response = await baseApiClient.get<BrokerListResponse>('/broker-connections')
        // Ensure connections is always an array
        return {
            connections: response.connections || [],
            total: response.total || 0,
        }
    }

    /**
     * Lấy thông tin chi tiết một broker connection
     */
    async getBroker(id: string): Promise<BrokerConnection> {
        return baseApiClient.get<BrokerConnection>(`/broker-connections/${id}`)
    }

    /**
     * Tạo SSI broker connection
     */
    async createSSI(data: CreateSSIConnectionRequest): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>('/broker-connections/ssi', data)
    }

    /**
     * Tạo OKX broker connection
     */
    async createOKX(data: CreateOKXConnectionRequest): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>('/broker-connections/okx', data)
    }

    /**
     * Tạo SePay broker connection
     */
    async createSepay(data: CreateSepayConnectionRequest): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>('/broker-connections/sepay', data)
    }

    /**
     * Cập nhật broker connection
     */
    async updateBroker(id: string, data: UpdateBrokerConnectionRequest): Promise<BrokerConnection> {
        return baseApiClient.put<BrokerConnection>(`/broker-connections/${id}`, data)
    }

    /**
     * Xóa broker connection
     */
    async deleteBroker(id: string): Promise<void> {
        await baseApiClient.delete<void>(`/broker-connections/${id}`)
    }

    /**
     * Kích hoạt sync ngay lập tức
     */
    async syncNow(id: string): Promise<SyncResult> {
        return baseApiClient.post<SyncResult>(`/broker-connections/${id}/sync`, {})
    }

    /**
     * Test connection với broker
     */
    async testConnection(id: string): Promise<{ success: boolean; message?: string }> {
        return baseApiClient.post<{ success: boolean; message?: string }>(`/broker-connections/${id}/test`, {})
    }

    /**
     * Refresh access token
     */
    async refreshToken(id: string): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>(`/broker-connections/${id}/refresh-token`, {})
    }

    /**
     * Activate a disconnected/error broker
     */
    async activate(id: string): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>(`/broker-connections/${id}/activate`, {})
    }

    /**
     * Deactivate a broker
     */
    async deactivate(id: string): Promise<BrokerConnection> {
        return baseApiClient.post<BrokerConnection>(`/broker-connections/${id}/deactivate`, {})
    }

    // ============================================================================
    // Helper methods
    // ============================================================================

    isHealthy(broker: BrokerConnection): boolean {
        return broker.status === 'active' && broker.is_token_valid
    }

    needsSync(broker: BrokerConnection): boolean {
        if (!broker.auto_sync) return false
        if (!broker.last_sync_at) return true

        const lastSynced = new Date(broker.last_sync_at)
        const syncFrequencyMs = broker.sync_frequency * 60 * 1000
        return new Date() > new Date(lastSynced.getTime() + syncFrequencyMs)
    }

    getBrokerTypeLabel(type: BrokerType): string {
        const labels: Record<BrokerType, string> = {
            okx: 'OKX Exchange',
            ssi: 'SSI Securities',
            sepay: 'SePay',
        }
        return labels[type] || type.toUpperCase()
    }

    getStatusColor(status: BrokerConnectionStatus): string {
        const colors: Record<BrokerConnectionStatus, string> = {
            active: 'green',
            pending: 'yellow',
            error: 'red',
            disconnected: 'gray',
        }
        return colors[status] || 'gray'
    }
}

// Export singleton instance
export const brokersService = new BrokersService()
export default brokersService
