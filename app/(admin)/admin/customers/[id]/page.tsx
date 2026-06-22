import * as React from "react"
import Link from "next/link"
import { ChevronLeft, User, Heart, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params

  const actions = (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin/customers" className="flex items-center gap-2">
        <ChevronLeft className="size-4" />
        Back
      </Link>
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title={`Customer Profile: ${id}`}
      description="Inspect client order frequency, preferred collections, and contact details."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Profile Summary"
            description="Contact and registration credentials."
            icon={User}
          >
            <div className="flex flex-col gap-3 py-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Full Name
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Mock Customer Name
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Email Address
                </span>
                <span className="text-sm text-foreground">
                  customer.email@example.com
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Location
                </span>
                <span className="text-sm text-foreground">Lagos, Nigeria</span>
              </div>
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title="Style Preferences"
            description="Collections and interests declared by user."
            icon={Heart}
          >
            <div className="flex flex-wrap gap-2 py-1">
              <span className="bg-gold/10 px-2.5 py-1 text-2xs font-semibold text-gold rounded-md">
                18k Gold Chains
              </span>
              <span className="bg-gold/10 px-2.5 py-1 text-2xs font-semibold text-gold rounded-md">
                Hermès Birkins
              </span>
              <span className="bg-gold/10 px-2.5 py-1 text-2xs font-semibold text-gold rounded-md">
                Rolex Watches
              </span>
            </div>
          </AdminPlaceholderCard>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Purchase History"
            description="Completed transactions by this client."
            icon={ShoppingBag}
          >
            <div className="divide-y divide-border">
              <div className="flex justify-between items-center py-3 first:pt-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Order #1024
                  </span>
                  <span className="text-xs text-muted-foreground">
                    June 22, 2026 | Paid
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  ₦750,000
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Order #1015
                  </span>
                  <span className="text-xs text-muted-foreground">
                    May 12, 2026 | Paid
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  ₦2,700,000
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>
      </div>
    </div>
    </div>
  )
}
