// Notification Service
import { apiClient } from '../client'
import type { 
  NotificationListResponse, 
  NotificationStats, 
  NotificationPreference,
  AlertRule 
} from '../types/notifications'

export const notificationsService = {
  async getAll(page = 1, limit = 20): Promise<NotificationListResponse> {
    return apiClient.get<NotificationListResponse>(`/notifications?page=${page}&limit=${limit}`)
  },

  async getStats(): Promise<NotificationStats> {
    return apiClient.get<NotificationStats>('/notifications/stats')
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.put(`/notifications/${id}/read`, {})
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.put('/notifications/read-all', {})
  },
  
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/notifications/${id}`)
  },
  
  // Preferences
  async getPreferences(): Promise<NotificationPreference[]> {
    return apiClient.get<NotificationPreference[]>('/notifications/preferences')
  },
  
  async updatePreference(type: string, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return apiClient.put<NotificationPreference>(`/notifications/preferences/${type}`, data)
  },
  
  // Alert Rules
  async getAlertRules(): Promise<AlertRule[]> {
    return apiClient.get<AlertRule[]>('/notifications/alerts')
  },
  
  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    return apiClient.post<AlertRule>('/notifications/alerts', data)
  },
  
  async updateAlertRule(id: string, data: Partial<AlertRule>): Promise<AlertRule> {
    return apiClient.put<AlertRule>(`/notifications/alerts/${id}`, data)
  },
  
  async deleteAlertRule(id: string): Promise<void> {
    return apiClient.delete(`/notifications/alerts/${id}`)
  }
}

export default notificationsService
