"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { authService, usersService } from "@/services/api"
import type { User } from "@/services/api"
import { getErrorMessage } from "@/services/api/utils"

// Define types for credentials matching backend API
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

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (data: { full_name?: string; display_name?: string; phone_number?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // Check if token exists
          if (authService.getToken()) {
            // Get current user from User Service (not Auth Service)
            const currentUser = await usersService.getMe()
            setUser(currentUser)
          }
      } catch (error) {
        console.error('Auth check failed:', getErrorMessage(error))
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      // Sau khi login thành công, lấy đầy đủ thông tin user từ User Service
      const fullUser = await usersService.getMe()
      setUser(fullUser)
    } catch (error) {
      console.error('Login failed:', getErrorMessage(error))
      throw error
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData)
      // Sau khi register thành công, lấy đầy đủ thông tin user từ User Service
      const fullUser = await usersService.getMe()
      setUser(fullUser)
    } catch (error) {
      console.error('Register failed:', getErrorMessage(error))
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateProfile = async (data: { full_name?: string; display_name?: string; phone_number?: string }) => {
    try {
      // Dùng User Service thay vì Auth Service
      const updatedUser = await usersService.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      console.error('Update profile failed:', getErrorMessage(error))
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

