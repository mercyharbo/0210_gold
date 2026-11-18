'use client'

import type { ComponentProps } from 'react'
import { Heart, History, MapPin, PackageCheck, Star, User } from 'lucide-react'
import Link from 'next/link'
import { AddressesCard } from '@/components/profile/addresses-card'
import { ProfileInformationCard } from '@/components/profile/profile-information-card'
import { ProfileOrdersCard, type RecentOrder } from '@/components/profile/profile-orders-card'
import { ProfileReviews, type ReadyReviewItem, type ReviewItem } from '@/components/profile/profile-reviews'
import { ProfileWishlist } from '@/components/profile/profile-wishlist'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CustomerAddress } from '@/types/address'
import type { CategoryOption } from '@/types/category'
import type { CustomerProfile } from '@/types/profile'

type ProfileSidebarTabsProps = {
  profile: CustomerProfile
  addresses: CustomerAddress[]
  categories: CategoryOption[]
  selectedCategoryIds: string[]
  fallbackEmail?: string
  recentOrders: RecentOrder[]
  reviewsList: ReviewItem[]
  readyForReview: ReadyReviewItem[]
  wishlistItems: ComponentProps<typeof ProfileWishlist>['items']
}

const tabs = [
  { value: 'personal-info', label: 'Personal information', Icon: User },
  { value: 'orders', label: 'My orders', Icon: PackageCheck },
  { value: 'addresses', label: 'Manage addresses', Icon: MapPin },
  { value: 'reviews', label: 'My reviews', Icon: Star },
  { value: 'wishlist', label: 'Saved wishlist', Icon: Heart },
  { value: 'security', label: 'Security and support', Icon: History },
]

export function ProfileSidebarTabs({
  profile, addresses, categories, selectedCategoryIds, fallbackEmail,
  recentOrders, reviewsList, readyForReview, wishlistItems,
}: ProfileSidebarTabsProps) {
  return (
    <Tabs defaultValue="personal-info" orientation="vertical" className="grid items-start gap-8 lg:grid-cols-4">
      <TabsList className="flex h-auto w-full flex-col gap-3 rounded-none bg-transparent p-0">
        {tabs.map(({ value, label, Icon }) => (
          <TabsTrigger key={value} value={value} className="h-11 w-full justify-start gap-3 rounded-none px-4 text-sm data-[state=active]:bg-gold data-[state=active]:text-white">
            <Icon aria-hidden="true" /><span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="min-w-0 lg:col-span-3">
        <TabsContent value="personal-info">
          <ProfileInformationCard profile={profile} categories={categories} selectedCategoryIds={selectedCategoryIds} fallbackEmail={fallbackEmail} />
        </TabsContent>
        <TabsContent value="orders"><ProfileOrdersCard orders={recentOrders} /></TabsContent>
        <TabsContent value="addresses"><AddressesCard profile={profile} addresses={addresses} /></TabsContent>
        <TabsContent value="reviews"><ProfileReviews reviews={reviewsList} readyForReview={readyForReview} /></TabsContent>
        <TabsContent value="wishlist">
          <Card className="rounded-none">
            <CardHeader><CardTitle className="font-heading text-3xl">Saved wishlist</CardTitle></CardHeader>
            <CardContent><ProfileWishlist items={wishlistItems} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="font-heading text-3xl">Security and support</CardTitle>
              <CardDescription>Manage account access or get help with a product or order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link href="/change-password">Change password</Link></Button>
              <Button asChild variant="outline"><Link href="/contact">Contact support</Link></Button>
              <Button asChild variant="link"><Link href="/track-order">Track an order</Link></Button>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}
