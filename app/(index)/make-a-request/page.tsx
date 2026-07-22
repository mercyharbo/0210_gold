import type { Metadata } from 'next'
import { MakeARequestClient } from './make-a-request-client'

export const metadata: Metadata = {
  title: 'Make a Request | UK Personal Shopper & Custom Sourcing',
  description:
    'Request custom UK fashion, 18k gold jewellery, bags, shoes, and luxury items for secure waybill delivery to Nigeria with FM LUXE.',
  alternates: {
    canonical: '/make-a-request',
  },
  openGraph: {
    title: 'Make a Request | UK Personal Shopper & Custom Sourcing | FM LUXE',
    description:
      'Request custom UK fashion, 18k gold jewellery, bags, shoes, and luxury items for secure waybill delivery to Nigeria.',
    url: '/make-a-request',
  },
}

export default function MakeARequestPage() {
  return <MakeARequestClient />
}
