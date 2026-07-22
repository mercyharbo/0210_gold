import { NextResponse } from 'next/server'

import { verifyPaystackTransaction } from '@/lib/payment/paystack'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')
  const orderId = searchParams.get('orderId')

  if (!reference) {
    return NextResponse.json({ success: false, error: 'Missing reference parameter.' }, { status: 400 })
  }

  const verifyRes = await verifyPaystackTransaction(reference)

  if (verifyRes.success && (verifyRes.status === 'success' || !verifyRes.status)) {
    const adminSupabase = createSupabaseAdminClient()

    let query = adminSupabase.from('orders').update({
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString(),
    })

    if (orderId) {
      query = query.eq('id', orderId)
    } else {
      query = query.eq('id', reference)
    }

    const { error } = await query

    if (error) {
      console.error('Failed to update order payment status:', error)
    }

    return NextResponse.json({ success: true, reference, paymentStatus: 'paid' })
  }

  return NextResponse.json(
    { success: false, error: verifyRes.error || 'Payment was not successful.' },
    { status: 400 }
  )
}
