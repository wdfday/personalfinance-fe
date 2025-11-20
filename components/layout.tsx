"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"

interface LayoutContentProps {
  children: React.ReactNode
}

const authRoutes = ["/login", "/register"]

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const isAuthPage = authRoutes.includes(pathname)

  // For auth pages, render children without sidebar/topnav
  if (isAuthPage) {
    return <>{children}</>
  }

  // For protected pages, render with sidebar and topnav
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto p-6 max-w-7xl">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  )
}
