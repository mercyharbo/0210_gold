'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type RevenuePoint = {
  month: string
  revenue: number
  orders: number
}

type RevenueTrendChartProps = {
  data?: RevenuePoint[]
}

const fallbackData: RevenuePoint[] = [
  { month: 'Jan', revenue: 0, orders: 0 },
  { month: 'Feb', revenue: 0, orders: 0 },
  { month: 'Mar', revenue: 0, orders: 0 },
  { month: 'Apr', revenue: 0, orders: 0 },
  { month: 'May', revenue: 0, orders: 0 },
  { month: 'Jun', revenue: 0, orders: 0 },
  { month: 'Jul', revenue: 0, orders: 0 },
  { month: 'Aug', revenue: 0, orders: 0 },
  { month: 'Sep', revenue: 0, orders: 0 },
  { month: 'Oct', revenue: 0, orders: 0 },
  { month: 'Nov', revenue: 0, orders: 0 },
  { month: 'Dec', revenue: 0, orders: 0 },
]

export function RevenueTrendChart({ data = fallbackData }: RevenueTrendChartProps) {
  const [timeframe, setTimeframe] = useState<'year' | '6months' | '3months'>('year')

  const chartData = useMemo(() => {
    if (timeframe === '6months') {
      return data.slice(-6)
    }
    if (timeframe === '3months') {
      return data.slice(-3)
    }
    return data
  }, [data, timeframe])

  return (
    <div className='flex flex-col gap-4 bg-white border border-border p-6 rounded-lg font-sans'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4'>
        <div>
          <span className='text-xs font-semibold text-gold block'>
            Financial Analytics
          </span>
          <h3 className='font-sans text-base font-semibold text-foreground'>
            Revenue & Sales Trajectory
          </h3>
        </div>

        <Tabs
          value={timeframe}
          onValueChange={(val) => setTimeframe(val as 'year' | '6months' | '3months')}
          className='self-start sm:self-auto'
        >
          <TabsList className='bg-muted border border-border p-1 h-auto gap-1'>
            <TabsTrigger
              value='year'
              className='text-xs font-semibold px-3 py-1 data-[state=active]:bg-black data-[state=active]:text-white rounded transition-colors'
            >
              This Year
            </TabsTrigger>
            <TabsTrigger
              value='6months'
              className='text-xs font-semibold px-3 py-1 data-[state=active]:bg-black data-[state=active]:text-white rounded transition-colors'
            >
              6 Months
            </TabsTrigger>
            <TabsTrigger
              value='3months'
              className='text-xs font-semibold px-3 py-1 data-[state=active]:bg-black data-[state=active]:text-white rounded transition-colors'
            >
              3 Months
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart Canvas */}
      <div className='h-[320px] w-full pt-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id='goldGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#D4AF37' stopOpacity={0.4} />
                <stop offset='95%' stopColor='#D4AF37' stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#F1F5F9' />

            <XAxis
              dataKey='month'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload as RevenuePoint
                  return (
                    <div className='bg-black text-white p-3 border border-gold/40 rounded-md space-y-1 text-xs font-sans'>
                      <p className='font-bold text-gold border-b border-white/10 pb-1'>
                        {dataPoint.month}
                      </p>
                      <p className='font-semibold text-white'>
                        Revenue: {formatNaira(dataPoint.revenue)}
                      </p>
                      <p className='text-neutral-300'>
                        Fulfilled Orders: {dataPoint.orders}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />

            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#D4AF37'
              strokeWidth={3}
              fillOpacity={1}
              fill='url(#goldGradient)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
