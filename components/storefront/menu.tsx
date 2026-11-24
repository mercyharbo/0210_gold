'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import { useHomeCollections } from '@/hooks/use-home-endpoint'
import { useStoreMenu } from '@/stores/hooks/use-storefront-navigation'

export function StorefrontMenu() {
  const { menuOpen, reset } = useStoreMenu()
  const { data } = useHomeCollections()
  const panel = useRef<HTMLDivElement>(null)

  const categories = data?.data || []

  useEffect(() => {
    if (!menuOpen) return

    const trigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()

    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        reset()
        trigger?.focus()
      }

      if (event.key !== 'Tab') return

      const controls = panel.current?.querySelectorAll<HTMLElement>('a,button')

      if (!controls?.length) return

      const first = controls[0]
      const last = controls[controls.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyboard)

    return () => {
      document.removeEventListener('keydown', handleKeyboard)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [menuOpen, reset])

  return (
    <>
      {menuOpen && (
        <button
          aria-label='Close navigation backdrop'
          className='fixed inset-x-0 bottom-0 top-[84px] -z-10 bg-black/50 lg:top-[82px]'
          onClick={reset}
        />
      )}

      <div
        ref={panel}
        id='storefront-menu'
        role='dialog'
        aria-modal={menuOpen || undefined}
        aria-label='Shop navigation'
        inert={!menuOpen}
        className={`fixed left-0 top-[84px] grid max-h-[calc(100svh-84px)] w-full grid-cols-2 gap-8
          overflow-y-auto bg-white p-6 transition-[opacity,transform,visibility] duration-300 ease-[ease]
          motion-reduce:transition-none lg:absolute lg:top-[82px] lg:max-h-none
          lg:grid-cols-[1fr_1fr_1fr_1.1fr] lg:overflow-visible
          ${menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-3 opacity-0'}`}
      >
        <button
          className='absolute right-2 top-2 z-10 bg-white p-2'
          aria-label='Close navigation'
          onClick={reset}
        >
          <X className='size-5' />
        </button>

        <nav aria-label='Mobile navigation' className='flex flex-col items-start gap-4 text-base font-semibold'>
          <Link href='/#new-arrivals' onClick={reset}>New Arrivals</Link>
          <Link href='/shop' onClick={reset}>Shop All</Link>
          <Link href='/categories' onClick={reset}>Collections</Link>
        </nav>

        <nav aria-label='Category navigation' className='flex flex-col items-start gap-4 font-medium'>
          <p className='text-xs font-normal text-[#e10600]'>Jewellery</p>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              onClick={reset}
            >
              {category.name}
            </Link>
          ))}

          <Link href='/shop' onClick={reset}>All jewellery</Link>
        </nav>

        <nav aria-label='Company navigation' className='flex flex-col items-start gap-4 font-medium'>
          <p className='text-xs font-normal text-[#e10600]'>FM LUXE</p>

          <Link href='/about' onClick={reset}>About</Link>
          <Link href='/contact' onClick={reset}>Contact Us</Link>
          <Link href='/faq' onClick={reset}>FAQ</Link>
        </nav>

        <div className='relative hidden min-h-[386px] lg:block'>
          <Image
            src='/images/hero-editorial-jewellery.png'
            alt='FM LUXE gold jewellery'
            fill
            sizes='25vw'
            className='object-cover'
          />
        </div>
      </div>
    </>
  )
}
