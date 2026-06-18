import { ProductCard } from './product-card'
import type { Product } from './shop-data'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className='border border-black/10 px-5 py-16 text-center'>
        <h3 className='font-heading text-3xl font-semibold'>No items found</h3>
        <p className='mx-auto mt-3 max-w-md text-sm leading-6 text-black/65'>
          Try another category, search term, or sort option.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
