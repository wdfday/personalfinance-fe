// Auth Types - matches server/internal/module/identify/auth/dto

export interface User {
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

// Alias for slice usage
export type UserAuthInfo = User

export interface TokenInfo {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

export interface AuthResponse {
  user: User
  token: TokenInfo
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}
