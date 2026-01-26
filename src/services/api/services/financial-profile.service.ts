// Financial Profile Service - for /api/v1/profile/me endpoint
import { apiClient } from '../client'
import type { Profile, UpdateProfileRequest } from '../types/profile'

export const financialProfileService = {
  async getProfile(): Promise<Profile> {
    return apiClient.get<Profile>('/profile/me')
  },

  async updateProfile(data: UpdateProfileRequest): Promise<Profile> {
    return apiClient.put<Profile>('/profile/me', data)
  },
}

export default financialProfileService
