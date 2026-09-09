import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n')
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const type   = searchParams.get('type') ?? 'orders'
  const period = searchParams.get('period') ?? '30d'
  const days   = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const since  = new Date(Date.now() - days * 86400000).toISOString()

  let csv = ''
  let filename = ''

  if (type === 'orders') {
    const rows = await db.all<Record<string, unknown>>(sql`
      SELECT order_number, status, customer_name, customer_email, customer_phone,
             payment_method, ROUND(subtotal_in_cents/100.0,2) subtotal,
             ROUND(discount_in_cents/100.0,2) desconto,
             ROUND(shipping_in_cents/100.0,2) frete,
             ROUND(total_in_cents/100.0,2) total,
             delivery_method, tracking_code,
             ship_street, ship_number, ship_district, ship_city, ship_state, ship_cep,
             coupon_code, created_at, paid_at, shipped_at, delivered_at
      FROM orders WHERE created_at >= ${since}
      ORDER BY created_at DESC
    `)
    csv = toCSV(rows)
    filename = `pedidos-${period}-${new Date().toISOString().split('T')[0]}.csv`
  }

  if (type === 'customers') {
    const rows = await db.all<Record<string, unknown>>(sql`
      SELECT u.email, u.name, u.phone, u.created_at,
             COUNT(o.id) total_pedidos,
             ROUND(COALESCE(SUM(o.total_in_cents),0)/100.0,2) total_gasto
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status IN ('paid','processing','shipped','delivered')
      GROUP BY u.id ORDER BY total_gasto DESC
    `)
    csv = toCSV(rows)
    filename = `clientes-${new Date().toISOString().split('T')[0]}.csv`
  }

  if (type === 'products') {
    const rows = await db.all<Record<string, unknown>>(sql`
      SELECT p.name, b.name marca, c.name categoria, p.status,
             COUNT(DISTINCT pv.id) variantes,
             SUM(pv.stock) stock_total,
             SUM(pv.stock_reserved) stock_reservado,
             ROUND(MIN(pv.price_in_cents)/100.0,2) preco_min,
             ROUND(MAX(pv.price_in_cents)/100.0,2) preco_max
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      GROUP BY p.id ORDER BY p.name
    `)
    csv = toCSV(rows)
    filename = `produtos-${new Date().toISOString().split('T')[0]}.csv`
  }

  return new NextResponse(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
