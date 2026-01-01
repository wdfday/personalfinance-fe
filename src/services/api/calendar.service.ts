/**
 * Calendar Events Service
 * Quản lý lịch cá nhân và ngày lễ
 * Synced with backend API - 2024-12-17
 */

import { baseApiClient } from './base'

// Event types
export type EventType = 'personal' | 'holiday' | 'birthday' | 'anniversary' | 'meeting' | 'reminder' | 'other'
export type EventSource = 'user_created' | 'system_generated'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CalendarEvent {
  id: string
  user_id: string
  name: string
  description?: string
  type: EventType
  source: EventSource
  start_date: string // ISO 8601 format
  end_date?: string
  all_day: boolean
  color?: string // Hex color like #FF5733
  tags?: string // JSON array string
  is_recurring: boolean
  recurrence_type?: RecurrenceType
  is_multi_day: boolean
  duration_days: number
  created_at: string
  updated_at: string
}

export interface CreateEventRequest {
  name: string
  description?: string
  type?: EventType
  start_date: string // ISO 8601: "2025-03-15" or "2025-03-15T14:30:00Z"
  end_date?: string
  all_day?: boolean
  color?: string // Hex color: #FF5733
  tags?: string // JSON array: '["family", "important"]'
}

export interface UpdateEventRequest {
  name?: string
  description?: string
  type?: EventType
  start_date?: string
  end_date?: string
  all_day?: boolean
  color?: string
  tags?: string
}

export interface GenerateHolidaysRequest {
  year?: number // Optional, defaults to current year
}

export interface CalendarEventsResponse {
  events: CalendarEvent[]
  count: number
  from: string
  to: string
}

export interface CalendarQueryParams {
  from: string // Required: YYYY-MM-DD
  to: string   // Required: YYYY-MM-DD
}

export interface UpcomingEventsParams {
  from?: string // Optional: YYYY-MM-DD
  to?: string   // Optional: YYYY-MM-DD
}

class CalendarService {
  /**
   * Tạo event mới
   */
  async createEvent(data: CreateEventRequest): Promise<CalendarEvent> {
    return baseApiClient.post<CalendarEvent>('/calendar/events', data)
  }

  /**
   * Lấy thông tin một event
   */
  async getEvent(id: string): Promise<CalendarEvent> {
    return baseApiClient.get<CalendarEvent>(`/calendar/events/${id}`)
  }

  /**
   * Cập nhật event
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<CalendarEvent> {
    return baseApiClient.put<CalendarEvent>(`/calendar/events/${id}`, data)
  }

  /**
   * Xóa event (soft delete)
   */
  async deleteEvent(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/calendar/events/${id}`)
  }

  /**
   * Lấy events theo khoảng thời gian (Main calendar view)
   * @param params - from và to (YYYY-MM-DD format)
   */
  async getEventsByDateRange(params: CalendarQueryParams): Promise<CalendarEventsResponse> {
    return baseApiClient.get<CalendarEventsResponse>('/calendar/events', params)
  }

  /**
   * Lấy events sắp tới (Legacy endpoint)
   */
  async getUpcomingEvents(params?: UpcomingEventsParams): Promise<{ events: CalendarEvent[] }> {
    return baseApiClient.get<{ events: CalendarEvent[] }>('/calendar/events/upcoming', params)
  }

  /**
   * Generate Vietnam holidays cho một năm
   */
  async generateHolidays(data?: GenerateHolidaysRequest): Promise<{ year: number }> {
    return baseApiClient.post<{ year: number }>('/calendar/events/holidays/generate', data || {})
  }

  /**
   * Lấy events cho một tháng cụ thể
   * Helper method để dễ sử dụng
   */
  async getMonthEvents(year: number, month: number): Promise<CalendarEventsResponse> {
    const from = `${year}-${month.toString().padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`
    
    return this.getEventsByDateRange({ from, to })
  }

  /**
   * Lấy events cho một tuần cụ thể
   */
  async getWeekEvents(startDate: Date): Promise<CalendarEventsResponse> {
    const from = startDate.toISOString().split('T')[0]
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    const to = endDate.toISOString().split('T')[0]
    
    return this.getEventsByDateRange({ from, to })
  }

  /**
   * Tạo birthday event
   */
  async createBirthday(name: string, date: string, color?: string): Promise<CalendarEvent> {
    return this.createEvent({
      name: `${name}'s Birthday`,
      type: 'birthday',
      start_date: date,
      all_day: true,
      color: color || '#FF69B4',
      tags: '["birthday", "important"]',
    })
  }

  /**
   * Tạo meeting event
   */
  async createMeeting(
    name: string,
    startDateTime: string,
    endDateTime: string,
    description?: string
  ): Promise<CalendarEvent> {
    return this.createEvent({
      name,
      description,
      type: 'meeting',
      start_date: startDateTime,
      end_date: endDateTime,
      all_day: false,
      color: '#4285F4',
    })
  }

  /**
   * Tạo reminder event
   */
  async createReminder(name: string, date: string, description?: string): Promise<CalendarEvent> {
    return this.createEvent({
      name,
      description,
      type: 'reminder',
      start_date: date,
      all_day: true,
      color: '#FBBC04',
    })
  }

  /**
   * Filter events by type
   */
  filterEventsByType(events: CalendarEvent[], type: EventType): CalendarEvent[] {
    return events.filter(event => event.type === type)
  }

  /**
   * Filter events by source
   */
  filterEventsBySource(events: CalendarEvent[], source: EventSource): CalendarEvent[] {
    return events.filter(event => event.source === source)
  }

  /**
   * Get user-created events only
   */
  getUserEvents(events: CalendarEvent[]): CalendarEvent[] {
    return this.filterEventsBySource(events, 'user_created')
  }

  /**
   * Get system holidays only
   */
  getHolidays(events: CalendarEvent[]): CalendarEvent[] {
    return events.filter(event => event.type === 'holiday' && event.source === 'system_generated')
  }

  /**
   * Group events by date
   */
  groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    events.forEach(event => {
      const date = event.start_date.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(event)
    })
    
    return grouped
  }

  /**
   * Check if event is today
   */
  isToday(event: CalendarEvent): boolean {
    const today = new Date().toISOString().split('T')[0]
    const eventDate = event.start_date.split('T')[0]
    return eventDate === today
  }

  /**
   * Check if event is upcoming (within next 7 days)
   */
  isUpcoming(event: CalendarEvent): boolean {
    const today = new Date()
    const eventDate = new Date(event.start_date)
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }
}

// Export singleton instance
export const calendarService = new CalendarService()
export default calendarService
