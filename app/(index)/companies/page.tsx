import { ArrowRight, Clock, PackageCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const companies = [
  {
    name: '0210 Gold',
    slug: '0210-gold',
    category: 'Gold jewellery & fashion styling',
    description:
      'Fine gold pieces, accessories, and fashion-led styling for everyday elegance, gifting, and special occasions.',
    imageAlt: 'Premium gold jewellery and accessories arranged in a studio',
    imageSrc: '/images/companies/0210-gold-company.png',
    status: 'Live',
    href: '/shop',
    ctaLabel: 'Explore shop',
    highlights: ['Gold jewellery', 'Accessories', 'Styling support'],
  },
  {
    name: 'Nigerian Delicacies',
    slug: 'nigerian-delicacies',
    category: 'Cooking orders',
    description:
      'Homemade Nigerian meals and delicacies prepared for private orders, family gatherings, and special occasions.',
    imageAlt: 'Nigerian dishes prepared for private cooking orders',
    imageSrc: '/images/companies/nigerian-delicacies-company.png',
    status: 'Taking orders',
    href: '/contact',
    ctaLabel: 'Ask about orders',
    highlights: ['Private cooking orders', 'Nigerian meals', 'Occasion meals'],
  },
]

const principles = [
  {
    title: 'Built carefully',
    description:
      'Every business line is introduced only when the service, offer, and client experience can be explained clearly.',
    Icon: Sparkles,
  },
  {
    title: 'Client requests first',
    description:
      'The brand grows around what people actually ask for: fashion, gold, personal shopping, and now food orders.',
    Icon: Clock,
  },
  {
    title: 'Clear service lanes',
    description:
      'Each business has its own focus, so clients know where to go for jewellery, fashion support, or food orders.',
    Icon: PackageCheck,
  },
]

export default function CompaniesPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-muted'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-24'>
          <div className='flex max-w-3xl flex-col justify-center'>
            <p className='mb-4 text-sm font-medium uppercase text-muted-foreground'>
              Companies
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] text-black sm:text-6xl lg:text-7xl'>
              One home for every business we build
            </h1>
          </div>

          <div className='flex flex-col justify-end gap-6 lg:pb-2'>
            <p className='max-w-2xl text-base leading-7 text-muted-foreground'>
              0210 brings together a focused group of businesses shaped around
              style, service, and everyday client needs. Gold and fashion sit
              alongside homemade Nigerian delicacies, giving each offer a clear
              place under one brand direction.
            </p>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='border border-black/10 bg-white p-4'>
                <p className='font-heading text-3xl font-semibold'>02</p>
                <p className='mt-2 text-xs font-medium uppercase text-muted-foreground'>
                  Businesses
                </p>
              </div>
              <div className='border border-black/10 bg-white p-4'>
                <p className='font-heading text-3xl font-semibold'>02</p>
                <p className='mt-2 text-xs font-medium uppercase text-muted-foreground'>
                  Active offers
                </p>
              </div>
              <div className='border border-black/10 bg-white p-4'>
                <p className='font-heading text-3xl font-semibold'>UK</p>
                <p className='mt-2 text-xs font-medium uppercase text-muted-foreground'>
                  Based service
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='mb-10 max-w-3xl'>
            <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
              Our businesses
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              The businesses under 0210
            </h2>
          </div>

          <div className='grid gap-8'>
            {companies.map((company, index) => (
              <article
                key={company.slug}
                className='grid overflow-hidden border border-black/10 bg-white lg:grid-cols-2'
              >
                <div
                  className={
                    index % 2 === 0
                      ? 'relative min-h-[360px] lg:min-h-[560px]'
                      : 'relative min-h-[360px] lg:order-2 lg:min-h-[560px]'
                  }
                >
                  <Image
                    src={company.imageSrc}
                    alt={company.imageAlt}
                    fill
                    sizes='(min-width: 1024px) 50vw, 100vw'
                    className='object-cover object-center'
                  />
                </div>

                <div className='flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10'>
                  <div>
                    <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
                      <p className='text-xs font-medium uppercase text-muted-foreground'>
                        {company.category}
                      </p>
                      <span className='border border-black/15 px-3 py-1 text-xs font-medium text-muted-foreground'>
                        {company.status}
                      </span>
                    </div>

                    <h3 className='font-heading text-4xl font-semibold leading-tight sm:text-5xl'>
                      {company.name}
                    </h3>
                    <p className='mt-5 max-w-xl text-base leading-7 text-muted-foreground'>
                      {company.description}
                    </p>

                    <div className='mt-8 flex flex-wrap gap-3'>
                      {company.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className='border border-black/10 px-3 py-2 text-xs font-medium uppercase text-muted-foreground'
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-xs font-medium uppercase text-muted-foreground'>
                      /companies/{company.slug}
                    </p>
                    <Link
                      href={company.href}
                      className='inline-flex h-11 items-center justify-center gap-3 border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
                    >
                      {company.ctaLabel}
                      <ArrowRight className='size-4 stroke-[1.8]' />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-black text-white'>
        <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='grid gap-10 lg:grid-cols-[0.75fr_1.25fr]'>
            <div>
              <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                How we work
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
                Different offers, one clear standard
              </h2>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              {principles.map(({ title, description, Icon }) => (
                <article key={title} className='border border-white/15 p-5'>
                  <Icon className='mb-6 size-5 stroke-[1.6] text-white' />
                  <h3 className='font-heading text-xl font-semibold'>
                    {title}
                  </h3>
                  <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-20'>
          <div>
            <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
              Work with us
            </p>
            <h2 className='max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Explore the right business for what you need
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-7 text-muted-foreground'>
              Shop gold and fashion-led pieces through 0210 Gold, request UK
              personal shopping support, or enquire about Nigerian delicacies
              for private cooking orders.
            </p>
          </div>

          <Link
            href='/contact'
            className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
          >
            Contact us
            <ArrowRight className='size-4 stroke-[1.8]' />
          </Link>
        </div>
      </section>
    </div>
  )
}
