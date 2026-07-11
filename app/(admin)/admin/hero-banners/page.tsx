import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireAdmin } from '@/lib/auth/session'
import { getAdminHeroBanners } from '@/lib/hero-banners/admin-hero-banners'
import { cn } from '@/lib/utils'
import { BannerRowActions } from './row-actions'
import { DeleteBannerDialog } from './delete-dialog'

function BannerStatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className='gap-3'>
        <CardTitle className='font-sans text-base font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <span className='font-sans text-3xl font-bold text-foreground'>
          {value}
        </span>
      </CardHeader>
    </Card>
  )
}

function StatusPill({
  active,
  label,
}: {
  active: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        active
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-gray-200 bg-gray-50 text-gray-600',
      )}
    >
      {label}
    </span>
  )
}

export default async function AdminBannersPage() {
  await requireAdmin()

  const banners = await getAdminHeroBanners()
  const activeCount = banners.filter((banner) => banner.is_active).length

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title='Banners'
          description='Manage homepage slideshow promotional banners.'
        />
        <Button asChild className='bg-gold text-white hover:bg-gold/80'>
          <Link href='/admin/hero-banners/new' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add Banner
          </Link>
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <BannerStatCard title='Total Banners' value={banners.length} />
        <BannerStatCard title='Active Banners' value={activeCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='font-sans text-base font-semibold'>
            Slideshow Banners
          </CardTitle>
          <CardDescription className='text-sm'>
            Listing of banners currently configured in the storefront slideshow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Route Link</TableHead>
                <TableHead className='text-center'>Sort Order</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='py-10 text-center text-muted-foreground'
                  >
                    No banners have been created yet.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.image_src ? (
                        <div className='h-14 w-24 overflow-hidden rounded-md border border-border bg-muted'>
                          <Image
                            src={banner.image_src}
                            alt={banner.title}
                            width={96}
                            height={56}
                            unoptimized={banner.image_src.startsWith('http')}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='grid h-14 w-24 place-items-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground'>
                          None
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='font-medium text-foreground'>
                      <Link
                        href={`/admin/hero-banners/${banner.id}`}
                        className='hover:text-gold hover:underline font-semibold'
                      >
                        {banner.title}
                      </Link>
                    </TableCell>
                    <TableCell className='max-w-[200px] truncate text-muted-foreground'>
                      {banner.description}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{banner.route}</TableCell>
                    <TableCell className='text-center'>{banner.sort_order}</TableCell>
                    <TableCell className='text-center'>
                      <StatusPill
                        active={banner.is_active}
                        label={banner.is_active ? 'Active' : 'Draft'}
                      />
                    </TableCell>
                    <TableCell className='text-right'>
                      <BannerRowActions banner={banner} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteBannerDialog />
    </div>
  )
}
