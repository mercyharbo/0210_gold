'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { CatalogProduct } from '@/types/catalog'

export function ProductActions({ product, disabled, onDelete }: {
  product: CatalogProduct; disabled: boolean; onDelete: (product: CatalogProduct, trigger: HTMLButtonElement | null) => void
}) {
  const trigger = useRef<HTMLButtonElement>(null)
  const openingDialog = useRef(false)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button ref={trigger} variant='ghost' size='icon-sm' disabled={disabled} aria-label={`Actions for ${product.name}`}><MoreHorizontal className='size-4' /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' onCloseAutoFocus={(event) => {
        if (openingDialog.current) event.preventDefault()
        openingDialog.current = false
      }}>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild><Link href={`/admin/products/${encodeURIComponent(product.id)}`}><Pencil />Edit</Link></DropdownMenuItem>
          <DropdownMenuItem variant='destructive' onSelect={() => {
            openingDialog.current = true
            onDelete(product, trigger.current)
          }}><Trash2 />Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
