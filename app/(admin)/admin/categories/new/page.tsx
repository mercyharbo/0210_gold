import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Info, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminNewCategoryPage() {
  const actions = (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin/categories" className="flex items-center gap-2">
        <ChevronLeft className="size-4" />
        Back to Categories
      </Link>
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
      title="Add Category"
      description="Create a new category for your catalog."
     />
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      <div className="flex flex-col gap-6">
<div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Category Information"
            description="Basic settings for category filtering."
          >
            <div className="rounded-lg border border-dashed border-border p-8 flex flex-col items-center justify-center text-center gap-3">
              <Info className="size-8 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  Category details form placeholder
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Inputs for category name, slug, description, and navigation grouping hierarchy will render here in the next phase.
                </p>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPlaceholderCard
            title="Category Banner / Thumbnail"
            description="Banner image for the category landing page."
          >
            <div className="rounded-lg border border-dashed border-border p-6 flex flex-col items-center justify-center text-center gap-2 h-40">
              <HelpCircle className="size-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Banner upload area
              </span>
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title="Settings"
            description="Adjust categorization status and visibility."
          >
            <div className="flex flex-col gap-4 text-xs text-muted-foreground py-2">
              <div className="flex justify-between border-b border-border pb-2">
                <span>Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Menu Link Visibility</span>
                <span className="font-semibold">Visible</span>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>
      </div>
    </div>
    </div>
  )
}
