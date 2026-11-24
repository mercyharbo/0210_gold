import { CatalogPriceLabel } from '@/components/catalog/price'
import type { CatalogProduct } from '@/types/catalog'
import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function HomeProductCard({ product, imageSizes = '(max-width: 767px) 50vw, 25vw' }: {
  product: CatalogProduct
  imageSizes?: string
}) {
  const [image, alternate] = product.images

  return (
    <article className='flex min-w-0 flex-col gap-2'>
      <div className='relative aspect-[7/10] bg-[#f0f0f0]'>
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className='group absolute inset-0 overflow-hidden'
        >
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes={imageSizes}
              className='object-cover'
            />
          )}
          {alternate && (
            <Image
              src={alternate.url}
              alt=''
              fill
              sizes={imageSizes}
              className='object-cover opacity-0 transition-opacity duration-300 ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none'
            />
          )}
        </Link>
        <Link
          href='/profile?tab=wishlist'
          aria-label={`Favorites for ${product.name}`}
          className='absolute left-4 top-4'
        >
          <Heart className='size-4' strokeWidth={1.5} />
        </Link>
      </div>
      <div className='flex flex-col gap-1'>
        <Link href={`/products/${product.slug}`}>
          <h3 className='break-words text-sm font-semibold leading-[1.6]'>{product.name}</h3>
        </Link>
        <p className='text-sm font-medium'>
          <CatalogPriceLabel
            price={product.display_price}
            starting={product.pricing_type === 'starting_from'}
          />
        </p>
      </div>
      {product.stock === 0 && (
        <p className='text-xs text-red-700'>Out of stock</p>
      )}
    </article>
  )
}
