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
    <section aria-label="Featured jewellery" className="meere-hero">
      <div ref={track} tabIndex={slides.length > 1 ? 0 : undefined}
        aria-label={slides.length > 1 ? 'Featured banners. Use arrow keys to browse.' : undefined}
        className="home-hero-track"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            move(event.key === 'ArrowRight' ? 1 : -1)
          }
        }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className="meere-hero-slide">
            <Image src={slide.image} alt={slide.alt} fill priority={index === 0}
              sizes="100vw" className="object-cover" />
            <div className="meere-image-shade" />
            <div className="meere-hero-copy">
              {index === 0 ? <h1 className="meere-display">{slide.title}</h1>
                : <h2 className="meere-display">{slide.title}</h2>}
              <p>{slide.description}</p>
              <Link href={slide.route} className="meere-white-button">Shop All</Link>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="meere-hero-controls">
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
