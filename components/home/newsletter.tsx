'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generalSans } from '@/lib/fonts/storefront'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'

export function HomeNewsletter() {
  const open = useStorefrontNavigation((state) => state.newsletterOpen)
  const setOpen = useStorefrontNavigation((state) => state.setNewsletterOpen)

  useEffect(() => {
    if (sessionStorage.getItem('fm-luxe-newsletter-seen')) return
    const timer = window.setTimeout(() => {
      const state = useStorefrontNavigation.getState()
      if (!state.menuOpen && !state.searchOpen) {
        setOpen(true)
        sessionStorage.setItem('fm-luxe-newsletter-seen', '1')
      }
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [setOpen])

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value)
      sessionStorage.setItem('fm-luxe-newsletter-seen', '1')
    }}>
      <DialogContent overlayClassName="bg-black/80 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none" className={`${generalSans.className} meere-newsletter`}>
        <div className="meere-newsletter-image">
          <Image src="/images/hero-editorial-jewellery.png" alt="FM LUXE jewellery collection"
            fill sizes="(max-width: 767px) 100vw, 380px" className="object-cover" />
        </div>
        <div className="meere-newsletter-content">
          <p className="meere-logo">fm luxe</p>
          <DialogHeader>
            <DialogTitle className="meere-newsletter-title">Join the Collection</DialogTitle>
            <DialogDescription>New arrivals and collection updates from FM LUXE.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <Input id="newsletter-email" type="email" placeholder="Email" disabled
              aria-describedby="newsletter-status" className="meere-newsletter-input" />
            <label htmlFor="newsletter-name" className="sr-only">Name</label>
            <Input id="newsletter-name" placeholder="Name" disabled className="meere-newsletter-input" />
            <Button disabled className="meere-newsletter-submit">Join Now</Button>
            <p id="newsletter-status" className="text-xs text-gray-600">Newsletter signup coming soon.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
