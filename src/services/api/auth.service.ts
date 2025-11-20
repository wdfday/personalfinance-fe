/**
 * Authentication Service
 * Xử lý đăng nhập, đăng ký và quản lý profile
 */

import { baseApiClient } from './base'

// Types
export interface UserAuthInfo {
  id: string
  email: string
  full_name: string
  display_name?: string
  avatar_url?: string
  role: string
  status: string
  email_verified: boolean
  mfa_enabled: boolean
  created_at: string
  last_login_at?: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenInfo {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

export interface AuthResponse {
  user: UserAuthInfo
  token: TokenInfo
}

export interface GoogleAuthRequest {
  token: string
}

class AuthService {
  /**
   * Đăng ký user mới
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await baseApiClient.post<AuthResponse>('/auth/register', data)
    // Lưu token vào localStorage
    if (response.token?.access_token) {
      baseApiClient.setToken(response.token.access_token)
    }
    return response
  }

  /**
   * Đăng nhập
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await baseApiClient.post<AuthResponse>('/auth/login', data)
    // Lưu token vào localStorage
    if (response.token?.access_token) {
      baseApiClient.setToken(response.token.access_token)
    }
    return response
  }

  /**
   * Đăng nhập với Google
   */
  async loginWithGoogle(data: GoogleAuthRequest): Promise<AuthResponse> {
    const response = await baseApiClient.post<AuthResponse>('/auth/google', data)
    // Lưu token vào localStorage
    if (response.token?.access_token) {
      baseApiClient.setToken(response.token.access_token)
    }
    return response
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    baseApiClient.setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * @deprecated Sử dụng userService.getCurrentUser() thay thế
   */
  async getCurrentUser(): Promise<any> {
    return baseApiClient.get<any>('/user/me')
  }

  /**
   * Cập nhật profile
   * @deprecated Sử dụng userService.updateProfile() thay thế
   */
  async updateProfile(data: any): Promise<any> {
    return baseApiClient.put<any>('/user/me', data)
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await baseApiClient.post<void>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!baseApiClient.getToken()
  }

  /**
   * Lấy token hiện tại
   */
  getToken(): string | null {
    return baseApiClient.getToken()
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService

