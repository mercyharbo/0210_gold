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
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { requireUser } from '@/lib/auth/session'
import {
  getActiveCategories,
  getProfileCategoryPreferences,
} from '@/lib/profile/categories'
import {
  CustomerProfileSetupError,
  ensureCustomerProfile,
  getCustomerAddresses,
} from '@/lib/profile/customer-profile'

const orders = [
  {
    id: '0210-5482',
    date: '18 Jun 2026',
    status: 'Delivered',
    items: 'Flowing Occasion Abaya, Gold Styling Set',
    total: 305000,
  },
  {
    id: '0210-5416',
    date: '04 Jun 2026',
    status: 'In transit',
    items: 'Structured Day Bag',
    total: 78000,
  },
  {
    id: '0210-5331',
    date: '22 May 2026',
    status: 'Processing',
    items: 'Polished Shoe Pair',
    total: 88000,
  },
]

const reviewItems = [
  {
    title: 'Gold Styling Set',
    status: 'Review added',
    detail: '5 star review on jewellery and accessories',
  },
  {
    title: 'Flowing Occasion Abaya',
    status: 'Ready for review',
    detail: 'Share fit, fabric, and styling feedback',
  },
]

const shopperRequests = [
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

const savedItems = [
  {
    id: 'coordinated-modest-set',
    name: 'Coordinated Modest Set',
    imageAlt: 'Coordinated modest fashion outfit styled in a boutique studio',
    imageSrc: '/images/featured-collections/modest-sets.png',
    price: 135000,
  },
  {
    id: 'polished-shoe-pair',
    name: 'Polished Shoe Pair',
    imageAlt: 'Elegant shoes arranged on minimal studio plinths',
    imageSrc: '/images/featured-collections/shoes.png',
    price: 88000,
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

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

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
              <span className='font-semibold'> supabase/profiles-and-addresses.sql</span>.
              After it runs, refresh this page. If you already ran it, refresh
              Supabase schema cache or restart the dev server.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser('/login?error=Sign in to access your profile.')
  const params = await searchParams
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

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    (typeof user?.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : 'Customer')

  const stats = [
    { label: 'Orders', value: String(orders.length) },
    { label: 'Reviews', value: String(reviewItems.length) },
    { label: 'Addresses', value: String(addresses.length) },
    { label: 'Requests', value: String(shopperRequests.length) },
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
              Nigeria personal shopping requests from one customer profile.
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
                <Card key={stat.label} className='rounded-none bg-white' size='sm'>
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
          {params?.message ? (
            <Card className='rounded-none bg-gold/10 ring-gold/40' size='sm'>
              <CardContent className='text-sm font-semibold text-black'>
                {params.message}
              </CardContent>
            </Card>
          ) : null}
          {params?.error ? (
            <Card className='rounded-none bg-red-50 ring-red-200' size='sm'>
              <CardContent className='text-sm font-semibold text-red-700'>
                {params.error}
              </CardContent>
            </Card>
          ) : null}

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
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className='grid gap-4 py-5 md:grid-cols-[140px_1fr_auto] md:items-center'
                  >
                    <div className='space-y-1'>
                      <p className='text-sm font-semibold'>{order.id}</p>
                      <p className='text-xs text-muted-foreground'>{order.date}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>{order.items}</p>
                      <span className='inline-flex bg-gold/35 px-3 py-1 text-xs font-semibold text-black'>
                        {order.status}
                      </span>
                    </div>
                    <p className='text-sm font-semibold'>
                      {formatNaira(order.total)}
                    </p>
                  </div>
                ))}
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
                  {reviewItems.map((item) => (
                    <div key={item.title} className='border-t border-black/10 pt-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='space-y-1'>
                          <h3 className='text-sm font-semibold'>{item.title}</h3>
                          <p className='text-sm leading-6 text-muted-foreground'>
                            {item.detail}
                          </p>
                        </div>
                        <span className='shrink-0 text-xs font-semibold text-gold'>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className='rounded-none bg-white [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
                <CardHeader className='gap-5'>
                  <ShoppingBag className='size-5 text-gold' strokeWidth={1.7} />
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase text-muted-foreground'>
                      Personal shopper
                    </p>
                    <CardTitle className='text-3xl font-semibold'>
                      Requests
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {shopperRequests.map((request) => (
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

              <CardContent className='grid gap-5 sm:grid-cols-2'>
                {savedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className='grid grid-cols-[96px_1fr] gap-4 ring-1 ring-black/10 p-3 transition-colors hover:ring-black'
                  >
                    <span className='relative aspect-square bg-muted'>
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes='96px'
                        className='object-cover'
                      />
                    </span>
                    <span className='flex flex-col justify-center gap-2'>
                      <span className='font-heading text-xl font-semibold'>
                        {item.name}
                      </span>
                      <span className='text-sm font-semibold'>
                        {formatNaira(item.price)}
                      </span>
                    </span>
                  </Link>
                ))}
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
                    <Icon className='size-4 translate-y-0.5' strokeWidth={1.7} />
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
