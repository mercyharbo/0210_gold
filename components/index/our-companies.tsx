import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const companies = [
  {
    name: 'FM LUXE',
    category: 'Gold jewellery',
    description:
      'Fine gold pieces and fashion-led styling for everyday elegance, gifting, and special occasions.',
    status: 'Live',
  },
  {
    name: 'Nigerian Delicacies',
    category: 'Cooking orders',
    description:
      'Homemade Nigerian meals and delicacies prepared for private orders while the official name is finalized.',
    status: 'Name pending',
  },
]

export function OurCompanies() {
  return (
    <section className='bg-white text-black'>
      <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='grid gap-8 border-t border-black/10 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end'>
          <div>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              Our companies
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              More than one business, built under one vision
            </h2>
          </div>

          <div className='flex flex-col gap-6 lg:items-end'>
            <p className='max-w-xl text-base leading-7 text-muted-foreground lg:text-right'>
              Fashion and gold remain the focus here, with space for the other
              businesses connected to FM LUXE as they grow.
            </p>
            <Link
              href='/companies'
              className='inline-flex h-11 items-center justify-center gap-3 border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
            >
              View all companies
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>
          </div>
        </div>

        <div className='grid gap-5 pt-10 md:grid-cols-2'>
          {companies.map((company) => (
            <article
              key={company.name}
              className='flex min-h-64 flex-col justify-between border border-black/10 p-6 transition-colors hover:border-black/35'
            >
              <div>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-xs font-medium uppercase text-muted-foreground'>
                    {company.category}
                  </p>
                  <span className='shrink-0 border border-black/15 px-3 py-1 text-xs font-medium text-muted-foreground'>
                    {company.status}
                  </span>
                </div>

                <h3 className='font-heading text-3xl font-semibold leading-tight'>
                  {company.name}
                </h3>
                <p className='max-w-lg text-sm leading-6 text-muted-foreground'>
                  {company.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
