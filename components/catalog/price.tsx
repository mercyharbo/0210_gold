import type { CatalogPrice } from '@/types/catalog'

export function CatalogPriceLabel({ price, starting = false }: { price: CatalogPrice; starting?: boolean }) {
  if (price.reason === 'PRICE_ON_REQUEST') return <span>Price on request</span>
  if (price.amount === null || !price.available) return <span>Price currently unavailable</span>
  return (
    <span>
      {starting ? 'From ' : ''}
      {new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(price.amount)}
    </span>
  )
}
