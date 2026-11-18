import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { getStoreSettingsAction } from '@/app/(admin)/admin/settings/actions'
import { getAuthProvider } from '@/lib/auth/provider'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogSettings } from '@/types/catalog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact FM LUXE | Product and Order Support',
  description: 'Contact FM LUXE for gold jewellery information, delivery questions and support with your order.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const settings = getAuthProvider() === 'neon'
    ? await readCatalog<CatalogSettings>('settings')
    : await getStoreSettingsAction()
  const phone = settings.support_phone.replace(/[^0-9+]/g, '')
  const whatsapp = `https://wa.me/${phone.replace('+', '')}`
  const methods = [
    { title: 'Email', detail: settings.support_email, href: `mailto:${settings.support_email}`, Icon: Mail },
    { title: 'Phone', detail: settings.support_phone, href: `tel:${phone}`, Icon: Phone },
    { title: 'Store address', detail: settings.store_address, Icon: MapPin },
    { title: 'Opening hours', detail: settings.business_hours, Icon: Clock },
  ]
  return (
    <div className="bg-white text-black">
      <section className="bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <p className="text-sm font-medium text-muted-foreground">Contact us</p>
          <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-tight sm:text-6xl">Here to help with your jewellery and orders.</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">Ask about a product, its available options, delivery or an existing order. Include your order reference when you have one.</p>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {methods.filter(({ detail }) => detail.trim()).map(({ title, detail, href, Icon }) => (
              <article key={title} className="flex min-w-0 flex-col gap-3 border-t border-black/10 py-5">
                <Icon className="size-5 text-gold" aria-hidden="true" />
                <h2 className="text-sm font-semibold">{title}</h2>
                {href ? <a href={href} className="break-words text-sm leading-6 underline underline-offset-4 focus-visible:outline-2">{detail}</a> : <p className="text-sm leading-6 text-muted-foreground">{detail}</p>}
              </article>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-3xl">Product and order enquiries</CardTitle>
              <CardDescription>Share the product name or order reference so our team can help.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="text-sm leading-7 text-muted-foreground">For a question about a piece in our collection, send the product link and the size or karat you are considering. For an existing order, include its reference and a short description of the issue.</p>
              <div className="flex flex-wrap gap-3">
                {phone && <Button asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a></Button>}
                {settings.support_email && <Button asChild variant="outline"><a href={`mailto:${settings.support_email}`}>Email support</a></Button>}
                <Button asChild variant="link"><Link href="/faq">Read the FAQs</Link></Button>
              </div>
              {!phone && !settings.support_email && <p className="text-sm text-muted-foreground">Contact details are being updated. Please check back soon.</p>}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
