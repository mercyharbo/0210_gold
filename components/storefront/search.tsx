'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generalSans } from '@/lib/fonts/storefront'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'

export function StorefrontSearch() {
  const open = useStorefrontNavigation((state) => state.searchOpen)
  const setOpen = useStorefrontNavigation((state) => state.setSearchOpen)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent overlayClassName="bg-black/50 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none" className={`${generalSans.className} meere-search rounded-none`}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'inherit' }}>Search FM LUXE</DialogTitle>
          <DialogDescription>Find a piece for your collection.</DialogDescription>
        </DialogHeader>
        <form action="/shop" className="flex flex-col gap-4" onSubmit={() => setOpen(false)}>
          <label htmlFor="store-search" className="text-sm">Search jewellery</label>
          <Input id="store-search" name="q" placeholder="Search products" maxLength={100} required className="rounded-none" />
          <Button type="submit" className="rounded-none bg-black text-white">Search</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
