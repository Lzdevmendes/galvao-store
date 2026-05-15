import { db } from './client'
import {
  brands, categories, products, productVariants, productImages,
  coupons, deliveryZones, adminUsers, appSettings,
} from './schema'
import { randomUUID } from 'crypto'

// Helpers de preço — R$ para centavos
const brl = (reais: number) => Math.round(reais * 100)

// Tamanhos-padrão para chuteiras com stock
const BOOT_SIZES = [37, 38, 39, 40, 41, 42, 43, 44, 45]
const STOCK: Record<number, number> = { 37:3,38:5,39:7,40:9,41:7,42:9,43:5,44:4,45:2 }

console.log('🌱 Seeding Galvão Store...')

async function clearAll() {
  await db.delete(productImages)
  await db.delete(productVariants)
  await db.delete(products)
  await db.delete(categories)
  await db.delete(brands)
  await db.delete(coupons)
  await db.delete(deliveryZones)
  await db.delete(adminUsers)
  await db.delete(appSettings)
}

async function seedBrands() {
  await db.insert(brands).values([
    { id:'nike',   slug:'nike',        name:'Nike',         tagline:'Just do it · Brasil',
      gradientCss:'linear-gradient(135deg,#0B0E12,#1F252E)', active:true },
    { id:'adidas', slug:'adidas',      name:'Adidas',       tagline:'Three Stripes · Brasil',
      gradientCss:'linear-gradient(135deg,#000,#1F252E)',    active:true },
    { id:'puma',   slug:'puma',        name:'Puma',         tagline:'Forever Faster · Brasil',
      gradientCss:'linear-gradient(135deg,#14181F,#000)',    active:true },
    { id:'umbro',  slug:'umbro',       name:'Umbro',        tagline:'Est. 1924 · Brasil',
      gradientCss:'linear-gradient(135deg,#003366,#0B1A2E)', active:true },
    { id:'nb',     slug:'new-balance', name:'New Balance',  tagline:'Fearlessly Independent',
      gradientCss:'linear-gradient(135deg,#CC0000,#0B0E12)', active:true },
  ])
  console.log('  ✓ marcas')
}

async function seedCategories() {
  await db.insert(categories).values([
    { id:'campo',    slug:'campo',        name:'Campo (FG)',   surfaceType:'FG', sortOrder:1 },
    { id:'society',  slug:'society',      name:'Society (SG)', surfaceType:'SG', sortOrder:2 },
    { id:'futsal',   slug:'futsal',       name:'Futsal (IC)',  surfaceType:'IC', sortOrder:3 },
    { id:'casual',   slug:'tenis-casual', name:'Tênis Casual',                  sortOrder:4 },
    { id:'corrida',  slug:'corrida',      name:'Corrida',                       sortOrder:5 },
    { id:'camisas',  slug:'camisas',      name:'Camisas',                       sortOrder:6 },
    { id:'meias',    slug:'meias',        name:'Meias',                         sortOrder:7 },
  ])
  console.log('  ✓ categorias')
}

async function seedProducts() {
  const catalog = [
    {
      id:'phantom-gx3', slug:'nike-phantom-gx3-elite-fg-mad-ready',
      brandId:'nike', categoryId:'campo', line:'Phantom',
      name:'Phantom GX III Elite FG', skuBase:'NK-PHT-GX3-EL',
      badge:'sale' as const, status:'published' as const,
      description:'Construída para o jogador criativo. Gripknit com microtexturas para controle superior.',
      features:['Cabedal Gripknit','Solado Cyclone Plate carbono','Air Zoom antepé'],
      specs:{ Travas:'FG · Cyclone', Superfície:'Campo firme', Peso:'190g' },
      tags:['campo','fg','elite','controle'],
      variants:[
        { color:'Branco/Marinho', priceCents:brl(529.99), promoCents:null,  sizes:BOOT_SIZES, out:[43] },
        { color:'Preto/Laranja',  priceCents:brl(549.99), promoCents:null,  sizes:BOOT_SIZES, out:[] },
      ],
      images:[
        { url:'/products/phantom-gx3/01.jpg', alt:'Nike Phantom GX III Elite – lateral',  isPrimary:true  },
        { url:'/products/phantom-gx3/02.jpg', alt:'Nike Phantom GX III Elite – superior', isPrimary:false },
        { url:'/products/phantom-gx3/03.jpg', alt:'Nike Phantom GX III Elite – solado',   isPrimary:false },
        { url:'/products/phantom-gx3/04.jpg', alt:'Nike Phantom GX III Elite – detalhe',  isPrimary:false },
      ],
    },
    {
      id:'f50-elite', slug:'adidas-f50-elite-fg-solar-yellow',
      brandId:'adidas', categoryId:'campo', line:'F50',
      name:'F50 Elite FG', skuBase:'AD-F50-EL',
      badge:'new' as const, status:'published' as const,
      description:'O F50 Elite retorna. SPEEDFRAME integrada acelera cada passo, cabedal ultralight < 200g.',
      features:['Estrutura SPEEDFRAME','Cabedal ultralight < 200g','Travas conificadas'],
      specs:{ Travas:'FG · Conificadas', Superfície:'Campo firme', Peso:'185g' },
      tags:['campo','fg','velocidade','f50'],
      variants:[
        { color:'Solar Yellow', priceCents:brl(799.99), promoCents:null, sizes:BOOT_SIZES, out:[44] },
      ],
      images:[
        { url:'/products/f50-elite/01.jpg', alt:'Adidas F50 Elite Solar Yellow', isPrimary:true  },
        { url:'/products/f50-elite/02.jpg', alt:'Adidas F50 Elite – superior',   isPrimary:false },
        { url:'/products/f50-elite/03.jpg', alt:'Adidas F50 Elite – solado',     isPrimary:false },
      ],
    },
    {
      id:'mercurial-vapor', slug:'nike-air-zoom-mercurial-vapor-xv-elite-fg',
      brandId:'nike', categoryId:'campo', line:'Mercurial',
      name:'Air Zoom Mercurial Vapor XV Elite FG', skuBase:'NK-MRC-V15-EL',
      badge:'new' as const, status:'published' as const,
      description:'A mais veloz da Nike. Air Zoom no antepé e Vaporposite+ para tração imediata.',
      features:['Cabedal Vaporposite+','Air Zoom antepé','Travas NikeGrip'],
      specs:{ Travas:'FG · NikeGrip', Superfície:'Campo firme', Peso:'188g' },
      tags:['campo','fg','velocidade','mercurial'],
      variants:[
        { color:'Bright Crimson', priceCents:brl(869.99), promoCents:null, sizes:BOOT_SIZES, out:[37] },
        { color:'Metallic Gold',  priceCents:brl(949.99), promoCents:null, sizes:[38,39,41,42,43,44], out:[] },
      ],
      images:[
        { url:'/products/mercurial-vapor/01.jpg', alt:'Nike Mercurial Vapor XV – lateral',  isPrimary:true  },
        { url:'/products/mercurial-vapor/02.jpg', alt:'Nike Mercurial Vapor XV – superior', isPrimary:false },
        { url:'/products/mercurial-gold/01.jpg',  alt:'Nike Mercurial Vapor XV Gold',       isPrimary:false },
      ],
    },
    {
      id:'predator-accuracy', slug:'adidas-predator-accuracy-fg-energy-citrus',
      brandId:'adidas', categoryId:'campo', line:'Predator',
      name:'Predator Accuracy FG', skuBase:'AD-PRED-ACC-FG',
      badge:'sale' as const, status:'published' as const,
      description:'Para quem decide com bola parada. HYBRID TOUCH cobrem toda a área de contato.',
      features:['Zonas HYBRID TOUCH','CONTROLFRAME carbono','Cabedal Primeknit'],
      specs:{ Travas:'FG · CONTROLFRAME', Superfície:'Campo firme', Peso:'215g' },
      tags:['campo','fg','controle','predator'],
      variants:[
        { color:'Energy Citrus', priceCents:brl(799.99), promoCents:brl(689.99), sizes:BOOT_SIZES, out:[42] },
      ],
      images:[
        { url:'/products/predator-accuracy/01.jpg', alt:'Adidas Predator Accuracy – lateral',  isPrimary:true  },
        { url:'/products/predator-accuracy/02.jpg', alt:'Adidas Predator Accuracy – superior', isPrimary:false },
        { url:'/products/predator-accuracy/03.jpg', alt:'Adidas Predator Accuracy – solado',   isPrimary:false },
      ],
    },
    {
      id:'future8-ultimate', slug:'puma-future-8-ultimate-fg-sunset-glow',
      brandId:'puma', categoryId:'campo', line:'Future',
      name:'Future 8 Ultimate FG', skuBase:'PU-FUT8-ULT-FG',
      badge:'new' as const, status:'published' as const,
      description:'FUZIONFIT+ de ajuste personalizado com leveza MATRYXEVO para o jogador versátil.',
      features:['FUZIONFIT+ personalizado','Solado MATRYXEVO','Travas de carbono'],
      specs:{ Travas:'FG · Carbon', Superfície:'Campo firme', Peso:'192g' },
      tags:['campo','fg','puma','future'],
      variants:[
        { color:'Sunset Glow', priceCents:brl(749.99), promoCents:null, sizes:BOOT_SIZES, out:[38,45] },
      ],
      images:[
        { url:'/products/future8/01.jpg', alt:'Puma Future 8 Ultimate – lateral',  isPrimary:true  },
        { url:'/products/future8/02.jpg', alt:'Puma Future 8 Ultimate – superior', isPrimary:false },
        { url:'/products/future8/03.jpg', alt:'Puma Future 8 Ultimate – solado',   isPrimary:false },
      ],
    },
  ]

  for (const p of catalog) {
    const { variants, images, ...productData } = p

    await db.insert(products).values({
      ...productData,
      features: productData.features,
      specs:    productData.specs,
      tags:     productData.tags,
    })

    // Imagens do produto
    for (let i = 0; i < images.length; i++) {
      await db.insert(productImages).values({
        id: randomUUID(), productId: p.id,
        ...images[i], sortOrder: i,
      })
    }

    // Variantes (cor × tamanhos)
    for (const v of variants) {
      for (const size of v.sizes) {
        const isOut = v.out.includes(size)
        await db.insert(productVariants).values({
          id:                randomUUID(),
          productId:         p.id,
          sku:               `${p.skuBase}-${v.color.replace(/[^A-Z0-9]/gi,'-').toUpperCase()}-${size}`,
          size:              String(size),
          color:             v.color,
          priceInCents:      v.priceCents,
          pricePromoInCents: v.promoCents ?? null,
          stock:             isOut ? 0 : (STOCK[size] ?? 4),
          stockReserved:     0,
          available:         !isOut,
        })
      }
    }
  }
  console.log(`  ✓ ${catalog.length} produtos com variantes`)
}

async function seedCoupons() {
  await db.insert(coupons).values([
    { id:randomUUID(), code:'GALVAO10',    type:'percent'  as const, value:10, maxUses:100, active:true },
    { id:randomUUID(), code:'FRETEGRATIS', type:'shipping' as const, value:0,  minOrderInCents:brl(199), active:true },
    { id:randomUUID(), code:'PRIMEIRA',    type:'percent'  as const, value:8,  maxUses:200, active:true },
    { id:randomUUID(), code:'PIX15',       type:'percent'  as const, value:15, maxUses:50,  active:false,
      expiresAt: '2026-06-01T00:00:00' },
  ])
  console.log('  ✓ cupões')
}

async function seedDelivery() {
  // Entrega pelo carro — por prefixo de CEP (Grande SP)
  const zones = ['01','02','03','04','05','06','07','08'].map((prefix, i) => ({
    id:          randomUUID(),
    name:        `Grande SP — zona ${prefix}xxx`,
    cepPrefix:   prefix,
    feeInCents:  i < 4 ? 0 : brl(9.90),
    minDays:     0,
    maxDays:     i < 4 ? 1 : 2,
    description: `Entrega pelo carro — ${i < 4 ? 'mesmo dia ou próximo dia útil' : '1–2 dias úteis'}`,
    active:      true,
  }))
  await db.insert(deliveryZones).values(zones)
  console.log('  ✓ zonas de entrega')
}

async function seedAdmin() {
  await db.insert(adminUsers).values({
    id:    randomUUID(),
    email: 'admin@galvaosstore.com.br',
    name:  'Anderson Galvão',
    role:  'owner',
    active: true,
  })
  console.log('  ✓ admin user')
}

async function seedSettings() {
  await db.insert(appSettings).values([
    { key:'store.name',              value:JSON.stringify("Galvão's Store") },
    { key:'store.email',             value:JSON.stringify('contato@galvaosstore.com.br') },
    { key:'shipping.free_above',     value:JSON.stringify(39900) },    // R$ 399 em centavos
    { key:'payment.pix_discount_pct',value:JSON.stringify(5) },        // 5%
    { key:'payment.max_installments',value:JSON.stringify(12) },
  ])
  console.log('  ✓ configurações')
}

async function seed() {
  await clearAll()
  await seedBrands()
  await seedCategories()
  await seedProducts()
  await seedCoupons()
  await seedDelivery()
  await seedAdmin()
  await seedSettings()
  console.log('\n✅ Seed concluído!')
}

seed().catch(e => { console.error(e); process.exit(1) })
