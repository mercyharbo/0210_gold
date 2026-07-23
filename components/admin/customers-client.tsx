'use client'

import {
  Copy,
  Eye,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  ShoppingBag,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { formatNaira } from '@/components/index/shop/shop-data'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export type CustomerRecord = {
  id: string
  name: string
  first_name?: string
  last_name?: string
  email: string
  phone: string
  location: string
  country: string
  ordersCount: number
  totalSpent: number
  role: string
  preferences: string[]
  created_at: string
}

type CustomersClientProps = {
  customers: CustomerRecord[]
}

export function CustomersClient({ customers }: CustomersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filter customers by search term
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    )
  })

  // Calculate Metrics
  const totalRegistered = customers.length
  const repeatBuyers = customers.filter((c) => c.ordersCount > 1).length
  const internationalClients = customers.filter(
    (c) =>
      c.country.toLowerCase() !== 'nigeria' &&
      !c.location.toLowerCase().includes('nigeria')
  ).length

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className='flex flex-col gap-6 bg-white text-black font-sans'>
      {/* Top Metrics Cards */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <AdminPlaceholderCard
          title='Total Registered Clients'
          value={totalRegistered.toLocaleString()}
          icon={UserCheck}
        />
        <AdminPlaceholderCard
          title='Repeat Buyers'
          value={repeatBuyers.toLocaleString()}
          icon={ShoppingBag}
        />
        <AdminPlaceholderCard
          title='International Clients'
          value={internationalClients.toLocaleString()}
          icon={Globe}
        />
      </div>

      {/* Customer Table Card */}
      <AdminPlaceholderCard
        title='Customer Base'
        description='Complete client database, purchase frequency, and billing activity'
      >
        <div className='flex flex-col gap-4'>
          {/* Search Bar */}
          <div className='relative max-w-sm'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search client name, email, location...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 h-9 text-xs rounded-none border-black/20 focus-visible:ring-gold'
            />
          </div>

          {/* Table Container */}
          <div className='overflow-x-auto border border-black/10'>
            <table className='w-full text-left border-collapse text-xs'>
              <thead>
                <tr className='border-b border-black/10 bg-neutral-100 font-semibold text-black uppercase tracking-wider'>
                  <th className='py-3 px-4'>Client Name</th>
                  <th className='py-3 px-4'>Email Address</th>
                  <th className='py-3 px-4'>Location</th>
                  <th className='py-3 px-4 text-center'>Orders</th>
                  <th className='py-3 px-4 text-right'>Total Spent</th>
                  <th className='py-3 px-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-black/10'>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='py-8 text-center text-muted-foreground'>
                      No customers match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className='hover:bg-neutral-50 transition-colors'>
                      <td className='py-3.5 px-4 font-semibold text-black'>
                        <div className='flex flex-col'>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className='hover:underline hover:text-gold transition-colors font-medium text-sm'
                          >
                            {customer.name}
                          </Link>
                          <span className='text-3xs uppercase font-mono text-neutral-500 tracking-wider'>
                            {customer.role === 'admin' || customer.role === 'super_admin'
                              ? 'Admin Staff'
                              : customer.role === 'guest'
                                ? 'Guest Client'
                                : 'Registered Client'}
                          </span>
                        </div>
                      </td>
                      <td className='py-3.5 px-4 text-neutral-700 font-mono text-xs'>
                        {customer.email}
                      </td>
                      <td className='py-3.5 px-4 text-neutral-600 flex items-center gap-1.5 pt-4'>
                        <MapPin className='size-3 text-gold shrink-0' />
                        <span>{customer.location}</span>
                      </td>
                      <td className='py-3.5 px-4 text-center font-mono font-bold text-black'>
                        {customer.ordersCount}
                      </td>
                      <td className='py-3.5 px-4 text-right font-mono font-bold text-black'>
                        {formatNaira(customer.totalSpent)}
                      </td>

                      {/* Dropdown Menu Actions Row */}
                      <td className='py-3.5 px-4 text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              className='cursor-pointer text-neutral-700 hover:text-black hover:bg-neutral-200/60 rounded-none'
                            >
                              <MoreHorizontal className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='end'
                            className='w-48 bg-white text-black border border-black/10 shadow-lg rounded-none p-1 font-sans text-xs'
                          >
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/customers/${customer.id}`}
                                className='flex items-center gap-2 cursor-pointer py-2 px-2.5 hover:bg-neutral-100 font-medium'
                              >
                                <Eye className='size-3.5 text-gold' />
                                View Profile Details
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <a
                                href={`mailto:${customer.email}`}
                                className='flex items-center gap-2 cursor-pointer py-2 px-2.5 hover:bg-neutral-100 font-medium'
                              >
                                <Mail className='size-3.5 text-neutral-600' />
                                Send Email
                              </a>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleCopy(customer.email, customer.id)}
                              className='flex items-center gap-2 cursor-pointer py-2 px-2.5 hover:bg-neutral-100 font-medium'
                            >
                              <Copy className='size-3.5 text-neutral-600' />
                              {copiedId === customer.id ? 'Copied Email!' : 'Copy Email'}
                            </DropdownMenuItem>

                            {customer.phone && customer.phone !== 'N/A' && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`tel:${customer.phone}`}
                                  className='flex items-center gap-2 cursor-pointer py-2 px-2.5 hover:bg-neutral-100 font-medium'
                                >
                                  <Phone className='size-3.5 text-neutral-600' />
                                  Call Phone
                                </a>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className='my-1 border-t border-black/10' />

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                                className='flex items-center gap-2 cursor-pointer py-2 px-2.5 hover:bg-neutral-100 font-medium text-black'
                              >
                                <ShoppingBag className='size-3.5 text-gold' />
                                View Orders
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPlaceholderCard>
    </div>
  )
}
