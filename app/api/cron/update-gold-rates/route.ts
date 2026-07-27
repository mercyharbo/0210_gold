import { NextResponse } from 'next/server'
import { syncGoldRatesFromAPI } from '@/lib/gold/gold-rate-sync'

export async function GET(request: Request) {
  // Optional security check if CRON_SECRET is configured
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncGoldRatesFromAPI()

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: result.message,
    rates: result.rates,
  })
}

export async function POST(request: Request) {
  return GET(request)
}
