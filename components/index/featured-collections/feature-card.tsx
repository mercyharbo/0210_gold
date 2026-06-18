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
        'group flex min-h-[30rem] flex-col overflow-hidden border border-black/10 bg-white text-black transition-colors hover:border-black/35',
        className,
      )}
    >
      <div className='relative aspect-[4/5] overflow-hidden bg-[#f7f5f0]'>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes='(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'
          className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
        />
      </div>

      <div className='flex flex-1 flex-col justify-between gap-8 p-5'>
        <div>
          {meta ? (
            <p className='mb-3 text-xs font-medium uppercase text-black/45'>
              {meta}
            </p>
          ) : null}
          <h3 className='font-heading text-3xl font-semibold leading-tight'>
            {title}
          </h3>
          <p className='mt-3 text-sm leading-6 text-black/65'>
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
