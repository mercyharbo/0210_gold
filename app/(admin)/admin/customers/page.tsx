import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CustomerRecord, CustomersClient } from '@/components/admin/customers-client'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminCustomersPage() {
  const adminSupabase = createSupabaseAdminClient()

  // 1. Fetch profiles
  const { data: profilesData } = await adminSupabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const profiles = profilesData || []

  // 2. Fetch addresses
  const { data: addressesData } = await adminSupabase
    .from('addresses')
    .select('*')

  const addresses = addressesData || []

  // 3. Fetch orders
  const { data: ordersData } = await adminSupabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  // Track emails of registered profiles
  const registeredEmails = new Set<string>()

  // Map registered customers from profiles table
  const registeredCustomers: CustomerRecord[] = profiles.map((p) => {
    if (p.email) registeredEmails.add(p.email.toLowerCase())

    const userOrders = orders.filter(
      (o) =>
        o.user_id === p.id ||
        (o.customer_email && o.customer_email.toLowerCase() === p.email?.toLowerCase())
    )

    const userAddress =
      addresses.find((a) => a.user_id === p.id && a.is_default) ||
      addresses.find((a) => a.user_id === p.id)

    let location = 'Nigeria'
    let country = 'Nigeria'

    if (userAddress) {
      location =
        [userAddress.city || userAddress.state, userAddress.country]
          .filter(Boolean)
          .join(', ') || 'Nigeria'
      country = userAddress.country || 'Nigeria'
    } else if (userOrders.length > 0) {
      location = `${userOrders[0].shipping_city}, ${userOrders[0].shipping_country}`
      country = userOrders[0].shipping_country || 'Nigeria'
    }

    const name =
      [p.first_name, p.last_name].filter(Boolean).join(' ') ||
      userOrders[0]?.customer_name ||
      p.email?.split('@')[0] ||
      'Registered Client'

    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

    return {
      id: p.id,
      name,
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      email: p.email || 'N/A',
      phone: p.phone || userOrders[0]?.customer_phone || 'N/A',
      location,
      country,
      ordersCount: userOrders.length,
      totalSpent,
      role: p.role || 'customer',
      preferences: p.preferences || [],
      created_at: p.created_at,
    }
  })

  // Map guest buyers from orders who do not have a registered profile
  const guestMap = new Map<string, typeof orders>()
  orders.forEach((ord) => {
    const email = ord.customer_email?.toLowerCase()
    if (email && !registeredEmails.has(email)) {
      if (!guestMap.has(email)) {
        guestMap.set(email, [])
      }
      guestMap.get(email)!.push(ord)
    }
  })

  const guestCustomers: CustomerRecord[] = Array.from(guestMap.entries()).map(
    ([email, gOrders]) => {
      const latestOrder = gOrders[0]
      const totalSpent = gOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
      const location = `${latestOrder.shipping_city}, ${latestOrder.shipping_country}`

      return {
        id: `guest-${latestOrder.id}`,
        name: latestOrder.customer_name || 'Guest Client',
        email: latestOrder.customer_email,
        phone: latestOrder.customer_phone || 'N/A',
        location,
        country: latestOrder.shipping_country || 'Nigeria',
        ordersCount: gOrders.length,
        totalSpent,
        role: 'guest',
        preferences: [],
        created_at: latestOrder.created_at,
      }
    }
  )

  const allCustomers = [...registeredCustomers, ...guestCustomers]

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Customer Management'
        description='Inspect client profiles, purchase frequencies, delivery locations, style preferences, and engagement history.'
      />

      <CustomersClient customers={allCustomers} />
    </div>
  )
}

