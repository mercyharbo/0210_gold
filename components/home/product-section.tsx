import type { CatalogPage } from '@/types/catalog'
import { HomeProductCard } from './product-card'
import { ReadFeedback } from './read-feedback'

type HomeProductSectionProps = {
  id: string
  title: string
  emptyMessage: string
  products?: CatalogPage
  error: unknown
  isLoading: boolean
  handleRetry: () => void
}

export function HomeProductSection({ id, title, emptyMessage, products, error, isLoading, handleRetry }: HomeProductSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className='meere-products'>
      <h2 id={`${id}-title`} className='meere-section-title'>{title}</h2>
      <ReadFeedback loading={isLoading} error={error} hasData={!!products} retry={handleRetry} />
      {products && products.items.length > 0 && (
        <div className='meere-product-grid'>
          {products.items.map((product) => <HomeProductCard key={product.id} product={product} />)}
        </div>
      )}
      {products && !products.items.length && <p className='meere-empty'>{emptyMessage}</p>}
    </section>
  )
}
