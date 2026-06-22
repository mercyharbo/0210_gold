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
import {
  formatAdminProductPrice,
  getAdminProducts,
} from '@/lib/products/admin-products'

function getStockLabel(stock: number) {
  if (stock === 0) {
    return 'Out of Stock'
  }

  if (stock <= 5) {
    return 'Low Stock'
  }

  return 'In Stock'
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, ' ')
}

function ProductStatCard({ title, value }: { title: string; value: number }) {
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

export default async function AdminProductsPage() {
  const products = await getAdminProducts()
  const outOfStockCount = products.filter(
    (product) => product.stock === 0,
  ).length
  const categoryCount = new Set(
    products.map((product) => product.category?.slug).filter(Boolean),
  ).size

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title='Products'
          description='Manage catalog items, prices, inventory, and details.'
        />
        <Button asChild className='bg-gold text-white hover:bg-gold/80'>
          <Link href='/admin/products/new' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add Product
          </Link>
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <ProductStatCard title='Total Products' value={products.length} />
        <ProductStatCard title='Categories Covered' value={categoryCount} />
        <ProductStatCard title='Out of Stock' value={outOfStockCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='font-sans text-base font-semibold'>
            Products Catalog
          </CardTitle>
          <CardDescription className='text-sm'>
            Listing of all currently defined items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className='text-center'>Stock</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='py-10 text-center text-muted-foreground'
                  >
                    No products have been created yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className='h-12 w-12 overflow-hidden rounded-md border border-border bg-muted'>
                        <Image
                          src={product.image_src}
                          alt={product.image_alt}
                          width={48}
                          height={48}
                          unoptimized
                          className='h-full w-full object-cover'
                        />
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-foreground'>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className='hover:text-gold hover:underline'
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {product.category?.name ?? 'uncategorized'}
                    </TableCell>
                    <TableCell>
                      {formatAdminProductPrice(
                        product.pricing_type,
                        product.price,
                      )}
                    </TableCell>
                    <TableCell className='text-center text-muted-foreground'>
                      <div className='flex flex-col items-center gap-1'>
                        <span>{product.stock}</span>
                        <span className='text-xs'>
                          {getStockLabel(product.stock)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-center'>
                      <span className='inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs capitalize font-semibold text-muted-foreground'>
                        {getStatusLabel(product.status)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          Preview
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
