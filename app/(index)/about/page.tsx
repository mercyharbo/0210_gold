import { ArrowRight, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const values = [
  {
    title: 'Fashion-led selection',
    description:
      'We curate gold, accessories, modest fashion, bags, shoes, and clothing around pieces that feel wearable and refined.',
    Icon: Sparkles,
  },
  {
    title: 'Client-first shopping',
    description:
      'Requests are handled around your budget, sizing, preferred stores, and the occasion you are shopping for.',
    Icon: ShoppingBag,
  },
  {
    title: 'UK to Nigeria delivery',
    description:
      'Items are sourced in the UK, checked, packed, and prepared for waybill delivery to Nigeria.',
    Icon: PackageCheck,
  },
]

export default function AboutPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-muted'>
        <div className='mx-auto grid min-h-[calc(100svh-5rem)] w-full gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-0'>
          <div className='flex max-w-3xl flex-col justify-center gap-6'>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              About 0210
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Fashion, gold, and shopping support between the UK and Nigeria
            </h1>
            <p className='max-w-2xl text-base leading-7 text-muted-foreground'>
              0210 started with a love for gold and style, and is growing into
              a home for fashion-led services and businesses. The focus is
              simple: help clients find beautiful pieces, shop with confidence,
              and receive them with care.
            </p>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <Link
                href='/shop'
                className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
              >
                Explore shop
                <ArrowRight className='size-4 stroke-[1.8]' />
              </Link>
              <Link
                href='/personal-shopper-request'
                className='inline-flex h-12 items-center justify-center border-b border-black px-1 text-sm font-medium text-black transition-opacity hover:opacity-65'
              >
                Request shopping help
              </Link>
            </div>
          </div>

          <div className='relative min-h-[420px] self-end overflow-hidden bg-white lg:min-h-[calc(100svh-5rem)]'>
            <Image
              src='/images/hero-editorial-jewellery.png'
              alt='Editorial 0210 Gold jewellery styling'
              fill
              priority
              sizes='(min-width: 1024px) 55vw, 100vw'
              className='object-cover object-center'
            />
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr]'>
            <div>
              <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                What we do
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
                A shopping experience built around real client requests
              </h2>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              {values.map(({ title, description, Icon }) => (
                <article key={title} className='border border-black/10 p-5'>
                  <Icon className='mb-6 size-5 stroke-[1.6]' />
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

      <section className='bg-black text-white'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-12 lg:py-20'>
          <div>
            <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
              Personal shopping
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Based in the UK, shopping for clients in Nigeria
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-7 text-muted-foreground'>
              Clients can send requests for fashion, gold, accessories, shoes,
              bags, and special pieces. We help source the items in the UK,
              prepare the order, and arrange waybill delivery to Nigeria.
            </p>
          </div>

          <div className='border border-white/15 p-6'>
            <div className='space-y-6'>
              <div>
                <p className='text-xs font-medium uppercase text-muted-foreground'>
                  Step 01
                </p>
                <p className='mt-2 font-heading text-2xl font-semibold'>
                  Send what you want
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase text-muted-foreground'>
                  Step 02
                </p>
                <p className='mt-2 font-heading text-2xl font-semibold'>
                  We source and check it
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase text-muted-foreground'>
                  Step 03
                </p>
                <p className='mt-2 font-heading text-2xl font-semibold'>
                  It is waybilled to Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-20'>
          <div>
            <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
              Growing with intention
            </p>
            <h2 className='max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              0210 is becoming a home for more than one business
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-7 text-muted-foreground'>
              Gold and fashion remain central, while new businesses such as
              Nigerian delicacies and future services will sit under the wider
              0210 direction as they are ready.
            </p>
          </div>

          <Link
            href='/companies'
            className='inline-flex h-12 items-center justify-center gap-4 border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
          >
            View companies
            <ArrowRight className='size-4 stroke-[1.8]' />
          </Link>
        </div>
      </section>
    </div>
  )
}
