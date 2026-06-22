import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Save, Trash2, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCategoryDetailPage({ params }: PageProps) {
  const { id } = await params

  const actions = (
    <div className="flex items-center gap-3">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/categories" className="flex items-center gap-2">
          <ChevronLeft className="size-4" />
          Back
        </Link>
      </Button>
      <Button size="sm" className="bg-gold text-white hover:bg-gold/80">
        <Save className="size-4" />
        Save Changes
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title={`Edit Category: ${id}`}
      description="View and update category settings, slugs, and promotional banners."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-6">
          <AdminPlaceholderCard
            title="General Information"
            description="Details of the product category."
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Category Name
                </span>
                <span className="text-sm font-medium text-foreground">
                  Mock Category (ID: {id})
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Slug Path
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed font-mono">
                  /mock-category-path
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Description
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Curated collections for fashion and gold jewelry. Timeless styling curated for you.
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Category Banner"
            description="Banner display for storefront navigation."
          >
            <div className="relative rounded-lg border border-border bg-muted/30 aspect-video flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                No banner uploaded
              </span>
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title="Danger Zone"
            description="Delete category from catalog."
            icon={ShieldAlert}
          >
            <Button
              variant="destructive"
              className="w-full justify-center flex gap-2 h-10"
            >
              <Trash2 className="size-4" />
              Delete Category
            </Button>
          </AdminPlaceholderCard>
        </div>
      </div>
    </div>
    </div>
  )
}
