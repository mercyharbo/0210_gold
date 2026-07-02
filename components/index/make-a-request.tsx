import { ArrowRight, PackageCheck, ShoppingBag, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const serviceSteps = [
  {
    title: 'Send your request',
    description: 'Share the items, sizes, budget, and UK stores you want.',
    Icon: ShoppingBag,
  },
  {
    title: 'We shop in the UK',
    description: 'Orders are sourced, checked, and prepared for dispatch.',
    Icon: PackageCheck,
  },
  {
    title: 'Waybill to Nigeria',
    description: 'Your package is shipped to Nigeria with clear updates.',
    Icon: Truck,
  },
]

export function MakeARequest() {
  return (
    <section className='bg-muted text-black'>
      <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-20'>
        <div className='flex flex-col justify-between gap-10'>
          <div className='flex max-w-3xl flex-col gap-5'>
            <p className='text-sm font-medium text-muted-foreground'>
              Make a request
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl'>
              Shop from the UK, delivered to Nigeria
            </h2>
            <p className='max-w-2xl text-base leading-7 text-muted-foreground'>
              Based in the UK, we help clients shop fashion, gold, accessories,
              shoes, bags, and special requests, then arrange waybill delivery
              to Nigeria.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            {serviceSteps.map(({ title, description, Icon }) => (
              <div key={title} className='flex flex-col gap-5 border border-black/10 bg-white p-5'>
                <Icon className='size-5 stroke-[1.6] text-black' />
                <h3 className='font-heading text-xl font-semibold'>{title}</h3>
                <p className='text-sm leading-6 text-muted-foreground'>
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <Link
              href='/make-a-request'
              className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
            >
              Request shopping help
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>
            <Link
              href='/contact'
              className='inline-flex h-12 items-center justify-center border-b border-black px-1 text-sm font-medium text-black transition-opacity hover:opacity-65'
            >
              Ask a question
            </Link>
          </div>
        </div>

        <div className='relative min-h-[420px] overflow-hidden bg-white lg:min-h-[620px]'>
          <Image
            src='/images/make-a-request-uk-nigeria.png'
            alt='Curated fashion shopping prepared for UK to Nigeria delivery'
            fill
            sizes='(min-width: 1024px) 42vw, 100vw'
            className='object-cover object-center'
          />
        </div>
      </div>
    </section>
  )
}
