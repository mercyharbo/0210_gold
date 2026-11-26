'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowUpRight, ChevronRight, Heart } from 'lucide-react'

import { ApiFeedback } from '@/components/ui/api-feedback'
import { Button } from '@/components/ui/button'
import { useCatalogPrice } from '@/hooks/use-catalog-endpoint'
import { useStoreProduct } from '@/stores/hooks/use-store-product'
import type { CatalogProduct } from '@/types/catalog'

import { CatalogPriceLabel } from './price'
import { ProductGallery } from './product-gallery'
import { ProductInformation } from './product-information'
import { ProductOptions } from './product-options'

export function CatalogProductDetail({ product }: { product: CatalogProduct }) {
  const { productId, karat, select, reset } = useStoreProduct()
  const selectedKarat = productId === product.id ? karat : null

  // Retain the existing server-calculated price preview; no new API integration.
  const { data, error, isValidating, mutate } = useCatalogPrice(product.slug, selectedKarat)

  useEffect(() => {
    select({ productId: product.id, karat: null, size: null, color: null })

    return reset
  }, [product.id, select, reset])

  return (
    <section className='mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-5 py-8 sm:px-8 lg:gap-10 lg:px-12 lg:py-12'>
      <nav aria-label='Breadcrumb' className='min-w-0'>
        <ol className='flex flex-wrap items-center gap-2 text-sm text-gray-600'>
          <li>
            <Link href='/shop' className='transition-colors hover:text-[#e10600]'>
              Shop
            </Link>
          </li>
          <li aria-hidden='true'>
            <ChevronRight className='size-3' />
          </li>
          <li>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
              className='transition-colors hover:text-[#e10600]'
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden='true'>
            <ChevronRight className='size-3' />
          </li>
          <li aria-current='page' className='break-words text-black'>
            {product.name}
          </li>
        </ol>
      </nav>

      <div className='grid min-w-0 gap-8 lg:grid-cols-2 lg:items-start lg:gap-16'>
        <ProductGallery key={product.id} images={product.images} productName={product.name} />

        <div className='flex min-w-0 flex-col gap-7 lg:sticky lg:top-28'>
          <div className='flex flex-col gap-4'>
            {product.label && (
              <p className='text-xs font-medium capitalize text-[#e10600]'>{product.label}</p>
            )}

            <h1 className='break-words text-[28px] font-medium leading-tight md:text-[34px]'>
              {product.name}
            </h1>

            <div aria-live='polite' aria-busy={isValidating} className='flex flex-col gap-2'>
              <p className='text-xl'>
                <CatalogPriceLabel
                  price={data?.data ?? product.display_price}
                  starting={product.pricing_type === 'starting_from' && !selectedKarat}
                />
              </p>
              {isValidating && <p className='text-xs text-gray-600'>Updating price...</p>}
            </div>

            <ApiFeedback
              message={error?.message}
              error
              onRetry={() => void mutate()}
              isRetrying={isValidating}
            />

            {product.description && (
              <p className='whitespace-pre-line text-sm leading-7 text-gray-600'>
                {product.description}
              </p>
            )}
          </div>

          <ProductOptions product={product} />

          <div className='flex flex-col gap-4'>
            <p className='flex items-center gap-2 text-sm'>
              <span className={`size-2 rounded-full ${product.stock > 0 ? 'bg-black' : 'bg-gray-400'}`} />
              {product.stock > 0 ? 'In stock' : 'Out of stock'}
            </p>

            <div className='flex gap-3'>
              <Button
                type='button'
                disabled
                aria-describedby='product-shopping-availability'
                className='h-12 flex-1 rounded-none bg-black text-white hover:bg-[#e10600] disabled:opacity-60'
              >
                {product.stock > 0 ? 'Add to bag' : 'Out of stock'}
                <ArrowUpRight data-icon='inline-end' />
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled
                aria-label='Save to wishlist, currently unavailable'
                aria-describedby='product-shopping-availability'
                className='size-12 rounded-none border-gray-300'
              >
                <Heart className='size-5' strokeWidth={1.5} />
              </Button>
            </div>

            <p id='product-shopping-availability' className='text-xs leading-5 text-gray-600'>
              Online checkout and saved items are currently unavailable.
            </p>
          </div>

          <ProductInformation product={product} />

          <p className='text-sm text-gray-600'>
            Have a question about this piece?{' '}
            <Link href='/contact' className='text-black underline underline-offset-4 hover:text-[#e10600]'>
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
