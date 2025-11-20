"use client"
import { ThemeToggle } from "./theme-toggle"
import { Notifications } from "./notifications"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"
import { useAppDispatch } from "@/lib/hooks"
import { logout } from "@/features/auth/authSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import React from "react"
import { useTranslation } from "@/contexts/i18n-context"
import { LanguageSwitcher } from "@/features/settings/components/language-switcher"

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, logout: authLogout } = useAuth() // Dùng useAuth() giống settings page
  const { settings } = useSettings()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { t } = useTranslation("topNav")

  const handleLogout = () => {
    authLogout() // Logout từ AuthContext
    dispatch(logout()) // Clear Redux state
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="text-sm font-medium">
              {t("home")}
            </Link>
            {pathSegments.map((segment, index) => {
              const label = t(`breadcrumbs.${segment}`, {
                defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1),
              })
              return (
                <React.Fragment key={`${segment}-${index}`}>
                  <span className="text-muted-foreground">/</span>
                  <Link href={`/${pathSegments.slice(0, index + 1).join("/")}`} className="text-sm font-medium">
                    {label}
                  </Link>
                </React.Fragment>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Notifications />
          <ThemeToggle />
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatar_url || settings.avatar} 
                    alt={user?.display_name || user?.full_name || "User"} 
                  />
                  <AvatarFallback>
                    {(user?.display_name || user?.full_name)
                      ? (user.display_name || user.full_name)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.display_name || user?.full_name || "User"}
                  </p>
                  {user?.display_name && user?.full_name && user.display_name !== user.full_name && (
                    <p className="text-xs leading-none text-muted-foreground">{user.full_name}</p>
                  )}
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("avatarMenu.viewProfile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("avatarMenu.preferences")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
