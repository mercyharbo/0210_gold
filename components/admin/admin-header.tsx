"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Coins, ExternalLink } from "lucide-react"

import { AdminNotificationsPopover } from "./admin-notifications-popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1

    // Format text nicely (e.g. order-requests -> Order Requests)
    let title = segment.replace(/-/g, " ")
    if (title.length > 20 && title.includes("%")) {
      // Decode URL segments
      try {
        title = decodeURIComponent(title)
      } catch {
        // Fallback
      }
    }
    // Capitalize first letters
    title = title.replace(/\b\w/g, (c) => c.toUpperCase())

    return { title, href, isLast }
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gold/30 bg-card px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gold hover:bg-gold/10 hover:text-gold" />
        <div className="h-4 w-px bg-gold/30" />
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isHome = crumb.href === "/admin"
            const label = isHome ? "Dashboard" : crumb.title

            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <span>/</span>}
                {crumb.isLast ? (
                  <span className="font-semibold text-foreground">{label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-gold"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-3 py-1 text-xs text-foreground">
          <span className="flex items-center gap-1 font-semibold text-gold">
            <Coins className="size-3.5 text-gold shrink-0" />
            <span>Today's Gold:</span>
          </span>
          <span className="text-muted-foreground">18K <strong className="text-foreground">₦133,700</strong></span>
          <span className="text-gold/40">•</span>
          <span className="text-muted-foreground">22K <strong className="text-foreground">₦163,400</strong></span>
          <span className="text-gold/40">•</span>
          <span className="text-muted-foreground">24K <strong className="text-foreground">₦178,300</strong></span>
        </div>

        <Button
          variant="outline"
          size="xs"
          asChild
          className="hidden h-9 border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-white sm:inline-flex"
        >
          <Link href="/" target="_blank" className="flex items-center gap-2">
            View Store
            <ExternalLink className="size-3" />
          </Link>
        </Button>

        <AdminNotificationsPopover />

        <div className="h-8 w-px bg-gold/30" />

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-1 ring-gold/40">
            <AvatarFallback className="bg-gold text-xs text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden gap-1 md:flex flex-col text-left">
            <span className="text-sm font-semibold leading-none text-foreground">
              Manager
            </span>
            <span className="text-xs leading-none text-muted-foreground">
              FM LUXE
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
