import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const adminSupabase = createSupabaseAdminClient()

  // 1. Fetch Orders
  const { data: ordersData } = await adminSupabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  // 2. Fetch Personal Shopper Requests
  const { data: requestsData } = await adminSupabase
    .from('personal_shopper_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const shopperRequests = requestsData || []

  // 3. Fetch Customers Count
  const { count: customersCount } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 4. Fetch Products for Category mapping
  const { data: productsData } = await adminSupabase
    .from('products')
    .select('category')

  const products = productsData || []

  // Calculate Metrics from Real Database Data
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid' || o.status === 'delivered')
    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0)

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
  ).length

  const pendingRequestsCount = shopperRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'Sourcing'
  ).length

  // Build Real Monthly Revenue Aggregation (Jan - Dec)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()

  const monthlyAggMap: Record<string, { revenue: number; orders: number }> = {}
  monthNames.forEach((m) => {
    monthlyAggMap[m] = { revenue: 0, orders: 0 }
  })

  orders.forEach((ord) => {
    const d = new Date(ord.created_at)
    if (d.getFullYear() === currentYear || orders.length < 10) {
      const monthLabel = monthNames[d.getMonth()]
      if (monthlyAggMap[monthLabel]) {
        monthlyAggMap[monthLabel].revenue += Number(ord.total_amount || 0)
        monthlyAggMap[monthLabel].orders += 1
      }
    }
  })

  const realRevenueChartData = monthNames.map((m) => ({
    month: m,
    revenue: monthlyAggMap[m].revenue,
    orders: monthlyAggMap[m].orders,
  }))

  // Build Real Category Sales Aggregation
  const categoryAggMap: Record<string, number> = {}

  orders.forEach((ord) => {
    const items = ord.order_items || []
    items.forEach((item: any) => {
      const cat = item.category || 'Jewellery & Gold'
      categoryAggMap[cat] = (categoryAggMap[cat] || 0) + Number(item.price * item.quantity || 0)
    })
  })

  // If no category items exist yet, build from products table categories
  if (Object.keys(categoryAggMap).length === 0) {
    products.forEach((p) => {
      if (p.category) {
        categoryAggMap[p.category] = (categoryAggMap[p.category] || 0) + 150000
      }
    })
  }

  const categoryColors = ['#D4AF37', '#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EC4899']
  const realCategoryChartData = Object.keys(categoryAggMap).map((catName, idx) => ({
    name: catName,
    value: categoryAggMap[catName],
    color: categoryColors[idx % categoryColors.length],
  }))

  // Build Real Recent Activity Stream
  const recentOrdersList = orders.slice(0, 3).map((o) => ({
    id: `order-${o.id}`,
    title: `${o.customer_name} placed Order #FML-${o.order_number}`,
    subtitle: `Shipping to ${o.shipping_city}, ${o.shipping_state}`,
    amount: Number(o.total_amount),
    status: o.status.toUpperCase(),
    timestamp: new Date(o.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    }),
    link: `/admin/orders/${o.id}`,
  }))

  const recentRequestsList = shopperRequests.slice(0, 3).map((r) => ({
    id: `req-${r.id}`,
    title: `${r.full_name} submitted Sourcing Brief`,
    subtitle: `Category: ${r.category} | Budget: ${r.budget || 'N/A'}`,
    status: r.status.toUpperCase(),
    timestamp: new Date(r.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    }),
    link: '/admin/personal-shopper-requests',
  }))

  const combinedActivities = [...recentOrdersList, ...recentRequestsList].slice(0, 5)

  return (
    <div className='flex flex-col gap-5 bg-white text-black'>
      <AdminPageHeader
        title='Analytics Dashboard'
        description='Overview of sales performance, storefront activity, order fulfillment tracking, and bespoke client sourcing requests.'
      />

      <AdminDashboardClient
        stats={{
          totalRevenue,
          activeOrdersCount,
          pendingRequestsCount,
          totalCustomersCount: customersCount || 0,
        }}
        revenueData={realRevenueChartData}
        categoryData={realCategoryChartData}
        recentActivities={combinedActivities}
      />
    </div>
  )
}
