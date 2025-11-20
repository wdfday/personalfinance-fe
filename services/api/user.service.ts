/**
 * User Service
 * Xử lý các thao tác liên quan đến user profile và settings
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export interface User {
  id: string
  email: string
  full_name: string
  display_name?: string
  phone_number?: string
  date_of_birth?: string
  avatar_url?: string
  role: string
  status: string
  email_verified: boolean
  email_verified_at?: string
  last_login_at?: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface UpdateUserProfileRequest {
  full_name?: string
  display_name?: string
  phone_number?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

class UserService {
  /**
   * Lấy thông tin user hiện tại
   * GET /api/v1/user/me
   */
  async getCurrentUser(): Promise<User> {
    return baseApiClient.get<User>('/user/me')
  }

  /**
   * Cập nhật profile user
   * PUT /api/v1/user/me
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<User> {
    return baseApiClient.put<User>('/user/me', data)
  }

  /**
   * Đổi mật khẩu (qua auth service)
   * POST /api/v1/auth/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await baseApiClient.post<void>('/auth/change-password', data)
  }

  /**
   * Upload avatar (TODO: implement khi backend có API)
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    // TODO: Implement khi backend có endpoint
    throw new Error('Avatar upload not implemented yet')
  }
}

// Export singleton instance
export const userService = new UserService()
export default userService
