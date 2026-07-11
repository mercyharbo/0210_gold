'use client'

import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBanner } from '@/stores/hooks/use-banner'
import type { HeroBanner } from '@/types/hero-banner'

type BannerRowActionsProps = {
  banner: HeroBanner
}

export function BannerRowActions({ banner }: BannerRowActionsProps) {
  const { openDeleteDialog } = useBanner()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon-sm'>
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-36 rounded-none'>
        <DropdownMenuItem asChild>
          <Link
            href={`/admin/hero-banners/${banner.id}`}
            className='flex items-center gap-2 w-full cursor-pointer'
          >
            <Edit className='size-4 text-muted-foreground' />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openDeleteDialog(banner)}
          className='flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive w-full cursor-pointer'
        >
          <Trash2 className='size-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
