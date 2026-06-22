import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Receipt, User, Truck, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const actions = (
    <div className="flex items-center gap-3">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/orders" className="flex items-center gap-2">
          <ChevronLeft className="size-4" />
          Back
        </Link>
      </Button>
      <Button size="sm" className="bg-gold text-white hover:bg-gold/80">
        Update Fulfillment
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title={`Order Details: #${id}`}
      description="Inspect purchased items, shipping progress, and payment credentials."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Order Items"
            description="Catalog items purchased in this order."
            icon={Receipt}
          >
            <div className="divide-y divide-border">
              <div className="flex justify-between items-center py-3 first:pt-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    18k Gold Figarope Chain
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Quantity: 1 | SKU: JW-FG-18K
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  ₦750,000
                </span>
              </div>
              <div className="flex justify-between items-center py-3 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground text-muted-foreground">
                    Total
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  ₦750,000
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title="Fulfillment Tracking"
            description="Current status and shipping provider details."
            icon={Truck}
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  Fulfillment Status:
                </span>
                <span className="font-semibold text-foreground">In Transit</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Shipping Carrier</span>
                <span className="font-semibold text-foreground">DHL Express</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tracking Number</span>
                <span className="font-semibold text-foreground font-mono">
                  DHL-982-1024
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Customer Information"
            description="Client contact and accounts."
            icon={User}
          >
            <div className="flex flex-col gap-3 py-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Name
                </span>
                <span className="text-sm font-medium text-foreground">
                  Chidi Benson
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Email
                </span>
                <span className="text-sm text-foreground">
                  chidi.benson@example.com
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Phone
                </span>
                <span className="text-sm text-foreground">+234 803 123 4567</span>
              </div>
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title="Payment Details"
            description="Transaction confirmation."
            icon={CreditCard}
          >
            <div className="flex flex-col gap-3 py-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Gateway</span>
                <span className="font-semibold text-foreground">Paystack</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Reference</span>
                <span className="font-semibold text-foreground font-mono text-3xs">
                  PSTK-REF-9082341908
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Status</span>
                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-3xs font-semibold text-green-600 uppercase tracking-wider">
                  Success
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
