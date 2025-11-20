/**
 * API Configuration
 * Cấu hình cho API client
 */

export interface ApiConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * Default API configuration
 */
export const defaultApiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh',
  },

  // Accounts
  ACCOUNTS: {
    LIST: '/accounts',
    GET: (id: number) => `/accounts/${id}`,
    CREATE: '/accounts',
    UPDATE: (id: number) => `/accounts/${id}`,
    DELETE: (id: number) => `/accounts/${id}`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/transactions',
    GET: (id: string) => `/transactions/${id}`,
    CREATE: '/transactions',
    UPDATE: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
  },

  // Budgets
  BUDGETS: {
    LIST: '/budgets',
    GET: (id: string) => `/budgets/${id}`,
    CREATE: '/budgets',
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
  },

  // Goals
  GOALS: {
    LIST: '/goals',
    GET: (id: string) => `/goals/${id}`,
    CREATE: '/goals',
    UPDATE: (id: string) => `/goals/${id}`,
    DELETE: (id: string) => `/goals/${id}`,
  },

  // Investments
  INVESTMENTS: {
    LIST: '/investments',
    GET: (id: string) => `/investments/${id}`,
    CREATE: '/investments',
    UPDATE: (id: string) => `/investments/${id}`,
    DELETE: (id: string) => `/investments/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    GET: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Summaries
  SUMMARIES: {
    ACCOUNTS: '/summaries/accounts',
    TRANSACTIONS: '/summaries/transactions',
    BUDGETS: '/summaries/budgets',
    GOALS: '/summaries/goals',
    INVESTMENTS: '/summaries/investments',
    DASHBOARD: '/summaries/dashboard',
  },
} as const

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  PREFERENCES: 'preferences',
} as const

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  SERVER_ERROR: 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  TIMEOUT: 'Request timeout. Vui lòng thử lại.',
} as const

/**
 * Get API config from environment
 */
export function getApiConfig(): ApiConfig {
  return {
    baseURL: process.env.NEXT_PUBLIC_API_URL || defaultApiConfig.baseURL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || String(defaultApiConfig.timeout)),
    retryAttempts: parseInt(
      process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || String(defaultApiConfig.retryAttempts)
    ),
    retryDelay: parseInt(
      process.env.NEXT_PUBLIC_API_RETRY_DELAY || String(defaultApiConfig.retryDelay)
    ),
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export default {
  defaultApiConfig,
  API_ENDPOINTS,
  STORAGE_KEYS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  getApiConfig,
  isDevelopment,
  isProduction,
}

