import * as React from "react"
import { Sparkles, ArrowUpRight, Search, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminPersonalShopperRequestsPage() {
  const mockRequests = [
    {
      id: "req-101",
      customer: "Amara Kalu",
      itemRequested: "Hermès Birkin 25 (Gold Hardware, Epsom Leather)",
      date: "June 22, 2026",
      budget: "₦14,500,000",
      status: "Sourcing",
    },
    {
      id: "req-102",
      customer: "Lola Coker",
      itemRequested: "Rolex Datejust 36 (Olive Green Palm Motif Dial)",
      date: "June 18, 2026",
      budget: "₦11,200,000",
      status: "Completed",
    },
    {
      id: "req-103",
      customer: "Chidi Benson",
      itemRequested: "18k Solid Gold Custom Lion Pendant",
      date: "June 15, 2026",
      budget: "₦2,500,000",
      status: "Approved",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
      title="Personal Shopper Requests"
      description="Manage custom luxury sourcing and client procurement commissions."
     />
      <div className="flex flex-col gap-6">
<div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <AdminPlaceholderCard
            title="Active Sourcing"
            value="1"
            icon={Search}
          />
          <AdminPlaceholderCard
            title="Commission Value"
            value="₦28,200,000"
            icon={Sparkles}
          />
          <AdminPlaceholderCard
            title="Fulfilled Requests"
            value="1"
            icon={CheckCircle}
          />
        </div>

        <AdminPlaceholderCard
          title="Procurement Leads"
          description="Client commissions for luxury procurement"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Item Sourced</th>
                  <th className="py-3 px-4">Budget Limit</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-semibold text-foreground">
                      #{request.id}
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      {request.customer}
                    </td>
                    <td className="py-4 px-4 text-foreground text-xs leading-normal">
                      {request.itemRequested}
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium">
                      {request.budget}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">
                      {request.date}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          request.status === "Completed"
                            ? "bg-green-500/10 text-green-600"
                            : request.status === "Sourcing"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="outline" size="xs" className="h-8 gap-1.5 bg-background border-border">
                        Sourcing Details
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPlaceholderCard>
      </div>
    </div>
    </div>
  )
}
