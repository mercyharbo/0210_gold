import { NextResponse } from 'next/server'

import { NIGERIA_STATES } from '@/lib/data/nigeria-states'
import { getStates } from '@/lib/locations/location-data'

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get('country')
  if (country) return NextResponse.json({ success: true, status: 200, data: await getStates(country) })
  // Preserve the legacy checkout contract until that gated workflow migrates.
  return NextResponse.json(NIGERIA_STATES)
}
