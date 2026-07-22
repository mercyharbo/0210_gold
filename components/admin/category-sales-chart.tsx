'use client'

import { useMemo } from 'react'
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { formatNaira } from '@/components/index/shop/shop-data'

type CategorySalesItem = {
  name: string
  value: number
  color: string
}

type CategorySalesChartProps = {
  data?: CategorySalesItem[]
}

const fallbackCategoryData: CategorySalesItem[] = [
  { name: 'Jewellery & Gold', value: 0, color: '#D4AF37' },
  { name: 'Abaya & Modest', value: 0, color: '#10B981' },
  { name: 'Bags & Accessories', value: 0, color: '#8B5CF6' },
]

export function CategorySalesChart({ data = fallbackCategoryData }: CategorySalesChartProps) {
  const chartData = data.length > 0 ? data : fallbackCategoryData

  // Attach fill property directly to data items (replacing deprecated Cell component)
  const formattedChartData = useMemo(
    () => chartData.map((item) => ({ ...item, fill: item.color })),
    [chartData]
  )

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className='flex flex-col gap-4 bg-white border border-border p-6 rounded-lg font-sans h-full justify-between'>
      <div className='border-b border-border pb-3'>
        <span className='text-xs font-semibold text-gold block'>
          Category Analytics
        </span>
        <h3 className='font-sans text-lg font-bold text-foreground'>
          Sales Distribution by Category
        </h3>
      </div>

      {/* Donut Chart Canvas */}
      <div className='h-[250px] w-full relative flex items-center justify-center'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategorySalesItem
                  const percent = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : '0'
                  return (
                    <div className='bg-black text-white p-3 border border-gold/40 rounded-md space-y-1 text-xs font-sans'>
                      <p className='font-bold text-gold'>{item.name}</p>
                      <p className='font-semibold'>{formatNaira(item.value)}</p>
                      <p className='text-neutral-400'>{percent}% of category total</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Pie
              data={formattedChartData}
              cx='50%'
              cy='50%'
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
              dataKey='value'
              stroke='transparent'
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center font-sans px-2'>
          <span className='text-[10px] uppercase text-muted-foreground font-semibold block'>
            Total Sales
          </span>
          <span className='font-sans font-bold text-xs sm:text-sm text-foreground truncate max-w-[120px]'>
            {formatNaira(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className='space-y-2 border-t border-border pt-3 text-xs font-sans'>
        {chartData.map((cat) => {
          const percent = totalRevenue > 0 ? ((cat.value / totalRevenue) * 100).toFixed(0) : '0'
          return (
            <div key={cat.name} className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span
                  className='size-2.5 rounded-full shrink-0'
                  style={{ backgroundColor: cat.color }}
                />
                <span className='text-muted-foreground font-medium truncate max-w-[140px]'>
                  {cat.name}
                </span>
              </div>
              <span className='font-bold text-foreground'>
                {formatNaira(cat.value)}{' '}
                <span className='text-neutral-400 font-normal'>({percent}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
