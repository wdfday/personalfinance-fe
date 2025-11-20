/**
 * Profile Service
 * Quản lý thông tin profile mở rộng của user (tài chính, preferences, settings)
 */

import { baseApiClient } from './base'

// Types matching backend DTOs
export interface UserProfile {
  user_id: string
  
  // Personal & Employment
  occupation?: string
  industry?: string
  employer?: string
  dependents_count?: number
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
  
  // Financial Status
  monthly_income_avg?: number
  emergency_fund_months?: number
  debt_to_income_ratio?: number
  credit_score?: number
  income_stability?: 'stable' | 'variable' | 'freelance'
  
  // Investment Profile
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  investment_horizon: 'short' | 'medium' | 'long'
  investment_experience: 'beginner' | 'intermediate' | 'expert'
  
  // Budget & Notifications
  budget_method: 'custom' | 'zero_based' | 'envelope' | '50_30_20'
  notification_channels: string[]
  alert_threshold_budget?: number
  report_frequency?: 'weekly' | 'monthly' | 'quarterly'
  
  // Currency & Preferences
  currency_primary: string
  currency_secondary: string
  preferred_report_day_of_month?: number
  
  // Onboarding & Goals
  onboarding_completed: boolean
  onboarding_completed_at?: string
  primary_goal?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  // Personal & Employment
  occupation?: string
  industry?: string
  employer?: string
  dependents_count?: number
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
  
  // Financial Status
  monthly_income_avg?: number
  emergency_fund_months?: number
  debt_to_income_ratio?: number
  credit_score?: number
  income_stability?: 'stable' | 'variable' | 'freelance'
  
  // Investment Profile
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
  investment_horizon?: 'short' | 'medium' | 'long'
  investment_experience?: 'beginner' | 'intermediate' | 'expert'
  
  // Budget & Notifications
  budget_method?: 'custom' | 'zero_based' | 'envelope' | '50_30_20'
  notification_channels?: string[]
  alert_threshold_budget?: number
  report_frequency?: 'weekly' | 'monthly' | 'quarterly'
  
  // Currency & Preferences
  currency_primary?: string
  currency_secondary?: string
  preferred_report_day_of_month?: number
  
  // Onboarding & Goals
  onboarding_completed?: boolean
  onboarding_completed_at?: string
  primary_goal?: string
}

export interface CreateProfileRequest extends UpdateProfileRequest {
  // Tất cả fields đều optional vì kế thừa từ UpdateProfileRequest
}

class ProfileService {
  /**
   * Lấy profile của user hiện tại
   * GET /api/v1/profile/me
   */
  async getProfile(): Promise<UserProfile> {
    return baseApiClient.get<UserProfile>('/profile/me')
  }

  /**
   * Cập nhật profile
   * PUT /api/v1/profile/me
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return baseApiClient.put<UserProfile>('/profile/me', data)
  }

  /**
   * Kiểm tra xem user đã hoàn thành onboarding chưa
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const profile = await this.getProfile()
      return profile.onboarding_completed
    } catch (error) {
      return false
    }
  }

  /**
   * Đánh dấu onboarding đã hoàn thành
   */
  async completeOnboarding(): Promise<UserProfile> {
    return this.updateProfile({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
  }
}

// Export singleton instance
export const profileService = new ProfileService()
export default profileService
