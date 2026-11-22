import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { CatalogPriceLabel } from '@/components/catalog/price'
import type { CatalogProduct } from '@/types/catalog'

export function HomeProductCard({ product }: { product: CatalogProduct }) {
  const [image, alternate] = product.images
  return (
    <article className="meere-product-card">
      <div className="meere-product-image">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="meere-product-images">
          {image && <Image src={image.url} alt={image.alt} fill
            sizes="(max-width: 767px) 50vw, 25vw" className="object-cover" />}
          {alternate && <Image src={alternate.url} alt="" fill
            sizes="(max-width: 767px) 50vw, 25vw" className="meere-alternate-image object-cover" />}
        </Link>
        <Link href="/profile?tab=wishlist" aria-label={`Favorites for ${product.name}`} className="meere-product-heart">
          <Heart className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <Link href={`/products/${product.slug}`}><h3 className="meere-product-name">{product.name}</h3></Link>
        <p className="text-xs"><CatalogPriceLabel price={product.display_price} starting={product.pricing_type === 'starting_from'} /></p>
      </div>
      {product.stock === 0 && <p className="text-xs text-red-700">Out of stock</p>}
    </article>
  )
}
