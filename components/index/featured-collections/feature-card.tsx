import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type FeatureCardProps = {
  className?: string
  title: string
  description: string
  href: string
  imageAlt: string
  imageSrc: string
  ctaLabel?: string
  meta?: string
}

export function FeatureCard({
  className,
  title,
  description,
  href,
  imageAlt,
  imageSrc,
  ctaLabel = 'Explore',
  meta,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex min-h-120 flex-col overflow-hidden border border-black/10 bg-white text-black transition-colors hover:border-black/35',
        className,
      )}
    >
      <div className='relative aspect-[4/5] overflow-hidden bg-muted'>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes='(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'
          className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
        />
      </div>

      <div className='flex flex-1 flex-col justify-between gap-8 p-5'>
        <div className='flex flex-col gap-2'>
          {meta ? (
            <p className='text-xs font-medium text-muted-foreground'>
              {meta}
            </p>
          ) : null}
          <h3 className='font-heading text-3xl font-semibold leading-tight'>
            {title}
          </h3>
          <p className='text-sm leading-6 text-muted-foreground'>
            {description}
          </p>
        </div>

        <span className='inline-flex items-center gap-3 text-sm font-medium text-black'>
          {ctaLabel}
          <ArrowRight className='size-4 stroke-[1.8] transition-transform group-hover:translate-x-1' />
        </span>
      </div>
    </Link>
  )
}
