import { ProfileSidebarTabs } from '@/components/profile/profile-sidebar-tabs'
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


function ProfileSetupRequired() {
  return (
    <div className='bg-white text-black'>
      <section className='px-5 py-16 sm:px-8 lg:px-12'>
        <div className='mx-auto max-w-3xl border border-gold/40 bg-gold/10 p-6 sm:p-8 flex flex-col gap-5'>
          <h1 className='font-heading text-4xl font-semibold sm:text-5xl'>
            Your account details are temporarily unavailable.
          </h1>
          <p className='text-sm leading-6 text-muted-foreground'>
            Please try again later or contact our team for help with your account.
          </p>
        </div>
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
      .map((i: { product_name: string }) => i.product_name)
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
      order.order_items?.forEach((item: { product_id: string; product_name: string }) => {
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

  const reviewsList = (dbReviews || []).map((r: { id: string; product_id: string; product: { name: string } | null; rating: number; comment: string }) => ({
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

  const wishlistItems = await getStorefrontWishlist(user.id)

  return (
    <div className='bg-white text-black min-h-screen'>
      {/* Centered Header Banner (Attachment 3 style) */}
      <section className='border-b border-black/10 bg-gray-50 px-5 py-14 sm:px-8 lg:px-12 lg:py-16'>
        <div className='mx-auto max-w-3xl text-center flex flex-col gap-3'>
          <p className='text-xs font-semibold  text-gold '>
            Customer Profile
          </p>
          <h1 className='font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl'>
            Your shopping history and account details.
          </h1>
          <p className='text-sm leading-relaxed text-muted-foreground max-w-2xl mx-auto'>
            Manage your personal information, delivery addresses, recent orders and product reviews from one customer profile.
          </p>
        </div>
      </section>

      {/* Main Tabbed Profile Section */}
      <section className='px-5 py-10 sm:px-8 lg:px-12'>
        <div className='mx-auto max-w-7xl'>
          <ProfileSidebarTabs
            profile={profile}
            addresses={addresses}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            fallbackEmail={user.email}
            recentOrders={recentOrders}
            reviewsList={reviewsList}
            readyForReview={readyForReview}
            wishlistItems={wishlistItems}
          />
        </div>
      </section>
    </div>
  )
}
