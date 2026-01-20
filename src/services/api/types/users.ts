// User Types - matches server/internal/module/identify/user/dto

export interface UserProfile {
  id: string
  email: string
  full_name: string
  display_name?: string
  phone_number?: string
  date_of_birth?: string
  avatar_url?: string
  role: string
  status: UserStatus
  email_verified: boolean
  email_verified_at?: string
  onboarding_completed: boolean
  mfa_enabled: boolean
  last_login_at?: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface UpdateUserProfileRequest {
  full_name?: string
  display_name?: string
  phone_number?: string
  date_of_birth?: string
  avatar_url?: string
}
