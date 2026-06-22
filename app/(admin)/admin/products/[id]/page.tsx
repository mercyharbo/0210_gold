import { ChevronLeft, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
  formatAdminProductPrice,
  getAdminProductById,
} from '@/lib/products/admin-products'

type PageProps = {
  params: Promise<{ id: string }>
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, ' ')
}

export default async function AdminProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getAdminProductById(id)

  if (!product) {
    notFound()
  }

  const productImages =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_src]

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title={product.name}
          description='View product configuration, prices, stock, and images.'
        />
        <Button asChild variant='outline' size='sm'>
          <Link href='/admin/products' className='flex items-center gap-2'>
            <ChevronLeft className='size-4' />
            Back to products
          </Link>
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Information
              </CardTitle>
              <CardDescription className='text-sm'>
                Customer-facing product details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 py-2 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Product Name
                  </span>
                  <span className='text-sm font-medium text-foreground'>
                    {product.name}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Slug
                  </span>
                  <span className='text-sm font-medium text-foreground'>
                    {product.slug}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Category
                  </span>
                  <span className='text-sm font-medium text-foreground'>
                    {product.category?.name ?? 'Uncategorized'}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Label
                  </span>
                  <span className='text-sm font-medium text-foreground'>
                    {product.label ?? 'No label'}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5 sm:col-span-2'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Description
                  </span>
                  <span className='text-sm leading-relaxed text-foreground'>
                    {product.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Pricing and Inventory
              </CardTitle>
              <CardDescription className='text-sm'>
                Value, availability, and admin status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 py-2 sm:grid-cols-3'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Price
                  </span>
                  <span className='text-base font-semibold text-foreground'>
                    {formatAdminProductPrice(
                      product.pricing_type,
                      product.price,
                    )}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Stock
                  </span>
                  <span className='text-base font-semibold text-foreground'>
                    {product.stock}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Status
                  </span>
                  <span className='inline-flex w-fit items-center rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize'>
                    {getStatusLabel(product.status)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Attributes
              </CardTitle>
              <CardDescription className='text-sm'>
                Selected sizes, colors, and details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 py-2 sm:grid-cols-3'>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Sizes
                  </span>
                  <span className='text-sm text-foreground'>
                    {product.sizes.length > 0
                      ? product.sizes.join(', ')
                      : 'No sizes selected'}
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Colors
                  </span>
                  <span className='text-sm text-foreground'>
                    {product.colors.length > 0
                      ? product.colors.join(', ')
                      : 'No colors selected'}
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Details
                  </span>
                  <span className='text-sm text-foreground'>
                    {product.details.length > 0
                      ? product.details.join(', ')
                      : 'No details added'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Images
              </CardTitle>
              <CardDescription className='text-sm'>
                Uploaded media for this catalog item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-3'>
                <div className='overflow-hidden rounded-lg border border-border bg-muted'>
                  <Image
                    src={productImages[0]}
                    alt={product.image_alt}
                    width={720}
                    height={720}
                    unoptimized
                    className='aspect-square w-full object-cover'
                  />
                </div>
                {productImages.length > 1 ? (
                  <div className='grid grid-cols-3 gap-2'>
                    {productImages.slice(1).map((imageUrl) => (
                      <div
                        key={imageUrl}
                        className='overflow-hidden rounded-md border border-border bg-muted'
                      >
                        <Image
                          src={imageUrl}
                          alt={product.image_alt}
                          width={180}
                          height={180}
                          unoptimized
                          className='aspect-square w-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex flex-col gap-1'>
                <CardTitle className='font-sans text-base font-semibold'>
                  Delete Product
                </CardTitle>
                <CardDescription className='text-sm'>
                  Delete this product from the catalog.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant='destructive'
                className='flex h-10 w-full justify-center gap-2'
              >
                <Trash2 className='size-4' />
                Delete Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
