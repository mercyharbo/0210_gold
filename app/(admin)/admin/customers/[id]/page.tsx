import { ChevronLeft, Heart, Mail, MapPin, Phone, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatNaira } from '@/components/index/shop/shop-data'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { Button } from '@/components/ui/button'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const adminSupabase = createSupabaseAdminClient()

  let customerProfile: {
    id: string
    name: string
    email: string
    phone: string
    location: string
    role: string
    preferences: string[]
    created_at: string
  } | null = null

  let customerOrders: any[] = []

  // Check if id is a guest ID ("guest-uuid" or guest order id) vs real profile UUID
  if (id.startsWith('guest-')) {
    const rawOrderId = id.replace('guest-', '')
    const { data: orderData } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', rawOrderId)
      .single()

    if (orderData?.customer_email) {
      const { data: orders } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('customer_email', orderData.customer_email)
        .order('created_at', { ascending: false })

      customerOrders = orders || []
      customerProfile = {
        id,
        name: orderData.customer_name || 'Guest Client',
        email: orderData.customer_email || 'N/A',
        phone: orderData.customer_phone || 'N/A',
        location: `${orderData.shipping_city}, ${orderData.shipping_state}, ${orderData.shipping_country}`,
        role: 'Guest Buyer',
        preferences: ['Gold Jewellery', 'Abayas', 'Bespoke Sourcing'],
        created_at: orderData.created_at,
      }
    }
  } else {
    // Registered profile UUID
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profile) {
      const { data: addresses } = await adminSupabase
        .from('addresses')
        .select('*')
        .eq('user_id', id)

      const { data: orders } = await adminSupabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${id},customer_email.eq.${profile.email}`)
        .order('created_at', { ascending: false })

      customerOrders = orders || []
      const defaultAddr = addresses?.find((a) => a.is_default) || addresses?.[0]

      let locationStr = 'Nigeria'
      if (defaultAddr) {
        locationStr = [defaultAddr.city, defaultAddr.state, defaultAddr.country]
          .filter(Boolean)
          .join(', ')
      } else if (customerOrders.length > 0) {
        locationStr = `${customerOrders[0].shipping_city}, ${customerOrders[0].shipping_state}, ${customerOrders[0].shipping_country}`
      }

      customerProfile = {
        id: profile.id,
        name:
          [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
          customerOrders[0]?.customer_name ||
          profile.email?.split('@')[0] ||
          'Registered Client',
        email: profile.email || 'N/A',
        phone: profile.phone || customerOrders[0]?.customer_phone || 'N/A',
        location: locationStr,
        role: profile.role ? profile.role.toUpperCase() : 'CUSTOMER',
        preferences:
          profile.preferences && profile.preferences.length > 0
            ? profile.preferences
            : ['18k Gold Chains', 'Luxury Abayas', 'Bespoke Sourcing'],
        created_at: profile.created_at,
      }
    } else {
      // Fallback: search orders table by id if profile was deleted or not created
      const { data: orderData } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (orderData) {
        const { data: orders } = await adminSupabase
          .from('orders')
          .select('*')
          .eq('customer_email', orderData.customer_email)
          .order('created_at', { ascending: false })

        customerOrders = orders || []
        customerProfile = {
          id: orderData.id,
          name: orderData.customer_name,
          email: orderData.customer_email,
          phone: orderData.customer_phone,
          location: `${orderData.shipping_city}, ${orderData.shipping_state}, ${orderData.shipping_country}`,
          role: 'Client',
          preferences: ['Gold Jewellery', 'Abayas'],
          created_at: orderData.created_at,
        }
      }
    }
  }

  if (!customerProfile) {
    notFound()
  }

  const actions = (
    <Button asChild variant='outline' size='sm' className='h-9 rounded-none border-black/20'>
      <Link href='/admin/customers' className='flex items-center gap-2'>
        <ChevronLeft className='size-4' />
        Back to Customers
      </Link>
    </Button>
  )

  const totalSpent = customerOrders.reduce(
    (acc, o) => acc + Number(o.total_amount || 0),
    0
  )

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title={`Customer Profile: ${customerProfile.name}`}
          description='Inspect client contact credentials, style preferences, and transaction order history.'
        />
        <div className='flex shrink-0 items-center gap-3'>{actions}</div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Left Sidebar Info */}
        <div className='flex flex-col gap-6'>
          {/* Profile Summary */}
          <AdminPlaceholderCard
            title='Profile Summary'
            description='Contact and account details'
            icon={User}
          >
            <div className='flex flex-col gap-3 py-1 text-xs'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-3xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Full Name
                </span>
                <span className='text-sm font-semibold text-black'>
                  {customerProfile.name}
                </span>
              </div>

              <div className='flex flex-col gap-0.5'>
                <span className='text-3xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Email Address
                </span>
                <span className='text-xs font-mono text-black flex items-center gap-1.5'>
                  <Mail className='size-3 text-gold' />
                  {customerProfile.email}
                </span>
              </div>

              <div className='flex flex-col gap-0.5'>
                <span className='text-3xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Phone Number
                </span>
                <span className='text-xs font-mono text-black flex items-center gap-1.5'>
                  <Phone className='size-3 text-gold' />
                  {customerProfile.phone}
                </span>
              </div>

              <div className='flex flex-col gap-0.5'>
                <span className='text-3xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Location
                </span>
                <span className='text-xs text-black flex items-center gap-1.5'>
                  <MapPin className='size-3 text-gold' />
                  {customerProfile.location}
                </span>
              </div>

              <div className='flex flex-col gap-0.5 pt-2 border-t border-black/10'>
                <span className='text-3xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Account Status
                </span>
                <span className='text-xs font-bold text-gold uppercase tracking-wider'>
                  {customerProfile.role}
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>

          {/* Style Preferences */}
          <AdminPlaceholderCard
            title='Style Preferences'
            description='Collections and bespoke interests declared by user'
            icon={Heart}
          >
            <div className='flex flex-wrap gap-2 py-1'>
              {customerProfile.preferences.map((pref, i) => (
                <span
                  key={i}
                  className='bg-amber-100/70 text-amber-950 border border-amber-300 px-3 py-1.5 text-sm font-medium rounded-none'
                >
                  {pref}
                </span>
              ))}
            </div>
          </AdminPlaceholderCard>
        </div>


        {/* Right Section: Purchase History */}
        <div className='md:col-span-2 flex flex-col gap-6'>
          <AdminPlaceholderCard
            title={`Purchase History (${customerOrders.length} Order${customerOrders.length === 1 ? '' : 's'})`}
            description={`Total spent across transactions: ${formatNaira(totalSpent)}`}
            icon={ShoppingBag}
          >
            {customerOrders.length === 0 ? (
              <p className='py-6 text-xs text-muted-foreground text-center'>
                No completed orders recorded for this client yet.
              </p>
            ) : (
              <div className='divide-y divide-black/10 text-xs'>
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className='flex justify-between items-center py-3.5 first:pt-0 hover:bg-neutral-50 px-2 transition-colors'
                  >
                    <div className='flex flex-col gap-1'>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className='text-sm font-semibold text-black hover:underline hover:text-gold'
                      >
                        Order #FML-{order.order_number}
                      </Link>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <span>
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span
                          className={`capitalize font-semibold text-3xs px-2 py-0.5 border ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className='text-right'>
                      <span className='text-sm font-mono font-bold text-black block'>
                        {formatNaira(order.total_amount)}
                      </span>
                      <span className='text-3xs uppercase font-semibold text-neutral-500'>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminPlaceholderCard>
        </div>
      </div>
    </div>
  )
}


