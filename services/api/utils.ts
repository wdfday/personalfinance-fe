/**
 * API Utilities
 * Các hàm tiện ích cho API services
 */

import type { ApiError } from './base'
import { HTTP_STATUS, ERROR_MESSAGES } from './config'

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Parse date to ISO string
 */
export function toISOString(date: string | Date): string {
  return new Date(date).toISOString()
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d.toISOString()
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return d.toISOString()
}

/**
 * Get start of year
 */
export function getStartOfYear(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), 0, 1)
  return d.toISOString()
}

/**
 * Get end of year
 */
export function getEndOfYear(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
  return d.toISOString()
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get error message from ApiError
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  const apiError = error as ApiError

  // Check for specific status codes
  switch (apiError.status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.SERVER_ERROR
    case 0:
      return ERROR_MESSAGES.NETWORK_ERROR
    default:
      return apiError.error || ERROR_MESSAGES.SERVER_ERROR
  }
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: ApiError): boolean {
  return error.status === 0
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === HTTP_STATUS.UNAUTHORIZED
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: ApiError): boolean {
  return (
    error.status === HTTP_STATUS.BAD_REQUEST ||
    error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY
  )
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)))
      } else {
        query.append(key, String(value))
      }
    }
  })

  return query.toString()
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) {
      throw error
    }

    await sleep(delay)
    return retry(fn, attempts - 1, delay * 2)
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * Parse JWT token
 */
export function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = parseJWT(token)
  if (!decoded || !decoded.exp) return true

  const now = Date.now() / 1000
  return decoded.exp < now
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = parseJWT(token)
  if (!decoded || !decoded.exp) return null

  return new Date(decoded.exp * 1000)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Safe JSON parse
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Unique array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Sum array
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0)
}

/**
 * Average array
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0
  return sum(array) / array.length
}

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  toISOString,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  daysBetween,
  calculatePercentage,
  formatPercentage,
  getErrorMessage,
  isNetworkError,
  isAuthError,
  isValidationError,
  buildQueryString,
  sleep,
  retry,
  debounce,
  throttle,
  parseJWT,
  isTokenExpired,
  getTokenExpiration,
  isValidEmail,
  isValidPhone,
  generateId,
  deepClone,
  isEmpty,
  safeJSONParse,
  groupBy,
  sortBy,
  unique,
  sum,
  average,
}

