'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHomeBanners } from '@/hooks/use-home-endpoint'
import type { CatalogBanner } from '@/types/catalog'

const fallback = {
  id: 'editorial', title: 'Gold for every day.',
  description: 'A considered collection of gold jewellery, chosen to become part of your everyday. Discover your next signature piece with FM LUXE.',
  route: '/shop', image: '/images/hero-editorial-jewellery.png',
  alt: 'Gold earrings, rings and layered necklaces worn with a black blazer',
}

export function HomeHero({ initial }: { initial?: CatalogBanner[] }) {
  const { data, error, mutate } = useHomeBanners(initial)
  const track = useRef<HTMLDivElement>(null)
  const slides = data?.data?.length ? data.data.map((banner) => ({
    ...banner, image: banner.images[0]?.url || fallback.image,
    alt: banner.images[0]?.alt || fallback.alt,
  })) : [fallback]

  function move(direction: number) {
    const element = track.current
    if (!element) return
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <section aria-label="Featured jewellery" className="relative bg-black text-white">
      <div ref={track} tabIndex={slides.length > 1 ? 0 : undefined}
        aria-label={slides.length > 1 ? 'Featured banners. Use arrow keys to browse.' : undefined}
        className={slides.length > 1
          ? 'flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'block overflow-visible'}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            move(event.key === 'ArrowRight' ? 1 : -1)
          }
        }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className="relative h-[110svh] min-w-0 shrink-0 basis-full snap-start md:h-[120svh]">
            <Image src={slide.image} alt={slide.alt} fill priority={index === 0}
              sizes="100vw" className="object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-black/18" />
            <div className="sticky top-0 flex h-svh flex-col items-start justify-end gap-4 px-6 py-16 motion-reduce:relative">
              {index === 0 ? <h1 className="text-[32px] font-semibold leading-none md:text-[9.737vw]">{slide.title}</h1>
                : <h2 className="text-[32px] font-semibold leading-none md:text-[9.737vw]">{slide.title}</h2>}
              <p className="max-w-full text-base font-medium leading-[1.6] md:max-w-[520px]">{slide.description}</p>
              <Link href={slide.route} className="inline-flex min-h-11 w-fit items-center justify-center gap-2.5 bg-white px-4 text-sm font-medium leading-[1.6] text-black transition-colors duration-200 hover:bg-[#e10600] hover:text-white motion-reduce:transition-none">Shop All</Link>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2 text-black">
          <Button variant="outline" size="icon" aria-label="Previous banner" onClick={() => move(-1)}><ArrowLeft /></Button>
          <Button variant="outline" size="icon" aria-label="Next banner" onClick={() => move(1)}><ArrowRight /></Button>
        </div>
      )}
      {error && <div role="status" className="flex flex-wrap items-center gap-3 bg-black px-6 py-3 text-xs text-white">
        <p>Featured collection updates are temporarily unavailable.</p>
        <button className="underline underline-offset-4" onClick={() => { void mutate() }}>Try again</button>
      </div>}
    </section>
  )
}
