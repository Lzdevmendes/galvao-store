import { NextRequest, NextResponse } from 'next/server'

const requests = new Map<string, { email: string; productName: string; at: string }>()

export async function POST(req: NextRequest) {
  const { email, variantId, productName } = await req.json()

  if (!email || !variantId) {
    return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const key = `${variantId}:${email}`
  requests.set(key, { email, productName, at: new Date().toISOString() })

  return NextResponse.json({ ok: true })
}
