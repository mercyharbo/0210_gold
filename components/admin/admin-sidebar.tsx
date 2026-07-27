'use client'

import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
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
    title: 'Banners',
    href: '/admin/hero-banners',
    icon: Images,
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
    icon: FileText,
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
    <Sidebar collapsible='icon' className='border-r border-gold bg-gold font-sans'>
      <SidebarHeader className='flex h-16 items-center justify-between px-6 bg-gold text-white group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center'>
        <Link
          href='/admin'
          className='flex items-center gap-2.5 text-lg font-bold text-white group-data-[collapsible=icon]:hidden'
        >
          <span>FM</span> LUXE Admin
        </Link>
        <div className='hidden h-9 w-9 items-center justify-center rounded-lg bg-white text-gold group-data-[collapsible=icon]:flex font-bold text-sm shadow-sm shrink-0'>
          G
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-gold py-4 text-white no-scrollbar'>
        <SidebarGroup className='group-data-[collapsible=icon]:px-0'>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1.5 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center'>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.title} className='group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center'>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 px-3 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${
                        isActive
                          ? 'bg-white/20 text-white hover:bg-white/90 hover:text-black'
                          : 'text-white hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className='flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-3 w-full'
                      >
                        <item.icon className='size-4 shrink-0' />
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

      <SidebarFooter className='border-t border-white/25 bg-gold p-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center'>
        <SidebarMenu className='group-data-[collapsible=icon]:items-center'>
          <SidebarMenuItem className='group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center'>
            <SidebarMenuButton
              asChild
              tooltip='View Store'
              className='h-10 px-3 text-white hover:bg-white/15 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'
            >
              <Link href='/' className='flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-3 w-full'>
                <Store className='size-4 text-white shrink-0' />
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
