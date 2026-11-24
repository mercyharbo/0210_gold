'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generalSans } from '@/lib/fonts/storefront'
import { useStoreSearch } from '@/stores/hooks/use-storefront-navigation'

export function StorefrontSearch() {
  const { searchOpen, setSearchOpen } = useStoreSearch()

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent
        overlayClassName='bg-black/50 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none motion-reduce:animate-none'
        className={`${generalSans.className} rounded-none text-black motion-reduce:animate-none motion-reduce:transition-none`}
      >
        <DialogHeader>
          <DialogTitle className='[font-family:inherit]'>Search FM LUXE</DialogTitle>
          <DialogDescription>Find a piece for your collection.</DialogDescription>
        </DialogHeader>

        <form
          action='/shop'
          className='flex flex-col gap-4'
          onSubmit={() => setSearchOpen(false)}
        >
          <label htmlFor='store-search' className='text-sm'>Search jewellery</label>

          <Input
            id='store-search'
            name='q'
            placeholder='Search products'
            maxLength={100}
            required
            className='rounded-none'
          />

          <Button type='submit' className='rounded-none bg-black text-white'>
            Search
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
