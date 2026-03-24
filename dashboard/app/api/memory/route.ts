import { NextResponse } from 'next/server'
import { getSharedMemory } from '@/lib/fs-reader'

export async function GET() {
  const memory = getSharedMemory()
  return NextResponse.json(memory)
}
