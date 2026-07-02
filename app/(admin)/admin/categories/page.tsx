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
import { getAdminCategories } from '@/lib/categories/admin-categories'
import { cn } from '@/lib/utils'

function CategoryStatCard({ title, value }: { title: string; value: number }) {
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

export default async function AdminCategoriesPage() {
  await requireAdmin()

  const categories = await getAdminCategories()
  const activeCount = categories.filter((category) => category.is_active).length
  const featuredCount = categories.filter(
    (category) => category.is_featured,
  ).length

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title='Categories'
          description='Manage product categorization and storefront collection cards.'
        />
        <Button asChild className='bg-gold text-white hover:bg-gold/80'>
          <Link href='/admin/categories/new' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add Category
          </Link>
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <CategoryStatCard title='Total Categories' value={categories.length} />
        <CategoryStatCard title='Active Categories' value={activeCount} />
        <CategoryStatCard title='Featured Cards' value={featuredCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='font-sans text-base font-semibold'>
            Category Catalog
          </CardTitle>
          <CardDescription className='text-sm'>
            Listing of product categories and storefront card settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className='text-center'>Featured</TableHead>
                <TableHead className='text-center'>Active</TableHead>
                <TableHead className='text-center'>Products</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='py-10 text-center text-muted-foreground'
                  >
                    No categories have been created yet.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_src ? (
                        <div className='h-14 w-14 overflow-hidden rounded-md border border-border bg-muted'>
                          <Image
                            src={category.image_src}
                            alt={category.image_alt ?? category.name}
                            width={56}
                            height={56}
                            unoptimized={category.image_src.startsWith('http')}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='grid h-14 w-14 place-items-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground'>
                          None
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='font-medium text-foreground'>
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className='hover:text-gold hover:underline'
                      >
                        {category.name}
                      </Link>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      /{category.slug}
                    </TableCell>
                    <TableCell>{category.category_type}</TableCell>
                    <TableCell className='text-center'>
                      <StatusPill
                        active={category.is_featured}
                        label={category.is_featured ? 'Featured' : 'Standard'}
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusPill
                        active={category.is_active}
                        label={category.is_active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell className='text-center text-muted-foreground'>
                      {category.product_count}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/admin/categories/${category.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
