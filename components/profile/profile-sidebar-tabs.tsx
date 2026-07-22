'use client'

import {
  ArrowRight,
  Heart,
  History,
  LockKeyhole,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Star,
  User,
} from 'lucide-react'
import Link from 'next/link'

import { formatNaira } from '@/components/index/shop/shop-data'
import { AddressesCard } from '@/components/profile/addresses-card'
import { ProfileInformationCard } from '@/components/profile/profile-information-card'
import { ProfileReviews, type ReadyReviewItem, type ReviewItem } from '@/components/profile/profile-reviews'
import { ProfileWishlist } from '@/components/profile/profile-wishlist'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  recentOrders: {
    id: string
    date: string
    status: string
    items: string
    total: number
  }[]
  reviewsList: ReviewItem[]
  readyForReview: ReadyReviewItem[]
  shoppingRequests: {
    id: string
    category: string
    message: string
    status: string
    destination: string
    date: string
  }[]
  wishlistItems: any[]
}

const supportLinks = [
  {
    href: '/track-order',
    title: 'Track an order',
    description: 'Check delivery or waybill progress.',
    Icon: PackageCheck,
  },
  {
    href: '/contact',
    title: 'Contact support',
    description: 'Send a product, order, or account enquiry.',
    Icon: MessageCircle,
  },
  {
    href: '/change-password',
    title: 'Security',
    description: 'Update password and account access.',
    Icon: LockKeyhole,
  },
]

export function ProfileSidebarTabs({
  profile,
  addresses,
  categories,
  selectedCategoryIds,
  fallbackEmail,
  recentOrders,
  reviewsList,
  readyForReview,
  shoppingRequests,
  wishlistItems,
}: ProfileSidebarTabsProps) {
  return (
    <Tabs
      defaultValue='personal-info'
      orientation='vertical'
      className='grid gap-8 lg:grid-cols-[260px_1fr] items-start'
    >
      <TabsList className='flex flex-col h-auto w-full gap-3 bg-transparent p-0 rounded-none'>
        <TabsTrigger
          value='personal-info'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <User className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Personal Information</span>
        </TabsTrigger>

        <TabsTrigger
          value='orders'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <PackageCheck className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>My Orders</span>
        </TabsTrigger>

        <TabsTrigger
          value='addresses'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <MapPin className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Manage Address</span>
        </TabsTrigger>

        <TabsTrigger
          value='requests'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <ShoppingBag className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Custom Sourcing</span>
        </TabsTrigger>

        <TabsTrigger
          value='reviews'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <Star className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Product Reviews</span>
        </TabsTrigger>

        <TabsTrigger
          value='wishlist'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <Heart className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Saved Wishlist</span>
        </TabsTrigger>

        <TabsTrigger
          value='security'
          className='w-full justify-start gap-3 h-11 py-3 px-4 text-sm font-medium rounded-none border-0 bg-transparent text-black transition-colors hover:bg-neutral-100/70 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none after:hidden shrink-0'
        >
          <History className='size-4 shrink-0 text-current' strokeWidth={1.8} />
          <span>Security & Support</span>
        </TabsTrigger>
      </TabsList>

      <div className='min-w-0'>
        {/* Personal Information Tab */}
        <TabsContent value='personal-info' className='mt-0'>
          <ProfileInformationCard
            profile={profile}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            fallbackEmail={fallbackEmail}
          />
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value='orders' className='mt-0'>
          <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
            <CardHeader>
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Order history
                </p>
                <CardTitle className='text-3xl font-semibold'>
                  Recent orders
                </CardTitle>
              </div>
              <CardAction>
                <Link
                  href='/track-order'
                  className='inline-flex w-fit items-center gap-2 text-sm font-semibold underline underline-offset-4'
                >
                  Track order
                  <ArrowRight className='size-4' strokeWidth={1.8} />
                </Link>
              </CardAction>
            </CardHeader>

            <CardContent className='divide-y divide-black/10'>
              {recentOrders.length === 0 ? (
                <p className='text-sm text-muted-foreground py-6 text-center'>
                  No orders placed yet.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className='grid gap-4 py-5 md:grid-cols-[140px_1fr_auto] md:items-center'
                  >
                    <div className='space-y-1'>
                      <p className='text-sm font-semibold'>{order.id}</p>
                      <p className='text-xs text-muted-foreground'>
                        {order.date}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>
                        {order.items}
                      </p>
                      <span className='inline-flex bg-gold/35 px-3 py-1 text-xs font-semibold text-black'>
                        {order.status}
                      </span>
                    </div>
                    <p className='text-sm font-semibold'>
                      {formatNaira(order.total)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Address Tab */}
        <TabsContent value='addresses' className='mt-0'>
          <AddressesCard profile={profile} addresses={addresses} />
        </TabsContent>

        {/* Custom Sourcing Requests Tab */}
        <TabsContent value='requests' className='mt-0'>
          <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
            <CardHeader className='gap-5'>
              <div className='flex items-center justify-between gap-4 w-full'>
                <div className='space-y-2'>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Make a request
                  </p>
                  <CardTitle className='text-3xl font-semibold'>
                    Custom Sourcing Requests
                  </CardTitle>
                </div>
                <Link
                  href='/make-a-request'
                  className='inline-flex h-10 items-center justify-center bg-black px-4 text-xs font-semibold uppercase text-white transition-colors hover:bg-gold hover:text-black rounded-none shrink-0'
                >
                  New Request
                </Link>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {shoppingRequests.length === 0 ? (
                <div className='text-center py-10 space-y-4'>
                  <ShoppingBag className='size-10 text-muted-foreground/60 mx-auto stroke-[1.5]' />
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold'>No sourcing requests yet</p>
                    <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                      Looking for something specific from the UK? Submit a personal shopper request and our team will source it for you.
                    </p>
                  </div>
                  <Link
                    href='/make-a-request'
                    className='inline-flex h-10 items-center justify-center border border-black px-5 text-xs font-semibold uppercase text-black transition-colors hover:bg-black hover:text-white rounded-none'
                  >
                    Submit A Request
                  </Link>
                </div>
              ) : (
                <div className='divide-y divide-black/10'>
                  {shoppingRequests.map((request) => (
                    <div
                      key={request.id}
                      className='py-4 space-y-2 first:pt-0 last:pb-0'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='space-y-1'>
                          <h3 className='text-sm font-semibold text-black'>{request.category}</h3>
                          <p className='text-xs text-muted-foreground leading-relaxed'>
                            {request.message}
                          </p>
                        </div>
                        <span className='inline-flex bg-gold/20 px-2.5 py-0.5 text-xs font-medium text-black shrink-0'>
                          {request.status}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs text-muted-foreground pt-1'>
                        <span>Destination: {request.destination}</span>
                        <span>{request.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Reviews Tab */}
        <TabsContent value='reviews' className='mt-0'>
          <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
            <CardHeader className='gap-5'>
              <Star className='size-5 text-gold' strokeWidth={1.7} />
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Product reviews
                </p>
                <CardTitle className='text-3xl font-semibold'>
                  Reviews & Ratings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ProfileReviews
                reviews={reviewsList}
                readyForReview={readyForReview}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Wishlist Tab */}
        <TabsContent value='wishlist' className='mt-0'>
          <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
            <CardHeader>
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Wishlist
                </p>
                <CardTitle className='text-3xl font-semibold'>
                  Saved items
                </CardTitle>
              </div>
              <CardAction>
                <Heart className='size-5 text-gold' strokeWidth={1.7} />
              </CardAction>
            </CardHeader>

            <CardContent className='pt-0'>
              <ProfileWishlist items={wishlistItems} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Support Tab */}
        <TabsContent value='security' className='mt-0'>
          <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
            <CardHeader className='gap-5'>
              <History className='size-5 text-gold' strokeWidth={1.7} />
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Security & Support
                </p>
                <CardTitle className='text-3xl font-semibold'>
                  Account Shortcuts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='space-y-3'>
                {supportLinks.map(({ href, title, description, Icon }) => (
                  <Link
                    key={title}
                    href={href}
                    className='grid grid-cols-[auto_1fr] gap-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 transition-opacity hover:opacity-65'
                  >
                    <Icon
                      className='size-4 translate-y-0.5'
                      strokeWidth={1.7}
                    />
                    <span className='space-y-1'>
                      <span className='block text-sm font-semibold'>
                        {title}
                      </span>
                      <span className='block text-sm leading-5 text-muted-foreground'>
                        {description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}
