// Income Profile Service
import { apiClient } from '../client'
import type {
  IncomeProfile,
  CreateIncomeProfileRequest,
  UpdateIncomeProfileRequest,
  IncomeProfileListResponse,
} from '../types/income-profiles'

export interface IncomeProfileFilters {
  status?: string
  is_recurring?: boolean
}

export const incomeProfilesService = {
  async getAll(filters?: IncomeProfileFilters): Promise<IncomeProfileListResponse> {
    const queryString = filters ? apiClient.buildQueryString(filters) : ''
    return apiClient.get<IncomeProfileListResponse>(`/income-profiles${queryString}`)
  },

  async getById(id: string): Promise<IncomeProfile> {
    return apiClient.get<IncomeProfile>(`/income-profiles/${id}`)
  },

  async create(data: CreateIncomeProfileRequest): Promise<IncomeProfile> {
    return apiClient.post<IncomeProfile>('/income-profiles', data)
  },

  async update(id: string, data: UpdateIncomeProfileRequest): Promise<IncomeProfile> {
    return apiClient.put<IncomeProfile>(`/income-profiles/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/income-profiles/${id}`)
  },

  async verify(id: string, verified: boolean): Promise<IncomeProfile> {
    return apiClient.post<IncomeProfile>(`/income-profiles/${id}/verify`, { verified })
  },
}

export default incomeProfilesService
