// Base API Client
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies if used for refresh token
    })

    this.token = typeof globalThis.window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    }

    // Response interceptor for unwrapping
    this.client.interceptors.response.use(
      (response) => {
        const data = response.data
        // API returns { status, message, data } wrapper
        return data.data !== undefined ? data.data : data
      },
      async (error: AxiosError<any>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If already refreshing, add to queue
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`
                resolve(this.client(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            // Call separate instance to avoid infinite loop
            const response = await axios.post<{ data: { access_token: string } }>(
              `${this.client.defaults.baseURL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
            
            // Handle different response structures if needed, assuming standardized wrapper
            const newToken = response.data.data?.access_token || (response.data as any).access_token

            if (!newToken) {
               throw new Error('No token returned from refresh')
            }

            this.setToken(newToken)
            this.onRefreshed(newToken)
            
            // Update auth header for original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return this.client(originalRequest)

          } catch (refreshError) {
            // Logout if refresh fails
            this.setToken(null)
            if (typeof window !== 'undefined') {
                 // Redirect to login or dispatch logout action
                 // Since we don't have access to router/redux here easily, 
                 // we rely on the app handling 401s that propagate or just clearing state
                 window.location.href = '/auth/login'
            }
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error'
        // Preserve status code and original error for proper error handling
        const enhancedError: any = new Error(message)
        enhancedError.response = error.response
        enhancedError.status = error.response?.status
        return Promise.reject(enhancedError)
      }
    )
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof globalThis.window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('auth_token')
        delete this.client.defaults.headers.common['Authorization']
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || ''
  }


  async get<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.client.get<any, T>(endpoint, options)
  }

  async post<T>(endpoint: string, data?: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    return this.client.post<any, T>(endpoint, data, options)
  }

  async put<T>(endpoint: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    return this.client.put<any, T>(endpoint, data, options)
  }

  async delete<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.client.delete<any, T>(endpoint, options)
  }

  buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
