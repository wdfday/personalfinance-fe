// Calendar/Event Types
export interface CalendarEvent {
  id: string
  name: string
  description?: string
  type: string
  source: string
  start_date: string
  end_date?: string
  all_day: boolean
  color?: string
  tags?: string[]
  is_recurring: boolean
  is_multi_day: boolean
  duration_days: number
  created_at: string
  updated_at: string
}

export interface CreateEventRequest {
  name: string
  description?: string
  type: string
  source: string
  start_date: string
  end_date?: string
  all_day: boolean
  color?: string
  tags?: string[]
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface EventListResponse {
  events: CalendarEvent[]
  count: number
  from?: string
  to?: string
}
