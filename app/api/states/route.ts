import { NextResponse } from 'next/server'

import { NIGERIA_STATES } from '@/lib/data/nigeria-states'

export async function GET() {
  return NextResponse.json(NIGERIA_STATES)
}
