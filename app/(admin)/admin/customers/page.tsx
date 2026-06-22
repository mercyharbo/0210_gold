import * as React from "react"
import Link from "next/link"
import { Eye, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminCustomersPage() {
  const mockCustomers = [
    {
      id: "cust-1",
      name: "Chidi Benson",
      email: "chidi.benson@example.com",
      location: "Lagos, Nigeria",
      ordersCount: 5,
      totalSpent: "₦3,450,000",
    },
    {
      id: "cust-2",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      location: "London, UK",
      ordersCount: 3,
      totalSpent: "₦2,800,000",
    },
    {
      id: "cust-3",
      name: "Amara Kalu",
      email: "amara.kalu@example.com",
      location: "Abuja, Nigeria",
      ordersCount: 8,
      totalSpent: "₦6,120,000",
    },
    {
      id: "cust-4",
      name: "Tunde Bakare",
      email: "tunde.bakare@example.com",
      location: "Lekki, Nigeria",
      ordersCount: 1,
      totalSpent: "₦320,000",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
      title="Customers"
      description="View client statistics, locations, order history, and preferences."
     />
      <div className="flex flex-col gap-6">
<div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <AdminPlaceholderCard
            title="Total Registered"
            value="1,240"
            icon={Mail}
          />
          <AdminPlaceholderCard
            title="Repeat Buyers"
            value="84"
            icon={Eye}
          />
          <AdminPlaceholderCard
            title="International Clients"
            value="35"
            icon={MapPin}
          />
        </div>

        <AdminPlaceholderCard
          title="Customer Base"
          description="Listing of registered clients and billing history"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="hover:underline hover:text-gold"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                      {customer.email}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {customer.location}
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground font-semibold">
                      {customer.ordersCount}
                    </td>
                    <td className="py-3.5 px-4 text-right text-foreground">
                      {customer.totalSpent}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
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
