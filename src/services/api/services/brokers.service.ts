// Broker Service
import { apiClient } from '../client'
import type {
  BrokerConnection,
  CreateSSIBrokerRequest,
  CreateOKXBrokerRequest,
  CreateSepayBrokerRequest,
  UpdateBrokerRequest,
  BrokerProviderInfo,
  SyncResult,
} from '../types/brokers'

export const brokersService = {
  async getAll(): Promise<{ connections: BrokerConnection[]; total: number }> {
    return apiClient.get('/broker-connections')
  },

  async getById(id: string): Promise<BrokerConnection> {
    return apiClient.get<BrokerConnection>(`/broker-connections/${id}`)
  },

  async createSSI(data: CreateSSIBrokerRequest): Promise<BrokerConnection> {
    return apiClient.post<BrokerConnection>('/broker-connections/ssi', data)
  },

  async createOKX(data: CreateOKXBrokerRequest): Promise<BrokerConnection> {
    return apiClient.post<BrokerConnection>('/broker-connections/okx', data)
  },

  async createSepay(data: CreateSepayBrokerRequest): Promise<BrokerConnection> {
    return apiClient.post<BrokerConnection>('/broker-connections/sepay', data)
  },

  async update(id: string, data: UpdateBrokerRequest): Promise<BrokerConnection> {
    return apiClient.put<BrokerConnection>(`/broker-connections/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/broker-connections/${id}`)
  },

  async sync(id: string): Promise<SyncResult> {
    return apiClient.post<SyncResult>(`/broker-connections/${id}/sync`)
  },

  async getProviders(): Promise<{ providers: BrokerProviderInfo[] }> {
    return apiClient.get('/broker-connections/providers')
  },

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(`/broker-connections/${id}/test`)
  },

  async activate(id: string): Promise<BrokerConnection> {
    return apiClient.post<BrokerConnection>(`/broker-connections/${id}/activate`)
  },

  async deactivate(id: string): Promise<BrokerConnection> {
    return apiClient.post<BrokerConnection>(`/broker-connections/${id}/deactivate`)
  },
}

export default brokersService
