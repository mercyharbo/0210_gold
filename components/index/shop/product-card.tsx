import Image from 'next/image'
import Link from 'next/link'
import {
  formatProductPrice,
  getProductLabelClassName,
  type Product,
} from './shop-data'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className='group block text-black'>
      <div className='relative aspect-[4/5] overflow-hidden bg-muted'>
        {product.label ? (
          <span
            className={`absolute left-3 top-3 z-10 px-3 py-1 text-[11px] font-medium uppercase ${getProductLabelClassName(product.label)}`}
          >
            {product.label}
          </span>
        ) : null}
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes='(min-width: 120rem) 20vw, (min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw'
          unoptimized
          className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
        />
      </div>

      <div className='flex flex-col gap-0.5 text-black'>
        <h3 className='text-[13px] font-medium leading-5'>{product.name}</h3>
        <p className='text-[12px] font-medium text-muted-foreground'>{formatProductPrice(product)}</p>
      </div>
    </Link>
  )
}
