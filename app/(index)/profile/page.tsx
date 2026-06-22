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
import { requireUser } from '@/lib/auth/session'
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
        <div className='mx-auto max-w-3xl border border-[#d6b04d] bg-[#fff7d8] p-6 sm:p-8'>
          <Database className='mb-5 size-6 text-[#9b6b12]' strokeWidth={1.7} />
          <p className='text-xs font-semibold uppercase text-[#9b6b12]'>
            Supabase setup required
          </p>
          <h1 className='mt-3 font-heading text-4xl font-semibold sm:text-5xl'>
            Customer profiles are ready in the app, but the database tables are
            not available yet.
          </h1>
          <p className='mt-5 text-sm leading-6 text-black/65'>
            Open your Supabase project SQL editor and run the setup script at
            <span className='font-semibold'> supabase/profiles-and-addresses.sql</span>.
            After it runs, refresh this page. If you already ran it, refresh
            Supabase schema cache or restart the dev server.
          </p>
        </div>
      </section>
    </div>
  )
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser('/login?error=Sign in to access your profile.')
  const params = await searchParams
  let profile
  let addresses

  try {
    profile = await ensureCustomerProfile(user)
    addresses = await getCustomerAddresses(user.id)
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
      <section className='border-b border-black/10 bg-[#f7f5f0] px-5 py-14 sm:px-8 lg:px-12 lg:py-20'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div>
            <p className='mb-4 text-xs font-semibold uppercase text-[#b88a2b]'>
              Customer profile
            </p>
            <h1 className='max-w-3xl font-heading text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Your shopping history and account details.
            </h1>
            <p className='mt-6 max-w-2xl text-base leading-7 text-black/65'>
              Manage orders, reviews, saved items, delivery addresses, and UK to
              Nigeria personal shopping requests from one customer profile.
            </p>
          </div>

          <div className='border border-black/10 bg-white p-6 lg:min-w-80'>
            <div className='flex items-center gap-4'>
              <span className='grid size-14 place-items-center bg-black text-white'>
                <User className='size-6' strokeWidth={1.7} />
              </span>
              <div>
                <h2 className='font-heading text-2xl font-semibold'>
                  {fullName}
                </h2>
                <p className='text-sm text-black/55'>
                  {profile.email ?? user?.email}
                </p>
              </div>
            </div>
            <div className='mt-6 grid grid-cols-2 gap-3'>
              {stats.map((stat) => (
                <div key={stat.label} className='border border-black/10 p-4'>
                  <p className='font-heading text-3xl font-semibold'>
                    {stat.value}
                  </p>
                  <p className='mt-1 text-xs font-semibold uppercase text-black/45'>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='px-5 py-12 sm:px-8 lg:px-12'>
        <div className='mx-auto max-w-7xl'>
          {params?.message ? (
            <div className='mb-6 border border-[#d6b04d] bg-[#fff7d8] p-4 text-sm font-semibold text-black'>
              {params.message}
            </div>
          ) : null}
          {params?.error ? (
            <div className='mb-6 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700'>
              {params.error}
            </div>
          ) : null}

          <ProfileForms
            profile={profile}
            addresses={addresses}
            fallbackEmail={user.email}
          />
        </div>
      </section>

      <section className='px-5 pb-12 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]'>
          <div className='space-y-8'>
            <section className='border border-black/10 p-6 sm:p-8'>
              <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                  <p className='text-xs font-semibold uppercase text-black/45'>
                    Order history
                  </p>
                  <h2 className='mt-2 font-heading text-3xl font-semibold'>
                    Recent orders
                  </h2>
                </div>
                <Link
                  href='/track-order'
                  className='inline-flex w-fit items-center gap-2 text-sm font-semibold underline underline-offset-4'
                >
                  Track order
                  <ArrowRight className='size-4' strokeWidth={1.8} />
                </Link>
              </div>

              <div className='divide-y divide-black/10'>
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className='grid gap-4 py-5 md:grid-cols-[140px_1fr_auto] md:items-center'
                  >
                    <div>
                      <p className='text-sm font-semibold'>{order.id}</p>
                      <p className='mt-1 text-xs text-black/45'>{order.date}</p>
                    </div>
                    <div>
                      <p className='text-sm text-black/68'>{order.items}</p>
                      <span className='mt-2 inline-flex bg-[#f3d77a] px-3 py-1 text-xs font-semibold text-black'>
                        {order.status}
                      </span>
                    </div>
                    <p className='text-sm font-semibold'>
                      {formatNaira(order.total)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <div className='grid gap-8 xl:grid-cols-2'>
              <section className='border border-black/10 p-6 sm:p-8'>
                <Star
                  className='mb-5 size-5 text-[#b88a2b]'
                  strokeWidth={1.7}
                />
                <p className='text-xs font-semibold uppercase text-black/45'>
                  Product reviews
                </p>
                <h2 className='mt-2 font-heading text-3xl font-semibold'>
                  Reviews
                </h2>
                <div className='mt-6 space-y-4'>
                  {reviewItems.map((item) => (
                    <article key={item.title} className='border-t border-black/10 pt-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <h3 className='text-sm font-semibold'>{item.title}</h3>
                          <p className='mt-1 text-sm leading-6 text-black/58'>
                            {item.detail}
                          </p>
                        </div>
                        <span className='shrink-0 text-xs font-semibold text-[#9b6b12]'>
                          {item.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className='border border-black/10 p-6 sm:p-8'>
                <ShoppingBag
                  className='mb-5 size-5 text-[#b88a2b]'
                  strokeWidth={1.7}
                />
                <p className='text-xs font-semibold uppercase text-black/45'>
                  Personal shopper
                </p>
                <h2 className='mt-2 font-heading text-3xl font-semibold'>
                  Requests
                </h2>
                <div className='mt-6 space-y-4'>
                  {shopperRequests.map((request) => (
                    <article
                      key={request.title}
                      className='border-t border-black/10 pt-4'
                    >
                      <h3 className='text-sm font-semibold'>{request.title}</h3>
                      <p className='mt-1 text-sm text-black/58'>
                        {request.destination}
                      </p>
                      <p className='mt-3 text-xs font-semibold uppercase text-[#9b6b12]'>
                        {request.status}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <section className='border border-black/10 p-6 sm:p-8'>
              <div className='mb-6 flex items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase text-black/45'>
                    Wishlist
                  </p>
                  <h2 className='mt-2 font-heading text-3xl font-semibold'>
                    Saved items
                  </h2>
                </div>
                <Heart className='size-5 text-[#b88a2b]' strokeWidth={1.7} />
              </div>

              <div className='grid gap-5 sm:grid-cols-2'>
                {savedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className='grid grid-cols-[96px_1fr] gap-4 border border-black/10 p-3 transition-colors hover:border-black'
                  >
                    <span className='relative aspect-square bg-[#f4f1ec]'>
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes='96px'
                        className='object-cover'
                      />
                    </span>
                    <span className='flex flex-col justify-center'>
                      <span className='font-heading text-xl font-semibold'>
                        {item.name}
                      </span>
                      <span className='mt-2 text-sm font-semibold'>
                        {formatNaira(item.price)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className='space-y-6'>
            <section className='border border-black/10 p-6'>
              <History
                className='mb-5 size-5 text-[#b88a2b]'
                strokeWidth={1.7}
              />
              <p className='text-xs font-semibold uppercase text-black/45'>
                Support shortcuts
              </p>
              <div className='mt-5 space-y-3'>
                {supportLinks.map(({ href, title, description, Icon }) => (
                  <Link
                    key={title}
                    href={href}
                    className='grid grid-cols-[auto_1fr] gap-3 border-t border-black/10 pt-4 transition-opacity hover:opacity-65'
                  >
                    <Icon className='mt-0.5 size-4' strokeWidth={1.7} />
                    <span>
                      <span className='block text-sm font-semibold'>
                        {title}
                      </span>
                      <span className='mt-1 block text-sm leading-5 text-black/55'>
                        {description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  )
}
