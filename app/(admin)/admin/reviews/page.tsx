import * as React from "react"
import { Star, MessageSquare, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPlaceholderCard } from "@/components/admin/admin-placeholder-card"

export default function AdminReviewsPage() {
  const mockReviews = [
    {
      id: "rev-1",
      customer: "Tunde Bakare",
      rating: 5,
      comment: "Amazing quality! Extremely shiny and heavy 18k gold figarope chain.",
      product: "18k Gold Figarope Chain",
      date: "June 21, 2026",
      status: "Approved",
    },
    {
      id: "rev-2",
      customer: "Lola Coker",
      rating: 4,
      comment: "Absolutely stunning Chanel classic bag. Took a few days to deliver to Abuja, but worth it.",
      product: "Chanel Classic Flap Bag",
      date: "June 18, 2026",
      status: "Approved",
    },
    {
      id: "rev-3",
      customer: "James Obi",
      rating: 5,
      comment: "The personal shopping team sourced a bespoke Rolex watch for me within a week. Phenomenal service.",
      product: "Personal Shopping Service",
      date: "June 22, 2026",
      status: "Pending",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
      title="Reviews"
      description="Moderate product testimonials, feedback stars, and client recommendations."
     />
      <div className="flex flex-col gap-6">
<div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <AdminPlaceholderCard
            title="Total Reviews"
            value="48"
            icon={MessageSquare}
          />
          <AdminPlaceholderCard
            title="Average Rating"
            value="4.8 / 5"
            icon={Star}
          />
          <AdminPlaceholderCard
            title="Pending Moderation"
            value="1"
            icon={Check}
          />
        </div>

        <AdminPlaceholderCard
          title="Customer Feedback"
          description="Moderate reviews left by verified buyers"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4">Associated Item</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-4 text-foreground font-semibold">
                      {review.customer}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 fill-current ${
                              i < review.rating ? "opacity-100" : "opacity-20"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      <span className="text-[10px] block mt-1 text-muted-foreground/60">
                        {review.date}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium text-xs">
                      {review.product}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          review.status === "Approved"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {review.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="bg-green-500/10 text-green-600 border-none hover:bg-green-500/20"
                            title="Approve Review"
                          >
                            <Check className="size-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive/80"
                          title="Reject/Delete"
                        >
                          <X className="size-3" />
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
