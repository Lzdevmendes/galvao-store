import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { storeProductImage } from '@/lib/product-images'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const form      = await req.formData()
  const file      = form.get('file') as File | null
  const productId = form.get('productId') as string | null

  if (!file || !productId) return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await storeProductImage(productId, buffer)

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

  return NextResponse.json({ id: result.id, url: result.url, sortOrder: result.sortOrder, isPrimary: result.isPrimary })
}
