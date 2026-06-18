import Image from 'next/image'
import Link from 'next/link'
import { formatNaira, type Product } from './shop-data'

type ProductCardProps = {
  product: Product
}

function getLabelClassName(label: string) {
  if (label === 'New in') {
    return 'bg-[#b91c1c] text-white'
  }

  if (label === 'Best seller') {
    return 'bg-[#d7a83f] text-black'
  }

  return 'bg-black text-white'
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className='group block text-black'>
      <div className='relative aspect-square overflow-hidden bg-[#f4f4f2]'>
        {product.label ? (
          <span
            className={`absolute left-3 top-3 z-10 px-3 py-1 text-[11px] font-medium uppercase ${getLabelClassName(product.label)}`}
          >
            {product.label}
          </span>
        ) : null}
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes='(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw'
          className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
        />
      </div>

      <div className='mt-3 flex items-start justify-between gap-4 text-xs uppercase text-black'>
        <h3 className='font-medium leading-5'>{product.name}</h3>
        <p className='shrink-0 font-medium'>{formatNaira(product.price)}</p>
      </div>
    </Link>
  )
}
