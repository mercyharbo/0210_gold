import { ArrowUpRight, CheckCircle, Search, Sparkles } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"
import { Button } from "@/components/ui/button"

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

export default function AdminRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Requests"
        description="Manage custom luxury sourcing and client request commissions."
      />

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
          title="Request Leads"
          description="Client requests for luxury sourcing"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border font-semibold text-muted-foreground">
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Item Sourced</th>
                  <th className="px-4 py-3">Budget Limit</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-4 font-mono font-semibold text-foreground">
                      #{request.id}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {request.customer}
                    </td>
                    <td className="px-4 py-4 text-xs leading-normal text-foreground">
                      {request.itemRequested}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {request.budget}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {request.date}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-3xs font-semibold ${
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
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-8 gap-1.5 border-border bg-background"
                      >
                        Request details
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
  )
}
