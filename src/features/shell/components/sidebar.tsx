"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Building2,
  Folder,
  Wallet,
  Receipt,
  CreditCard,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  FileText,
  Link2,
  Calculator,
  Calendar,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useTranslation } from "@/contexts/i18n-context"

const navigation = [
  { labelKey: "dashboard", href: "/", icon: Home },
  { labelKey: "analytics", href: "/analytics", icon: BarChart2 },
  { labelKey: "accounts", href: "/accounts", icon: Wallet },
  { labelKey: "brokers", href: "/brokers", icon: Link2 },
  { labelKey: "transactions", href: "/transactions", icon: Receipt },
  { labelKey: "income", href: "/income", icon: Banknote },
  { labelKey: "budgets", href: "/budgets", icon: CreditCard },
  { labelKey: "month", href: "/calendar", icon: Calendar },
  { labelKey: "goals", href: "/goals", icon: Building2 },
  { labelKey: "debts", href: "/debts", icon: FileText },
  { labelKey: "investments", href: "/investments", icon: Folder },
  { labelKey: "categories", href: "/categories", icon: Users2 },
  { labelKey: "reports", href: "/reports", icon: Shield },
  { labelKey: "settings", href: "/settings", icon: Settings },
]

const bottomNavigation = [{ labelKey: "help", href: "/help", icon: HelpCircle }]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useTranslation("sidebar")
  const { t: tCommon } = useTranslation("common")

  const NavItem = ({ item, isBottom = false }: { item: typeof navigation[0], isBottom?: boolean }) => {
    const label = t(`navigation.${item.labelKey}`)
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              isCollapsed && "justify-center px-2",
            )}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={t("actions.toggle")}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex h-screen flex-col bg-background transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:self-start",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-border">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href="/" className="flex items-center font-semibold">
                  <span className="text-lg">{tCommon("appName")}</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">
                  {isCollapsed ? t("actions.expand") : t("actions.collapse")}
                </span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.labelKey} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t border-border p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.labelKey} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}
