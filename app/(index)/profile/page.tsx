import {
  ArrowRight,
  Database,
  Heart,
  History,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Star,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { formatNaira } from '@/components/index/shop/shop-data'
import { ProfileForms } from '@/components/profile/profile-forms'
import { ProfileReviews } from '@/components/profile/profile-reviews'
import { ProfileWishlist } from '@/components/profile/profile-wishlist'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import { getStorefrontWishlist } from '@/lib/products/storefront-products'
import {
  getActiveCategories,
  getProfileCategoryPreferences,
} from '@/lib/profile/categories'
import {
  CustomerProfileSetupError,
  ensureCustomerProfile,
  getCustomerAddresses,
} from '@/lib/profile/customer-profile'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const shoppingRequests = [
  {
    title: 'UK occasion outfit sourcing',
    status: 'Quote sent',
    destination: 'Lagos, Nigeria',
  },
  {
    title: 'Beauty and accessories shopping',
    status: 'Items being checked',
    destination: 'Abuja, Nigeria',
  },
]

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

function ProfileSetupRequired() {
  return (
    <div className='bg-white text-black'>
      <section className='px-5 py-16 sm:px-8 lg:px-12'>
        <Card className='mx-auto max-w-3xl rounded-none bg-gold/10 ring-gold/40 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
          <CardContent className='space-y-5'>
            <Database className='size-6 text-gold' strokeWidth={1.7} />
            <div className='space-y-3'>
              <p className='text-xs font-semibold uppercase text-gold'>
                Supabase setup required
              </p>
              <h1 className='font-heading text-4xl font-semibold sm:text-5xl'>
                Customer profiles are ready in the app, but the database tables
                are not available yet.
              </h1>
            </div>
            <p className='text-sm leading-6 text-muted-foreground'>
              Open your Supabase project SQL editor and run the setup script at
              <span className='font-semibold'>
                {' '}
                supabase/profiles-and-addresses.sql
              </span>
              . After it runs, refresh this page. If you already ran it, refresh
              Supabase schema cache or restart the dev server.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default async function ProfilePage() {
  const user = await requireUser('/login?error=Sign in to access your profile.')
  let profile
  let addresses
  let categories
  let selectedCategoryIds

  try {
    profile = await ensureCustomerProfile(user)
    const [nextAddresses, nextCategories, nextSelectedCategoryIds] =
      await Promise.all([
        getCustomerAddresses(user.id),
        getActiveCategories(),
        getProfileCategoryPreferences(user.id),
      ])

    addresses = nextAddresses
    categories = nextCategories
    selectedCategoryIds = nextSelectedCategoryIds
  } catch (error) {
    if (error instanceof CustomerProfileSetupError) {
      return <ProfileSetupRequired />
    }

    throw error
  }

  const supabase = await createSupabaseServerClient()

  // Fetch real orders
  const { data: dbOrders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recentOrders = (dbOrders || []).map((order) => {
    const itemsList = order.order_items
      .map((i: any) => i.product_name)
      .join(', ')
    return {
      id: `FML-${order.order_number}`,
      date: new Date(order.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      items: itemsList || 'No items',
      total: order.total_amount,
    }
  })

  // Fetch purchased products (for "Ready for review")
  const purchasedProducts = new Map<string, string>()
  dbOrders?.forEach((order) => {
    if (order.status !== 'cancelled') {
      order.order_items?.forEach((item: any) => {
        purchasedProducts.set(item.product_id, item.product_name)
      })
    }
  })

  // Fetch reviews written by the customer
  const { data: dbReviews } = await supabase
    .from('reviews')
    .select('*, product:products(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const reviewsList = (dbReviews || []).map((r: any) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product?.name || 'Unknown Product',
    rating: r.rating,
    comment: r.comment,
  }))

  const reviewedProductIds = new Set(reviewsList.map((r) => r.productId))
  const readyForReview: { id: string; name: string }[] = []
  purchasedProducts.forEach((name, id) => {
    if (!reviewedProductIds.has(id)) {
      readyForReview.push({ id, name })
    }
  })

  // Fetch real wishlist items
  const wishlistItems = await getStorefrontWishlist(user.id)

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    (typeof user?.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : 'Customer')

  const stats = [
    { label: 'Orders', value: String(recentOrders.length) },
    { label: 'Reviews', value: String(reviewsList.length) },
    { label: 'Addresses', value: String(addresses.length) },
    { label: 'Requests', value: String(shoppingRequests.length) },
  ]

  return (
    <div className='bg-white text-black'>
      <section className='border-b border-black/10 bg-muted px-5 py-14 sm:px-8 lg:px-12 lg:py-20'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <p className='text-xs font-semibold uppercase text-gold'>
                Customer profile
              </p>
              <h1 className='max-w-3xl font-heading text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl'>
                Your shopping history and account details.
              </h1>
            </div>
            <p className='max-w-2xl text-base leading-7 text-muted-foreground'>
              Manage orders, reviews, saved items, delivery addresses, and UK to
              Nigeria shopping requests from one customer profile.
            </p>
          </div>

          <Card className='rounded-none bg-white lg:min-w-80'>
            <CardContent className='space-y-6'>
              <div className='flex items-center gap-4'>
                <span className='grid size-14 place-items-center bg-black text-white'>
                  <User className='size-6' strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className='font-heading text-2xl font-semibold'>
                    {fullName}
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {profile.email ?? user?.email}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    className='rounded-none bg-white'
                    size='sm'
                  >
                    <CardContent className='space-y-1'>
                      <p className='font-heading text-3xl font-semibold'>
                        {stat.value}
                      </p>
                      <p className='text-xs font-semibold uppercase text-muted-foreground'>
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='px-5 py-12 sm:px-8 lg:px-12'>
        <div className='mx-auto max-w-7xl space-y-6'>
          <ProfileForms
            profile={profile}
            addresses={addresses}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            fallbackEmail={user.email}
          />
        </div>
      </section>

      <section className='px-5 pb-12 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]'>
          <div className='space-y-8'>
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

            <div className='grid gap-8 xl:grid-cols-2'>
              <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
                <CardHeader className='gap-5'>
                  <Star className='size-5 text-gold' strokeWidth={1.7} />
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase text-muted-foreground'>
                      Product reviews
                    </p>
                    <CardTitle className='text-3xl font-semibold'>
                      Reviews
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

              <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
                <CardHeader className='gap-5'>
                  <ShoppingBag className='size-5 text-gold' strokeWidth={1.7} />
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase text-muted-foreground'>
                      Make a request
                    </p>
                    <CardTitle className='text-3xl font-semibold'>
                      Requests
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {shoppingRequests.map((request) => (
                    <div
                      key={request.title}
                      className='space-y-3 border-t border-black/10 pt-4'
                    >
                      <h3 className='text-sm font-semibold'>{request.title}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {request.destination}
                      </p>
                      <p className='text-xs font-semibold uppercase text-gold'>
                        {request.status}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

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
          </div>

          <aside className='space-y-6'>
            <Card className='rounded-none bg-white [--card-spacing:--spacing(6)]'>
              <CardHeader className='gap-5'>
                <History className='size-5 text-gold' strokeWidth={1.7} />
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Support shortcuts
                </p>
              </CardHeader>
              <CardContent className='space-y-3'>
                {supportLinks.map(({ href, title, description, Icon }) => (
                  <Link
                    key={title}
                    href={href}
                    className='grid grid-cols-[auto_1fr] gap-3 border-t border-black/10 pt-4 transition-opacity hover:opacity-65'
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
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  )
}
