'use client'

import {
  ArrowUpRight,
  Crown,
  DollarSign,
  FileText,
  FolderTree,
  Package,
  Plus,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { CategorySalesChart } from '@/components/admin/category-sales-chart'
import { RevenueTrendChart } from '@/components/admin/revenue-trend-chart'
import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'

type DashboardClientProps = {
  stats: {
    totalRevenue: number
    activeOrdersCount: number
    pendingRequestsCount: number
    totalCustomersCount: number
  }
  revenueData: Array<{ month: string; revenue: number; orders: number }>
  categoryData: Array<{ name: string; value: number; color: string }>
  recentActivities: Array<{
    id: string
    title: string
    subtitle: string
    amount?: number
    status?: string
    timestamp: string
    link: string
  }>
}

export function AdminDashboardClient({
  stats,
  revenueData,
  categoryData,
  recentActivities,
}: DashboardClientProps) {
  // Metric Cards Data Mapping
  const metricCards = [
    {
      title: 'Total Sales Revenue',
      value: formatNaira(stats.totalRevenue),
      description: 'Calculated from confirmed store orders',
      icon: DollarSign,
    },
    {
      title: 'Active Orders',
      value: stats.activeOrdersCount,
      description: 'Orders currently being processed & waybilled',
      icon: ShoppingCart,
    },
    {
      title: 'Personal Shopper Briefs',
      value: stats.pendingRequestsCount,
      description: 'Active bespoke UK sourcing leads',
      icon: FileText,
    },
    {
      title: 'Registered Customers',
      value: stats.totalCustomersCount,
      description: 'Verified accounts registered in database',
      icon: Users,
    },
  ]

  // Monthly Target Calculations (e.g. NGN 50,000,000 target)
  const targetAmount = 50000000
  const currentProgressPercent = Math.min(
    Math.round((stats.totalRevenue / targetAmount) * 100),
    100
  )
  const remainingAmount = Math.max(targetAmount - stats.totalRevenue, 0)

  return (
    <div className='flex flex-col gap-6 font-sans'>
      {/* Executive Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {metricCards.map((card) => (
          <AdminPlaceholderCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Main Charts Section */}
      <div className='grid gap-6 lg:grid-cols-[1.8fr_1.2fr]'>
        <RevenueTrendChart data={revenueData} />
        <CategorySalesChart data={categoryData} />
      </div>

      {/* Bottom Grid: Recent Activity & Quick Action Shortcuts */}
      <div className='grid gap-6 lg:grid-cols-[1.8fr_1.2fr]'>
        {/* Combined Live Stream */}
        <AdminPlaceholderCard
          title='Recent Storefront Activity'
          description='Live stream of latest orders and personal shopper request briefs'
        >
          <div className='divide-y divide-border'>
            {recentActivities.length === 0 ? (
              <p className='text-xs text-muted-foreground py-6 text-center'>
                No recent activity recorded.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className='flex items-center justify-between py-4 first:pt-0 last:pb-0'
                >
                  <div className='flex flex-col gap-1 min-w-0 pr-4'>
                    <span className='text-sm font-semibold text-foreground truncate'>
                      {act.title}
                    </span>
                    <span className='text-xs text-muted-foreground truncate'>
                      {act.subtitle}
                    </span>
                  </div>

                  <div className='flex items-center gap-3 shrink-0'>
                    <div className='flex flex-col items-end gap-1 text-right'>
                      <span className='text-xs text-muted-foreground'>
                        {act.timestamp}
                      </span>
                      {act.amount !== undefined && (
                        <span className='text-xs font-bold text-foreground'>
                          {formatNaira(act.amount)}
                        </span>
                      )}
                      {act.status && <StatusBadge status={act.status} />}
                    </div>

                    <Button
                      asChild
                      variant='outline'
                      size='xs'
                      className='h-8 w-8 p-0 border-border hover:bg-muted shrink-0'
                    >
                      <Link href={act.link}>
                        <ArrowUpRight className='size-4 text-muted-foreground' />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminPlaceholderCard>

        {/* Business Target & Shortcuts Card */}
        <div className='flex flex-col gap-6 justify-between'>
          <AdminPlaceholderCard
            title='Monthly Sales Target'
            description='Target vs Actual Revenue Performance'
            icon={Target}
          >
            <div className='flex flex-col gap-4 py-2 text-xs font-sans'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground font-medium'>Monthly Goal</span>
                <span className='font-bold text-foreground text-sm'>
                  {formatNaira(targetAmount)}
                </span>
              </div>

              <div className='w-full bg-muted rounded-full h-3 overflow-hidden border border-border'>
                <div
                  className='bg-black h-full rounded-full transition-all duration-500'
                  style={{ width: `${currentProgressPercent}%` }}
                />
              </div>

              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground font-medium'>Progress ({currentProgressPercent}%)</span>
                <span className='text-gold font-bold text-xs'>
                  {formatNaira(remainingAmount)} remaining
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>

          {/* Quick Action Shortcuts Card */}
          <div className='bg-white text-black p-6 rounded-lg border border-border space-y-4 font-sans'>
            <div className='flex items-center gap-2 text-foreground'>
              <Crown className='size-5 text-gold' />
              <h4 className='font-sans text-lg font-bold text-foreground'>Store Management Shortcuts</h4>
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              <Link
                href='/admin/products/new'
                className='flex items-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-border transition-colors rounded font-medium'
              >
                <Plus className='size-4' />
                Add Product
              </Link>

              <Link
                href='/admin/personal-shopper-requests'
                className='flex items-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-border transition-colors rounded font-medium'
              >
                <FileText className='size-4' />
                Shopper Leads
              </Link>

              <Link
                href='/admin/orders'
                className='flex items-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-border transition-colors rounded font-medium'
              >
                <ShoppingCart className='size-4' />
                Manage Orders
              </Link>

              <Link
                href='/admin/categories'
                className='flex items-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-border transition-colors rounded font-medium'
              >
                <FolderTree className='size-4' />
                Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
