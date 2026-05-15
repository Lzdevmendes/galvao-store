import { db } from './client'
import {
  brands, categories, products, productImages, productSizes,
  coupons, deliveryZones,
} from './schema'
import { randomUUID } from 'crypto'

console.log('🌱 Seeding Galvão Store database...')

// ── Brands ─────────────────────────────────────────────────
const brandData = [
  { id: 'nike',   slug: 'nike',   name: 'Nike',   tagline: 'Just Do It · Brasil · 142 produtos', gradientCss: 'linear-gradient(135deg,#0B0E12,#1F252E)' },
  { id: 'adidas', slug: 'adidas', name: 'Adidas', tagline: 'Three Stripes · Brasil · 98 produtos', gradientCss: 'linear-gradient(135deg,#000,#1F252E)' },
  { id: 'puma',   slug: 'puma',   name: 'Puma',   tagline: 'Forever Faster · Brasil · 64 produtos', gradientCss: 'linear-gradient(135deg,#14181F,#000)' },
  { id: 'umbro',  slug: 'umbro',  name: 'Umbro',  tagline: 'Est. 1924 · Brasil · 38 produtos', gradientCss: 'linear-gradient(135deg,#003366,#0B1A2E)' },
  { id: 'newbalance', slug: 'new-balance', name: 'New Balance', tagline: 'Fearlessly Independent · 28 produtos', gradientCss: 'linear-gradient(135deg,#CC0000,#0B0E12)' },
  { id: 'joma',   slug: 'joma',   name: 'Joma',   tagline: 'Made to Move · 22 produtos', gradientCss: 'linear-gradient(135deg,#0066CC,#003399)' },
]

// ── Categories ─────────────────────────────────────────────
const categoryData = [
  { id: 'campo',    slug: 'campo',       name: 'Campo (FG)',    sortOrder: 1 },
  { id: 'society',  slug: 'society',     name: 'Society (SG)',  sortOrder: 2 },
  { id: 'futsal',   slug: 'futsal',      name: 'Futsal',       sortOrder: 3 },
  { id: 'casual',   slug: 'tenis-casual',name: 'Tênis Casual', sortOrder: 4 },
  { id: 'corrida',  slug: 'corrida',     name: 'Corrida',      sortOrder: 5 },
  { id: 'camisas',  slug: 'camisas',     name: 'Camisas',      sortOrder: 6 },
  { id: 'meias',    slug: 'meias',       name: 'Meias',        sortOrder: 7 },
]

// ── Products ────────────────────────────────────────────────
const productData = [
  {
    id: 'phantom-gx3-01', slug: 'nike-phantom-gx3-elite-fg-mad-ready',
    brandId: 'nike', categoryId: 'campo', line: 'Phantom',
    name: 'Phantom GX III Elite FG', colorway: 'Mad Ready',
    sku: 'NK-PHT-GX3-EL-001', badge: 'sale' as const,
    price: 529.99, originalPrice: 619.99, rating: 4.8, reviewCount: 142,
    description: 'Construída para o jogador criativo. O cabedal Gripknit tem microtexturas que aumentam o atrito com a bola.',
    features: ['Cabedal Gripknit com microtexturas', 'Solado Cyclone Plate em fibra de carbono', 'Cápsula Air Zoom no antepé'],
    specs: { Travas: 'FG · Cyclone', Superfície: 'Campo firme', Cabedal: 'Gripknit', Peso: '190g' },
    tags: ['campo', 'fg', 'elite', 'controle'],
    images: [
      { url: '/products/phantom-gx3/01.jpg', alt: 'Nike Phantom GX III Elite – lateral', isPrimary: true },
      { url: '/products/phantom-gx3/02.jpg', alt: 'Nike Phantom GX III Elite – superior' },
      { url: '/products/phantom-gx3/03.jpg', alt: 'Nike Phantom GX III Elite – solado' },
    ],
    sizes: [37,38,39,40,41,42,44,45],
    outOfStock: [43],
  },
  {
    id: 'f50-elite-01', slug: 'adidas-f50-elite-fg-solar-yellow',
    brandId: 'adidas', categoryId: 'campo', line: 'F50',
    name: 'F50 Elite FG', colorway: 'Solar Yellow',
    sku: 'AD-F50-EL-SY-001', badge: 'new' as const,
    price: 799.99, rating: 4.7, reviewCount: 89,
    description: 'O F50 Elite retorna como o chute mais rápido da Adidas. SPEEDFRAME integrada acelera cada passo.',
    features: ['Estrutura SPEEDFRAME integrada', 'Cabedal ultralight < 200g', 'Travas conificadas'],
    specs: { Travas: 'FG · Conificadas', Superfície: 'Campo firme', Peso: '185g' },
    tags: ['campo', 'fg', 'velocidade', 'f50'],
    images: [
      { url: '/products/f50-elite/01.jpg', alt: 'Adidas F50 Elite Solar Yellow', isPrimary: true },
      { url: '/products/f50-elite/02.jpg', alt: 'Adidas F50 Elite – superior' },
    ],
    sizes: [37,38,39,40,41,42,43],
    outOfStock: [44],
  },
  {
    id: 'mercurial-vapor-01', slug: 'nike-air-zoom-mercurial-vapor-xv-elite-fg',
    brandId: 'nike', categoryId: 'campo', line: 'Mercurial',
    name: 'Air Zoom Mercurial Vapor XV Elite FG', colorway: 'Bright Crimson',
    sku: 'NK-MRC-V15-EL-001', badge: 'new' as const,
    price: 869.99, rating: 4.9, reviewCount: 213,
    description: 'A mais veloz da Nike. Air Zoom no antepé e Vaporposite+ entregam tração imediata.',
    features: ['Cabedal Vaporposite+', 'Air Zoom no antepé', 'Travas NikeGrip'],
    specs: { Travas: 'FG · NikeGrip', Superfície: 'Campo firme', Peso: '188g' },
    tags: ['campo', 'fg', 'velocidade', 'mercurial'],
    images: [
      { url: '/products/mercurial-vapor/01.jpg', alt: 'Nike Mercurial Vapor XV – lateral', isPrimary: true },
      { url: '/products/mercurial-vapor/02.jpg', alt: 'Nike Mercurial Vapor XV – superior' },
    ],
    sizes: [38,39,40,41,42,43,44,45],
    outOfStock: [37],
  },
  {
    id: 'predator-accuracy-01', slug: 'adidas-predator-accuracy-fg-energy-citrus',
    brandId: 'adidas', categoryId: 'campo', line: 'Predator',
    name: 'Predator Accuracy FG', colorway: 'Energy Citrus',
    sku: 'AD-PRED-ACC-FG-001', badge: 'sale' as const,
    price: 689.99, originalPrice: 799.99, rating: 4.6, reviewCount: 167,
    description: 'Para quem decide com bola parada. Zonas HYBRID TOUCH cobrem toda a área de contato.',
    features: ['Zonas HYBRID TOUCH', 'CONTROLFRAME', 'Cabedal Primeknit'],
    specs: { Travas: 'FG · CONTROLFRAME', Superfície: 'Campo firme', Peso: '215g' },
    tags: ['campo', 'fg', 'controle', 'predator'],
    images: [
      { url: '/products/predator-accuracy/01.jpg', alt: 'Adidas Predator Accuracy – lateral', isPrimary: true },
      { url: '/products/predator-accuracy/02.jpg', alt: 'Adidas Predator Accuracy – superior' },
    ],
    sizes: [37,38,39,40,41,43,44,45],
    outOfStock: [42],
  },
  {
    id: 'future8-ultimate-01', slug: 'puma-future-8-ultimate-fg-sunset-glow',
    brandId: 'puma', categoryId: 'campo', line: 'Future',
    name: 'Future 8 Ultimate FG', colorway: 'Sunset Glow',
    sku: 'PU-FUT8-ULT-FG-001', badge: 'new' as const,
    price: 749.99, rating: 4.5, reviewCount: 94,
    description: 'FUZIONFIT+ de ajuste personalizado com leveza MATRYXEVO para o jogador versátil.',
    features: ['FUZIONFIT+', 'Solado MATRYXEVO', 'Travas de carbono'],
    specs: { Travas: 'FG · Carbon', Superfície: 'Campo firme', Peso: '192g' },
    tags: ['campo', 'fg', 'puma', 'future'],
    images: [
      { url: '/products/future8/01.jpg', alt: 'Puma Future 8 Ultimate – lateral', isPrimary: true },
      { url: '/products/future8/02.jpg', alt: 'Puma Future 8 Ultimate – superior' },
    ],
    sizes: [37,39,40,41,42,43,44],
    outOfStock: [38, 45],
  },
  {
    id: 'mercurial-gold-01', slug: 'nike-air-zoom-mercurial-vapor-xv-elite-fg-gold',
    brandId: 'nike', categoryId: 'campo', line: 'Mercurial',
    name: 'Air Zoom Mercurial Vapor XV Elite FG', colorway: 'Metallic Gold',
    sku: 'NK-MRC-V15-EL-GD-001', badge: 'exclusive' as const,
    price: 949.99, rating: 4.9, reviewCount: 38,
    description: 'Edição especial em acabamento metálico dourado. Exclusiva e colecionável.',
    features: ['Acabamento metálico dourado', 'Air Zoom', 'Edição limitada'],
    specs: { Travas: 'FG · NikeGrip', Peso: '188g' },
    tags: ['campo', 'fg', 'gold', 'limitada'],
    images: [
      { url: '/products/mercurial-gold/01.jpg', alt: 'Nike Mercurial Vapor XV Gold', isPrimary: true },
      { url: '/products/mercurial-gold/02.jpg', alt: 'Nike Mercurial Vapor XV Gold – lateral' },
    ],
    sizes: [38,39,41,42,43,44],
    outOfStock: [40],
  },
]

// ── Stock defaults ──────────────────────────────────────────
const STOCKS: Record<number, number> = { 37:3,38:5,39:7,40:8,41:6,42:9,43:4,44:3,45:2,46:1 }

async function seed() {
  // Clear tables (ordem inversa para FK)
  await db.delete(productSizes)
  await db.delete(productImages)
  await db.delete(products)
  await db.delete(categories)
  await db.delete(brands)
  await db.delete(coupons)
  await db.delete(deliveryZones)

  // Insert brands
  await db.insert(brands).values(brandData)
  console.log(`  ✓ ${brandData.length} marcas`)

  // Insert categories
  await db.insert(categories).values(categoryData)
  console.log(`  ✓ ${categoryData.length} categorias`)

  // Insert products
  for (const p of productData) {
    const { images, sizes, outOfStock, ...rest } = p
    await db.insert(products).values({
      ...rest,
      features: rest.features,
      specs:    rest.specs,
      tags:     rest.tags,
    })

    // Images
    for (let i = 0; i < images.length; i++) {
      await db.insert(productImages).values({
        id: randomUUID(), productId: p.id, sortOrder: i,
        url: images[i].url, alt: images[i].alt,
        isPrimary: images[i].isPrimary ?? false,
      })
    }

    // Sizes
    for (const s of sizes) {
      await db.insert(productSizes).values({
        id: randomUUID(), productId: p.id, size: s,
        available: !outOfStock.includes(s),
        stock: outOfStock.includes(s) ? 0 : (STOCKS[s] ?? 4),
      })
    }
  }
  console.log(`  ✓ ${productData.length} produtos`)

  // Coupons
  await db.insert(coupons).values([
    { id: randomUUID(), code: 'GALVAO10', type: 'percent', value: 10, maxUses: 100, active: 1 as unknown as boolean },
    { id: randomUUID(), code: 'FRETEGRATIS', type: 'shipping', value: 0, minOrderValue: 199, active: 1 as unknown as boolean },
    { id: randomUUID(), code: 'PRIMEIRA', type: 'percent', value: 8, maxUses: 200, active: 1 as unknown as boolean },
  ])
  console.log('  ✓ cupons')

  // Delivery zones (entrega local por CEP prefix)
  await db.insert(deliveryZones).values([
    { id: randomUUID(), name: 'Grande São Paulo', cepPrefix: '01', fee: 0, minDays: 0, maxDays: 1, description: 'Entrega pelo carro — mesmo dia ou próximo dia útil', active: 1 as unknown as boolean },
    { id: randomUUID(), name: 'Grande São Paulo', cepPrefix: '02', fee: 0, minDays: 0, maxDays: 1, description: 'Entrega pelo carro', active: 1 as unknown as boolean },
    { id: randomUUID(), name: 'Grande São Paulo', cepPrefix: '03', fee: 0, minDays: 0, maxDays: 1, description: 'Entrega pelo carro', active: 1 as unknown as boolean },
    { id: randomUUID(), name: 'Grande São Paulo', cepPrefix: '04', fee: 0, minDays: 0, maxDays: 1, description: 'Entrega pelo carro', active: 1 as unknown as boolean },
    { id: randomUUID(), name: 'Grande São Paulo', cepPrefix: '05', fee: 9.90, minDays: 1, maxDays: 2, description: 'Entrega pelo carro — 1-2 dias úteis', active: 1 as unknown as boolean },
  ])
  console.log('  ✓ zonas de entrega')

  console.log('\n✅ Seed concluído!')
}

seed().catch(e => { console.error(e); process.exit(1) })
