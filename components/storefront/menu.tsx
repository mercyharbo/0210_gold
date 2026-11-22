'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useHomeCollections } from '@/hooks/use-home-endpoint'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'

export function StorefrontMenu() {
  const open = useStorefrontNavigation((state) => state.menuOpen)
  const reset = useStorefrontNavigation((state) => state.reset)
  const panel = useRef<HTMLDivElement>(null)
  const { data } = useHomeCollections()
  const categories = data?.data || []

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') { reset(); trigger?.focus() }
      if (event.key !== 'Tab') return
      const controls = panel.current?.querySelectorAll<HTMLElement>('a,button')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keyboard)
    return () => {
      document.removeEventListener('keydown', keyboard)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [open, reset])

  return (
    <>
      {open && <button aria-label="Close navigation backdrop" className="meere-menu-backdrop" onClick={reset} />}
      <div ref={panel} id="storefront-menu" role="dialog" aria-modal={open || undefined}
        aria-label="Shop navigation" inert={!open} className={`meere-menu ${open ? 'is-open' : ''}`}>
        <button className="meere-menu-close" aria-label="Close navigation" onClick={reset}><X className="size-5" /></button>
        <nav aria-label="Mobile navigation" className="meere-menu-primary">
          <Link href="/#new-arrivals" onClick={reset}>New Arrivals</Link>
          <Link href="/shop" onClick={reset}>Shop All</Link>
          <Link href="/categories" onClick={reset}>Collections</Link>
        </nav>
        <nav aria-label="Category navigation" className="meere-menu-categories">
          <p>Jewellery</p>
          {categories.map((category) => <Link key={category.id}
            href={`/shop?category=${encodeURIComponent(category.slug)}`} onClick={reset}>{category.name}</Link>)}
          <Link href="/shop" onClick={reset}>All jewellery</Link>
        </nav>
        <nav aria-label="Company navigation" className="meere-menu-company">
          <p>FM LUXE</p>
          <Link href="/about" onClick={reset}>About</Link>
          <Link href="/contact" onClick={reset}>Contact Us</Link>
          <Link href="/faq" onClick={reset}>FAQ</Link>
        </nav>
        <div className="meere-menu-image"><Image src="/images/hero-editorial-jewellery.png" alt="FM LUXE gold jewellery" fill sizes="25vw" className="object-cover" /></div>
      </div>
    </>
  )
}
