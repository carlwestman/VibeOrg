import { NextRequest, NextResponse } from 'next/server'
import { getOutputs } from '@/lib/fs-reader'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const agent = searchParams.get('agent') || undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
  const after = searchParams.get('since') || undefined

  const outputs = getOutputs({ agent, limit, after })

  return NextResponse.json({ outputs, count: outputs.length })
}
