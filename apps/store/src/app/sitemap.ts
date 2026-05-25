import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://galvaosstore.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.all<{ slug: string; updated_at: string }>(sql`
    SELECT slug, updated_at FROM products WHERE status = 'published'
  `)

  const brands = await db.all<{ slug: string }>(sql`
    SELECT slug FROM brands WHERE active = 1
  `)

  const categories = await db.all<{ slug: string }>(sql`
    SELECT slug FROM categories
  `)

  const now = new Date()

  return [
    { url: BASE,              lastModified: now, changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE}/produtos`,lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/busca`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE}/conta`,   lastModified: now, changeFrequency: 'monthly', priority: 0.3 },

    ...brands.map(b => ({
      url: `${BASE}/${b.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),

    ...categories.map(c => ({
      url: `${BASE}/categoria/${c.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),

    ...products.map(p => ({
      url: `${BASE}/produto/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
