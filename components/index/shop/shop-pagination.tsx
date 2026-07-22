'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ShopPaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function ShopPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ShopPaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 pt-6 mt-8 text-xs'>
      <p className='text-muted-foreground'>
        Showing <span className='font-semibold text-black'>{startItem}</span> to{' '}
        <span className='font-semibold text-black'>{endItem}</span> of{' '}
        <span className='font-semibold text-black'>{totalItems}</span> items
      </p>

      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='xs'
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className='h-8 px-2.5 rounded-none border-black/20 text-black hover:border-black cursor-pointer disabled:opacity-40'
        >
          <ChevronLeft className='size-3.5 mr-1' />
          Previous
        </Button>

        <div className='flex items-center gap-1'>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`size-8 text-xs font-semibold transition-colors ${
                currentPage === p
                  ? 'bg-black text-white'
                  : 'border border-black/10 bg-white text-black hover:border-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <Button
          variant='outline'
          size='xs'
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className='h-8 px-2.5 rounded-none border-black/20 text-black hover:border-black cursor-pointer disabled:opacity-40'
        >
          Next
          <ChevronRight className='size-3.5 ml-1' />
        </Button>
      </div>
    </div>
  )
}
