'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { CatalogCategory } from '@/types/catalog'

type CategoryActionsProps = {
  category: CatalogCategory
  disabled: boolean
  onDelete: (category: CatalogCategory, trigger: HTMLButtonElement | null) => void
}

export function CategoryActions({ category, disabled, onDelete }: CategoryActionsProps) {
  const trigger = useRef<HTMLButtonElement>(null)
  const openingDialog = useRef(false)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button ref={trigger} variant='ghost' size='icon-sm' disabled={disabled} aria-label={`Actions for ${category.name}`}>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' onCloseAutoFocus={(event) => {
        // Let the confirmation dialog take focus instead of the closing menu.
        if (openingDialog.current) event.preventDefault()
        openingDialog.current = false
      }}>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild><Link href={`/admin/categories/${category.id}`}><Pencil />Edit</Link></DropdownMenuItem>
          <DropdownMenuItem variant='destructive' onSelect={() => {
            openingDialog.current = true
            onDelete(category, trigger.current)
          }}><Trash2 />Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
