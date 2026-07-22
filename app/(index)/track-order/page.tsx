import type { Metadata } from 'next'
import { TrackOrderClient } from './track-order-client'

export const metadata: Metadata = {
  title: 'Track Order & Waybill Progress',
  description:
    'Track your live gold jewellery or UK personal shopper order status, dispatch updates, and delivery progress at FM LUXE.',
  alternates: {
    canonical: '/track-order',
  },
  openGraph: {
    title: 'Track Order & Waybill Progress | FM LUXE',
    description:
      'Track your live gold jewellery or UK personal shopper order status, dispatch updates, and delivery progress at FM LUXE.',
    url: '/track-order',
  },
}

export default function TrackOrderPage() {
  return <TrackOrderClient />
}
