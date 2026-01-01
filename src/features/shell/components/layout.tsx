"use client"

import { useState, createContext, useContext } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/features/shell/components/sidebar"
import { TopNav } from "@/features/shell/components/top-nav"
import { RightSidebar } from "@/features/shell/components/right-sidebar"

interface LayoutContentProps {
  children: React.ReactNode
}

interface RightSidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined)

export const useRightSidebar = () => {
  const context = useContext(RightSidebarContext)
  if (!context) {
    throw new Error("useRightSidebar must be used within LayoutContent")
  }
  return context
}

const authRoutes = ["/login", "/register"]

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const isAuthPage = authRoutes.includes(pathname)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(640)

  const rightSidebarValue = {
    isOpen: isRightSidebarOpen,
    toggle: () => setIsRightSidebarOpen(!isRightSidebarOpen),
  }

  // For auth pages, render children without sidebar/topnav
  if (isAuthPage) {
    return <>{children}</>
  }

  // For protected pages, render with sidebar and topnav
  return (
    <RightSidebarContext.Provider value={rightSidebarValue}>
      <div className="min-h-screen flex">
        <Sidebar />
        <div 
          className="flex-1 transition-all duration-300"
        >
          <style jsx>{`
            @media (min-width: 1024px) {
              .flex-1 {
                margin-right: ${isRightSidebarOpen ? `${sidebarWidth}px` : '0'};
              }
            }
          `}</style>
          <TopNav />
          <div className="container mx-auto p-6 max-w-7xl">
            <main className="w-full">{children}</main>
          </div>
        </div>
        <RightSidebar 
          isOpen={isRightSidebarOpen} 
          onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          onWidthChange={setSidebarWidth}
        />
      </div>
    </RightSidebarContext.Provider>
  )
}
