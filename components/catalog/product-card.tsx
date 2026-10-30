import Image from 'next/image'
import Link from 'next/link'
import type { CatalogProduct } from '@/types/catalog'
import { CatalogPriceLabel } from './price'

export function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0]
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <Link
        href={`/products/${product.slug}`}
        className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {image && (
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-600">{product.category.name}</p>
          <h2 className="break-words text-base font-medium">{product.name}</h2>
          <p className="text-sm">
            <CatalogPriceLabel
              price={product.display_price}
              starting={product.pricing_type === 'starting_from'}
            />
          </p>
        </div>
      </Link>
      {product.stock === 0 && <p className="text-xs text-gray-600">Out of stock</p>}
    </article>
  )
}
