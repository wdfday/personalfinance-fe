// Month Planning Service
import { apiClient } from '../client'
import type { 
  Month,
  MonthViewResponse,
  PreviewDSSRequest,
  DSSPreviewResponse,
  SaveDSSRequest,
  DSSExecutionResponse
} from '../types/month'

export const monthService = {
  // Get month view by month string (e.g., "2024-01")
  async getMonthView(monthStr: string): Promise<MonthViewResponse> {
    return apiClient.get<MonthViewResponse>(`/months/${monthStr}`)
  },

  // Get month view, auto-create if not found (404)
  async getMonthViewOrCreate(monthStr: string): Promise<MonthViewResponse> {
    try {
      return await this.getMonthView(monthStr)
    } catch (e: any) {
      // Auto-create month if not found (404)
      const status = e?.status || e?.response?.status
      if (status === 404) {
        await this.createMonth(monthStr)
        return await this.getMonthView(monthStr)
      }
      throw e
    }
  },

  // Get full month entity by ID
  async getMonthById(id: string): Promise<Month> {
    return apiClient.get<Month>(`/months/${id}`)
  },

  // Get previous month for rollover calculations
  async getPreviousMonth(monthStr: string): Promise<Month | null> {
    try {
      return await apiClient.get<Month>(`/months/${monthStr}/previous`)
    } catch (error) {
      // Return null if no previous month exists
      return null
    }
  },

  // Create new month (lazy state creation - no initial state)
  async createMonth(monthStr: string): Promise<Month> {
    return apiClient.post<Month>('/months', { month: monthStr })
  },

  // DSS Preview - run analytics without persisting
  async previewDSS(request: PreviewDSSRequest): Promise<DSSPreviewResponse> {
    const { month_id, ...body } = request
    return apiClient.post<DSSPreviewResponse>(`/months/${month_id}/dss/preview`, body)
  },

  // Save DSS results - create first state or append new version
  async saveDSS(request: SaveDSSRequest): Promise<DSSExecutionResponse> {
    const { month_id, ...body } = request
    return apiClient.post<DSSExecutionResponse>(`/months/${month_id}/dss/save`, body)
  },

  // Close month (read-only after closed)
  async closeMonth(monthId: string): Promise<void> {
    return apiClient.post(`/months/${monthId}/close`)
  }
}

export default monthService

