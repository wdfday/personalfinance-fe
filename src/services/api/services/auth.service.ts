// Auth Service
import { apiClient } from '../client'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    apiClient.setToken(response.token.access_token)
    return response
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData)
    apiClient.setToken(response.token.access_token)
    return response
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      apiClient.setToken(null)
    }
  },

  async refreshToken(): Promise<{ access_token: string; expires_in: number }> {
    return apiClient.post('/auth/refresh')
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/users/me')
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  getToken(): string | null {
    return apiClient.getToken()
  },
}

export default authService
