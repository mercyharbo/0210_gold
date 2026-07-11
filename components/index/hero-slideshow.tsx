'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import type { HeroBanner } from '@/types/hero-banner'

type HeroSlideshowProps = {
  banners: HeroBanner[]
}

export function HeroSlideshow({ banners }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // Dragging / swiping state variables
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [wasDragged, setWasDragged] = useState(false)

  // Duplicate the first slide to the end to allow a seamless infinite loop transition
  const trackBanners = banners.length > 1 ? [...banners, banners[0]] : banners

  useEffect(() => {
    if (banners.length <= 1 || isDragging) return

    const interval = setInterval(() => {
      handleNext()
    }, 6000)

    return () => clearInterval(interval)
  }, [banners.length, currentIndex, isTransitioning, isDragging])

  const handleNext = () => {
    if (!isTransitioning) return
    setCurrentIndex((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (!isTransitioning) return
    if (currentIndex === 0) {
      // Snap instantly to the duplicate slide at the end
      setIsTransitioning(false)
      setCurrentIndex(banners.length)

      // Animate backwards on the next tick
      setTimeout(() => {
        setIsTransitioning(true)
        setCurrentIndex(banners.length - 1)
      }, 50)
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  // Detect when we reach the duplicated slide at the end (forward loop)
  useEffect(() => {
    if (currentIndex === banners.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 1000) // Wait for the transition to finish (1000ms)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, banners.length])

  // Re-enable transition after snapping back to the original first slide
  useEffect(() => {
    if (currentIndex === 0 && !isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isTransitioning])

  const handleIndicatorClick = (index: number) => {
    if (!isTransitioning) return
    setCurrentIndex(index)
  }

  // Pointer Event Handlers for unified mouse-drag & touch-swipe support
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // Only respond to primary click
    setIsDragging(true)
    setStartX(e.clientX)
    setDragOffset(0)
    setWasDragged(false)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const currentX = e.clientX
    const diff = currentX - startX
    setDragOffset(diff)

    if (Math.abs(diff) > 10) {
      setWasDragged(true)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    const threshold = 80 // Pixels required to switch slide
    if (dragOffset < -threshold) {
      handleNext()
    } else if (dragOffset > threshold) {
      handlePrev()
    }
    setDragOffset(0)
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragOffset(0)
  }

  return (
    <section
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={cn(
        'relative overflow-hidden bg-black text-white min-h-[calc(100svh-5rem)] flex items-center select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Sliding Track */}
      <div
        className={cn(
          'absolute inset-0 flex h-full',
          isTransitioning && !isDragging ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'
        )}
        style={{
          transform: `translateX(calc(-${(currentIndex * 100) / trackBanners.length}% + ${dragOffset}px))`,
          width: `${trackBanners.length * 100}%`,
        }}
      >
        {trackBanners.map((banner, index) => (
          <div
            key={`${banner.id}-${index}`}
            className='relative h-full flex-shrink-0 flex items-center'
            style={{ width: `${100 / trackBanners.length}%` }}
          >
            {/* Background Image & Overlay */}
            <div className='absolute inset-0 z-0 overflow-hidden'>
              <Image
                src={banner.image_src}
                alt={banner.title}
                fill
                priority={index === 0}
                className='object-cover object-center'
              />
              <div className='absolute inset-0 bg-black/50' /> {/* Dark readability overlay */}
            </div>

            {/* Text Content */}
            <div className='relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12 flex flex-col gap-6 text-white'>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/80 sm:text-sm'>
                New arrival
              </p>

              <h1 className='max-w-3xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl'>
                {banner.title}
              </h1>

              <p className='max-w-lg text-base leading-relaxed text-white/85'>
                {banner.description}
              </p>

              <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-center'>
                <Link
                  href={banner.route}
                  onClick={(e) => wasDragged && e.preventDefault()}
                  className='inline-flex h-12 items-center justify-center gap-4 bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-white/90'
                >
                  Explore collection
                  <ArrowRight className='size-4 stroke-[1.8]' />
                </Link>

                <Link
                  href='/shop?sort=newest'
                  onClick={(e) => wasDragged && e.preventDefault()}
                  className='inline-flex h-12 items-center justify-center gap-4 border-b border-white px-1 text-sm font-medium text-white transition-opacity hover:opacity-80'
                >
                  New arrivals
                  <ArrowRight className='size-4 stroke-[1.8]' />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className='absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5 lg:left-12 lg:translate-x-0 lg:bottom-10'>
          {banners.map((_, index) => {
            const isActive = index === (currentIndex % banners.length)
            return (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={cn(
                  'size-2.5 rounded-full border border-white transition-colors',
                  isActive ? 'bg-white' : 'bg-transparent'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          })}
        </div>
      )}

      <div className='pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-4 lg:flex lg:right-10 z-20 text-white'>
        <span className='text-xs font-medium text-white'>
          {String((currentIndex % banners.length) + 1).padStart(2, '0')}
        </span>
        <span className='h-36 w-px bg-white/45' />
        <span className='text-xs font-medium text-white'>
          {String(banners.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
