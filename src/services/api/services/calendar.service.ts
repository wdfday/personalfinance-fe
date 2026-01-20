// Calendar Service
import { apiClient } from '../client'
import type { CalendarEvent, CreateEventRequest, UpdateEventRequest, EventListResponse } from '../types/calendar'

export const calendarService = {
  async getEvents(from: string, to: string): Promise<EventListResponse> {
    const params = new URLSearchParams({ from, to })
    return apiClient.get<EventListResponse>(`/calendar/events?${params.toString()}`)
  },

  async getEvent(id: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`/calendar/events/${id}`)
  },

  async createEvent(event: CreateEventRequest): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>('/calendar/events', event)
  },

  async updateEvent(id: string, event: UpdateEventRequest): Promise<CalendarEvent> {
    return apiClient.put<CalendarEvent>(`/calendar/events/${id}`, event)
  },

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/calendar/events/${id}`)
  }
}

export default calendarService
