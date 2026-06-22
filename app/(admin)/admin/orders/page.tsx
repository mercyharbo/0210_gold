import * as React from "react"
import Link from "next/link"
import { Eye, Truck, CheckCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminOrdersPage() {
  const mockOrders = [
    {
      id: "1024",
      customer: "Chidi Benson",
      date: "June 22, 2026",
      amount: "₦750,000",
      paymentStatus: "Paid",
      fulfillmentStatus: "In Transit",
    },
    {
      id: "1023",
      customer: "Sarah Jenkins",
      date: "June 20, 2026",
      amount: "₦1,200,000",
      paymentStatus: "Paid",
      fulfillmentStatus: "Delivered",
    },
    {
      id: "1022",
      customer: "Tunde Bakare",
      date: "June 19, 2026",
      amount: "₦320,000",
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
    },
    {
      id: "1021",
      customer: "Amara Kalu",
      date: "June 15, 2026",
      amount: "₦850,000",
      paymentStatus: "Paid",
      fulfillmentStatus: "Delivered",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
      title="Orders"
      description="Manage client transactions, check statuses, and track fulfillment."
     />
      <div className="flex flex-col gap-6">
<div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <AdminPlaceholderCard
            title="Processing"
            value="1"
            icon={Clock}
          />
          <AdminPlaceholderCard
            title="In Transit"
            value="1"
            icon={Truck}
          />
          <AdminPlaceholderCard
            title="Delivered"
            value="2"
            icon={CheckCircle}
          />
        </div>

        <AdminPlaceholderCard
          title="Recent Orders"
          description="Listing of all current store sales and requests"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline hover:text-gold"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {order.customer}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {order.date}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      {order.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          order.fulfillmentStatus === "Delivered"
                            ? "bg-green-500/10 text-green-600"
                            : order.fulfillmentStatus === "In Transit"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="size-3.5" />
                        </Link>
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
