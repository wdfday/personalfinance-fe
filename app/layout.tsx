import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/contexts/auth-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { I18nProvider } from "@/contexts/i18n-context"
import { ReduxProvider } from "@/lib/redux-provider"
import { AuthGuard } from "@/components/auth-guard"
import { HydrationBoundary } from "@/components/hydration-boundary"
import { LayoutContent } from "@/components/layout"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Flowers&Saints Dashboard",
  description: "A modern, responsive financial dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationBoundary>
          <ReduxProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>
                <SettingsProvider>
                  <I18nProvider>
                    <TooltipProvider delayDuration={0}>
                      <AuthGuard>
                        <LayoutContent>{children}</LayoutContent>
                      </AuthGuard>
                    </TooltipProvider>
                  </I18nProvider>
                </SettingsProvider>
              </AuthProvider>
            </ThemeProvider>
          </ReduxProvider>
        </HydrationBoundary>
      </body>
    </html>
  )
}
