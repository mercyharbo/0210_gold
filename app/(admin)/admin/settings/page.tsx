import * as React from "react"
import { Globe, CreditCard, Shield, Sliders } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminSettingsPage() {
  const actions = (
    <Button size="sm" className="bg-gold text-white hover:bg-gold/80">
      Save Configurations
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title="Settings"
      description="Configure administrative roles, payment thresholds, currency mapping rates, and shipping policies."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6 md:grid-cols-2">
        <AdminPlaceholderCard
          title="Storefront & Currencies"
          description="Adjust currency exchange rate conversions."
          icon={Globe}
        >
          <div className="flex flex-col gap-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Primary currency</span>
              <span className="font-semibold text-foreground">NGN (₦)</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>GBP Sourcing Rate</span>
              <span className="font-semibold text-foreground">£1 = ₦2,200</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-conversion updates</span>
              <span className="font-semibold text-amber-600">Manual</span>
            </div>
          </div>
        </AdminPlaceholderCard>

        <AdminPlaceholderCard
          title="Fulfillment & Shipping"
          description="Set international shipping rates and delivery schedules."
          icon={Sliders}
        >
          <div className="flex flex-col gap-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>UK to Nigeria shipping</span>
              <span className="font-semibold text-foreground">
                ₦15,000 / kg
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Standard local transit time</span>
              <span className="font-semibold text-foreground">3-5 days</span>
            </div>
            <div className="flex justify-between">
              <span>Free shipping threshold</span>
              <span className="font-semibold text-foreground">₦10,000,000</span>
            </div>
          </div>
        </AdminPlaceholderCard>

        <AdminPlaceholderCard
          title="Payment Integrations"
          description="Configure payment gateway parameters."
          icon={CreditCard}
        >
          <div className="flex flex-col gap-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Payment Gateway</span>
              <span className="font-semibold text-foreground">Paystack</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Sandbox mode</span>
              <span className="font-semibold text-amber-600">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Custom checkout commissions</span>
              <span className="font-semibold text-foreground">0.0%</span>
            </div>
          </div>
        </AdminPlaceholderCard>

        <AdminPlaceholderCard
          title="Security & Access Control"
          description="Configure active system managers and roles."
          icon={Shield}
        >
          <div className="flex flex-col gap-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Super administrator</span>
              <span className="font-semibold text-foreground">
                admin@0210gold.com
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2.5">
              <span>Active session length</span>
              <span className="font-semibold text-foreground">7 days</span>
            </div>
            <div className="flex justify-between">
              <span>Multi-factor authentication</span>
              <span className="font-semibold text-green-600">Required</span>
            </div>
          </div>
        </AdminPlaceholderCard>
      </div>
    </div>
    </div>
  )
}
