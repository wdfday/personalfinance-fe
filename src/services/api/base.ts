/**
 * Base API Client sử dụng Axios
 * Xử lý authentication, error handling và unwrap backend responses
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { defaultApiConfig, STORAGE_KEYS } from './config'

// Types
export interface ApiError {
  error: string
  details?: any
  status: number
}

export interface ApiResponse<T> {
  status: number
  message: string
  detail?: string
  data?: T
}

/**
 * Base API Client class
 */
class BaseApiClient {
  private axiosInstance: AxiosInstance
  private token: string | null = null

  constructor() {
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: defaultApiConfig.baseURL,
      timeout: defaultApiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }

    // Setup interceptors
    this.setupInterceptors()
  }

  /**
   * Setup axios interceptors
   */
  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Unwrap data and handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Backend wraps responses in { status, message, data } format
        // Unwrap the data field if it exists
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return response.data.data
        }
        
        // Return as is if not wrapped (for backward compatibility)
        return response.data
      },
      (error: AxiosError) => {
        // Handle axios errors
        if (error.response) {
          // Server responded with error status
          const status = error.response.status
          const data = error.response.data as any

          const apiError: ApiError = {
            error: data?.error || data?.message || `HTTP ${status}`,
            details: data?.details || data?.detail,
            status,
          }

          // Handle 401 - clear token and redirect to login
          if (status === 401) {
            this.setToken(null)
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }

          return Promise.reject(apiError)
        } else if (error.request) {
          // Request was made but no response received
          const apiError: ApiError = {
            error: 'No response from server',
            status: 0,
          }
          return Promise.reject(apiError)
        } else {
          // Something happened in setting up the request
          const apiError: ApiError = {
            error: error.message || 'Network error',
            status: 0,
          }
          return Promise.reject(apiError)
        }
      }
    )
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      }
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get<T>(endpoint, { params }).then(res => res as unknown as T)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.post<T>(endpoint, data).then(res => res as unknown as T)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.put<T>(endpoint, data).then(res => res as unknown as T)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.patch<T>(endpoint, data).then(res => res as unknown as T)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.axiosInstance.delete<T>(endpoint).then(res => res as unknown as T)
  }
}

// Export singleton instance
export const baseApiClient = new BaseApiClient()
export default baseApiClient
