// Notification Types
export interface Notification {
  id: string
  type: string
  subject?: string
  data?: Record<string, any>
  status: 'pending' | 'read' | 'sent' | 'failed'
  sent_at?: string
  failed_at?: string
  error_message?: string
  created_at: string
}

export interface NotificationListResponse {
  items: Notification[]
  total: number
  unread: number
  page: number
  per_page: number
  total_pages: number
}

export interface NotificationStats {
  total_notifications: number
  unread_count: number
  read_count: number
}

export interface NotificationPreference {
  id: string
  type: string
  enabled: boolean
  preferred_channels: string[]
  min_interval_minutes: number
  quiet_hours_from?: number
  quiet_hours_to?: number
  timezone: string
  created_at: string
  updated_at: string
}

export interface AlertRule {
  id: string
  name: string
  type: string
  enabled: boolean
  description: string
  conditions: Record<string, any>
  channels?: string[]
  schedule?: string
  last_triggered_at?: string
  next_trigger_at?: string
  created_at: string
  updated_at: string
}
