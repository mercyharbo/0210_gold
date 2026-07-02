import {
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₦45,230,000',
      description: '+12.5% from last month',
      icon: ShoppingBag,
    },
    {
      title: 'Active Orders',
      value: '12',
      description: '4 pending, 8 in transit',
      icon: ShoppingCart,
    },
    {
      title: 'Requests',
      value: '8',
      description: '5 new requests today',
      icon: Sparkles,
    },
    {
      title: 'Active Customers',
      value: '1,240',
      description: '+45 new signups this week',
      icon: Users,
    },
  ]

  const activities = [
    {
      id: 1,
      user: 'Chidi Benson',
      action: 'placed order #1024',
      time: '2 hours ago',
      amount: '₦750,000',
    },
    {
      id: 2,
      user: 'Amara Kalu',
      action: "made a request for 'Hermès Birkin 25'",
      time: '4 hours ago',
      status: 'New',
    },
    {
      id: 3,
      user: 'Tunde Bakare',
      action: "left a 5-star review on '18k Gold Figarope Chain'",
      time: '1 day ago',
    },
    {
      id: 4,
      user: 'Sarah Jenkins',
      action: 'placed order #1023',
      time: '1 day ago',
      amount: '₦1,200,000',
    },
  ]

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        title='Dashboard'
        description='Welcome to your FM LUXE store management dashboard.'
      />
      <div className='flex flex-col gap-6'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <AdminPlaceholderCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          <AdminPlaceholderCard
            title='Recent Activity'
            description='Latest actions across the store storefront'
            className='lg:col-span-2'
          >
            <div className='divide-y divide-border'>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between py-3 first:pt-0 last:pb-0'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-sm font-semibold text-foreground'>
                      {activity.user}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {activity.action}
                    </span>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className='text-xs font-medium text-foreground'>
                        {activity.amount}
                      </span>
                    )}
                    {activity.status && (
                      <span className='inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-3xs font-semibold text-gold uppercase tracking-wider'>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AdminPlaceholderCard>

          <AdminPlaceholderCard
            title='Business Performance'
            description='Overview of sales performance this month'
            icon={TrendingUp}
          >
            <div className='flex flex-col gap-4 py-2'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Monthly Goal</span>
                <span className='font-semibold text-foreground'>
                  ₦60,000,000
                </span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-gold h-2 rounded-full'
                  style={{ width: '75%' }}
                />
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Progress (75%)</span>
                <span className='text-gold font-medium'>
                  ₦14,770,000 remaining
                </span>
              </div>
            </div>
          </AdminPlaceholderCard>
        </div>
      </div>
    </div>
  )
}
