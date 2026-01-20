// User Service
import { apiClient } from '../client'
import type { UserProfile, UpdateUserProfileRequest } from '../types/users'

export const usersService = {
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/user/me')
  },

  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/user/me', data)
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await fetch(`${apiClient.getBaseURL()}/user/me/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiClient.getToken()}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }
    
    const json = await response.json()
    return json.data
  },
}

export default usersService
