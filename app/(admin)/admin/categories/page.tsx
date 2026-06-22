import * as React from "react"
import Link from "next/link"
import { Plus, Eye, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminCategoriesPage() {
  const mockCategories = [
    {
      id: "cat-1",
      name: "Jewelry",
      slug: "jewelry",
      productCount: 45,
      status: "Active",
    },
    {
      id: "cat-2",
      name: "Luxury Bags",
      slug: "luxury-bags",
      productCount: 24,
      status: "Active",
    },
    {
      id: "cat-3",
      name: "Watches",
      slug: "watches",
      productCount: 12,
      status: "Active",
    },
    {
      id: "cat-4",
      name: "Shoes",
      slug: "shoes",
      productCount: 35,
      status: "Inactive",
    },
  ]

  const actions = (
    <Button asChild size="sm" className="bg-gold text-white hover:bg-gold/80">
      <Link href="/admin/categories/new" className="flex items-center gap-2">
        <Plus className="size-4" />
        Add Category
      </Link>
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title="Categories"
      description="Organize catalog items into collections and filter tags."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6">
        <div className="flex gap-4">
          <AdminPlaceholderCard
            title="Total Categories"
            value="4"
            className="flex-1"
          />
          <AdminPlaceholderCard
            title="Active Collections"
            value="3"
            className="flex-1"
          />
          <AdminPlaceholderCard
            title="Empty Categories"
            value="0"
            className="flex-1"
          />
        </div>

        <AdminPlaceholderCard
          title="Categories Catalog"
          description="Listing of all currently defined product categories"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Products Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="hover:underline hover:text-gold"
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      /{category.slug}
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {category.productCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          category.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/admin/categories/${category.id}`}>
                            <Eye className="size-3.5" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
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
