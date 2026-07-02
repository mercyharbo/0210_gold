"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ExternalLink } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

      <div className="flex items-center gap-4">
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

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gold hover:bg-gold/10 hover:text-gold"
        >
          <Bell className="size-4" />
        </Button>

        <div className="h-8 w-px bg-gold/30" />

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-1 ring-gold/40">
            <AvatarFallback className="bg-gold text-xs font-bold text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
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
