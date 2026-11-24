import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { CatalogPriceLabel } from '@/components/catalog/price'
import type { CatalogProduct } from '@/types/catalog'
import { ProductActions } from './product-actions'

export function ProductsTable({ products, disabled, onDelete }: {
  products: CatalogProduct[]; disabled: boolean
  onDelete: (product: CatalogProduct, trigger: HTMLButtonElement | null) => void
}) {
  return (
    <Table className='min-w-2xl'>
      <TableHeader className='bg-gray-50'>
        <TableRow className='hover:bg-transparent'>
          <TableHead className='h-11 px-5'>Product</TableHead><TableHead className='px-4'>Category</TableHead>
          <TableHead className='px-4'>Price</TableHead><TableHead className='px-4'>Stock</TableHead>
          <TableHead className='px-4'>Status</TableHead><TableHead className='px-4'>Label</TableHead>
          <TableHead className='px-5 text-right'><span className='sr-only'>Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!products.length && <TableRow><TableCell colSpan={7} className='py-12 text-center'>
          <div className='flex flex-col items-center gap-3'>
            <Package className='size-7 text-gray-400' aria-hidden='true' />
            <p className='font-medium'>No products found.</p>
            <p className='text-sm text-gray-600'>Add a product or adjust your filters.</p>
          </div>
        </TableCell></TableRow>}
        {products.map((product) => (
          <TableRow key={product.id} className='hover:bg-gray-50/70'>
            <TableCell className='max-w-sm whitespace-normal px-5 py-4'>
              <div className='flex items-center gap-3'>
                {product.images[0]
                  ? <Image src={product.images[0].url} alt={product.images[0].alt} width={48} height={48} className='size-12 shrink-0 rounded-md border border-border object-cover' />
                  : <span className='flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-100'><Package className='size-5 text-gray-400' aria-hidden='true' /></span>}
                <div className='flex min-w-0 flex-col gap-1'>
                  <Link href={`/admin/products/${encodeURIComponent(product.id)}`} className='break-words font-medium hover:text-gold hover:underline'>{product.name}</Link>
                  <span className='break-all text-xs text-gray-600'>{product.slug}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className='px-4 text-gray-600'>{product.category.name}</TableCell>
            <TableCell className='px-4'><CatalogPriceLabel price={product.display_price} starting={product.pricing_type === 'starting_from'} /></TableCell>
            <TableCell className='px-4 tabular-nums text-gray-600'>{product.stock}</TableCell>
            <TableCell className='px-4'><StatusBadge status={product.status ?? 'draft'} /></TableCell>
            <TableCell className='px-4'>{product.label ? <StatusBadge status={product.label} /> : <span className='text-gray-500'>None</span>}</TableCell>
            <TableCell className='px-5 text-right'><ProductActions product={product} disabled={disabled} onDelete={onDelete} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
