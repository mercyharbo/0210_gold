'use client'

import {
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: MessageSquare,
  },
  {
    title: 'Personal Shopper',
    href: '/admin/personal-shopper-requests',
    icon: Sparkles,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon' className='border-r border-gold bg-gold'>
      <SidebarHeader className='flex h-16 items-center justify-between px-6 bg-gold text-white'>
        <Link
          href='/admin'
          className='flex items-center gap-2.5 text-lg font-bold tracking-tight text-white group-data-[collapsible=icon]:hidden'
        >
          <span>0210</span> Gold Admin
        </Link>
        <div className='hidden h-8 w-8 items-center justify-center rounded-lg bg-white text-gold group-data-[collapsible=icon]:flex font-bold'>
          G
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-gold py-4 text-white'>
        <SidebarGroup>
          <SidebarGroupContent className='mt-2'>
            <SidebarMenu className='gap-1 px-2'>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 px-3 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white hover:bg-white/90 hover:text-black'
                          : 'text-white hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className='flex items-center gap-3'
                      >
                        <item.icon className='size-4' />
                        <span className='font-medium group-data-[collapsible=icon]:hidden'>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-white/25 bg-gold p-4 group-data-[collapsible=icon]:p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip='View Store'
              className='h-10 px-3 text-white hover:bg-white/15 hover:text-white'
            >
              <Link href='/' className='flex items-center gap-3'>
                <Store className='size-4 text-white' />
                <span className='font-medium group-data-[collapsible=icon]:hidden'>
                  Back to Store
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
