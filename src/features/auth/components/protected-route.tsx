"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { checkAuth } from "@/features/auth/authSlice"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated on mount
    if (!isAuthenticated && !isLoading) {
      dispatch(checkAuth())
    }
  }, [dispatch, isAuthenticated, isLoading])

  useEffect(() => {
    // Redirect to login if not authenticated after loading
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
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

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Render children if authenticated
  return <>{children}</>
}

