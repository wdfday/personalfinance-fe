"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { checkAuth } from "@/features/auth/authSlice"
import { fetchCategories } from "@/features/categories/categoriesSlice"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

const publicRoutes = ["/login", "/register"]
const authRoutes = ["/login", "/register"]

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const hasCheckedAuth = useRef(false)

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)

  useEffect(() => {
    // Check authentication only once on mount
    if (!hasCheckedAuth.current && !isAuthenticated) {
      hasCheckedAuth.current = true
      dispatch(checkAuth())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCategories())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    // Redirect based on authentication status
    if (!isLoading) {
      if (isAuthRoute && isAuthenticated) {
        // If on auth page and authenticated, redirect to home
        router.push("/")
      } else if (!isPublicRoute && !isAuthenticated) {
        // If on protected page and not authenticated, redirect to login
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, isAuthRoute, isPublicRoute, router])

  // For auth pages (login/register), render children directly without layout
  if (isAuthRoute) {
    // If authenticated, show loading while redirecting
    if (isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      )
    }
    return <>{children}</>
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated on protected route
  if (!isPublicRoute && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
