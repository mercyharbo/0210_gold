import { Button } from '@/components/ui/button'
import type { CatalogPage } from '@/types/catalog'

export function CatalogPagination({ productResults, isUpdatingProducts, onPageChange }: {
  productResults: CatalogPage
  isUpdatingProducts: boolean
  onPageChange: (pageNumber: number) => void
}) {
  const { page: currentPage, page_size: productsPerPage, total: totalProducts } = productResults

  return (
    <nav aria-label='Product pages' className='flex flex-wrap items-center justify-between gap-4 pt-6 text-sm'>
      <Button
        variant='outline'
        className='h-11 rounded-none border-black text-black'
        disabled={currentPage <= 1 || isUpdatingProducts}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      <span>{totalProducts} {totalProducts === 1 ? 'piece' : 'pieces'} · Page {currentPage}</span>

      <Button
        variant='outline'
        className='h-11 rounded-none border-black text-black'
        disabled={currentPage * productsPerPage >= totalProducts || isUpdatingProducts}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
