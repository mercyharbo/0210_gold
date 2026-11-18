import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Gem, PackageCheck, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About FM LUXE | Gold Jewellery',
  description: 'Discover FM LUXE and explore our gold jewellery collections, product details and customer support.',
  alternates: { canonical: '/about' },
}

const values = [
  { title: 'A considered collection', description: 'Explore our own selection of gold jewellery, with the available options described on each product page.', Icon: Gem },
  { title: 'Clear product details', description: 'Find the listed karat, weight, sizing and price before choosing a piece.', Icon: Heart },
  { title: 'Support for your order', description: 'Contact our team for help with product details, delivery information or an existing order.', Icon: PackageCheck },
]

export default function AboutPage() {
  return (
    <div className="bg-white text-black">
      <section className="bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium text-muted-foreground">About FM LUXE</p>
            <h1 className="font-heading text-5xl font-semibold leading-tight sm:text-6xl">Gold jewellery, thoughtfully chosen.</h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              FM LUXE is a home for gold jewellery. Browse our collections to find a piece for everyday wear, a meaningful gift or a special occasion.
            </p>
            <Button asChild className="w-fit"><Link href="/shop">Explore the collection <ArrowRight data-icon="inline-end" /></Link></Button>
          </div>
          <div className="relative aspect-square overflow-hidden">
            <Image src="/images/hero-editorial-jewellery.png" alt="Gold jewellery from the FM LUXE collection" fill loading="eager" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {values.map(({ title, description, Icon }) => (
            <article key={title} className="flex flex-col gap-4 border-t border-black/10 py-6">
              <Icon className="size-6 text-gold" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-semibold">{title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-black px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-semibold">A question about a piece?</h2>
            <p className="text-sm text-gray-300">Our team can help with product information and order support.</p>
          </div>
          <Button asChild variant="secondary" className="w-fit"><Link href="/contact">Contact us</Link></Button>
        </div>
      </section>
    </div>
  )
}
