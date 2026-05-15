import type { Product } from '../../core/domain/product';

const mkSizes = (from: number, to: number, out: number[] = []) =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const size = from + i;
    return { size, available: !out.includes(size), stock: out.includes(size) ? 0 : Math.floor(Math.random() * 6) + 1 };
  });

export const catalog: Product[] = [
  {
    id: 'phantom-gx3-01', slug: 'nike-phantom-gx3-elite-fg-mad-ready',
    brand: 'Nike', line: 'Phantom', name: 'Phantom GX III Elite FG', colorway: 'Mad Ready',
    sku: 'NK-PHT-GX3-EL-001', category: 'Campo (FG)', badge: 'sale',
    images: [
      { url: '/products/phantom-gx3/01.jpg', alt: 'Nike Phantom GX III Elite – lateral' },
      { url: '/products/phantom-gx3/02.jpg', alt: 'Nike Phantom GX III Elite – superior' },
      { url: '/products/phantom-gx3/03.jpg', alt: 'Nike Phantom GX III Elite – solado' },
      { url: '/products/phantom-gx3/04.jpg', alt: 'Nike Phantom GX III Elite – detalhe' },
      { url: '/products/phantom-gx3/05.jpg', alt: 'Nike Phantom GX III Elite – bico' },
    ],
    price: 529.99, originalPrice: 619.99,
    sizes: mkSizes(37, 44, [43]),
    description: 'Construída para o jogador criativo. O cabedal Gripknit tem microtexturas que aumentam o atrito com a bola: o passe sai limpo, o domínio é mais firme.',
    features: ['Cabedal Gripknit com microtexturas', 'Solado Cyclone Plate em fibra de carbono', 'Cápsula Air Zoom no antepé', 'Ideal para campo firme (FG)'],
    specs: { 'Travas': 'FG · Cyclone', 'Superfície': 'Campo firme', 'Cabedal': 'Gripknit', 'Peso': '190g', 'Modelagem': 'Ajustada' },
    rating: 4.8, reviewCount: 142, inStock: true, tags: ['campo', 'fg', 'elite', 'controle'],
  },
  {
    id: 'f50-elite-01', slug: 'adidas-f50-elite-fg-solar-yellow',
    brand: 'Adidas', line: 'F50', name: 'F50 Elite FG', colorway: 'Solar Yellow',
    sku: 'AD-F50-EL-SY-001', category: 'Campo (FG)', badge: 'new',
    images: [
      { url: '/products/f50-elite/01.jpg', alt: 'Adidas F50 Elite Solar Yellow' },
      { url: '/products/f50-elite/02.jpg', alt: 'Adidas F50 Elite – superior' },
      { url: '/products/f50-elite/03.jpg', alt: 'Adidas F50 Elite – solado' },
      { url: '/products/f50-elite/04.jpg', alt: 'Adidas F50 Elite – detalhe' },
    ],
    price: 799.99, sizes: mkSizes(37, 44, [44]),
    description: 'O F50 Elite retorna como o chute mais rápido da Adidas. A malha SPEEDFRAME integrada à sola acelera cada passo, enquanto o cabedal ultralight mantém o peso abaixo dos 200g.',
    features: ['Estrutura SPEEDFRAME integrada', 'Cabedal ultralight < 200g', 'Travas conificadas', 'Colorway Solar Yellow exclusivo'],
    specs: { 'Travas': 'FG · Conificadas', 'Superfície': 'Campo firme', 'Cabedal': 'SPEEDFRAME', 'Peso': '185g', 'Modelagem': 'Estreita' },
    rating: 4.7, reviewCount: 89, inStock: true, tags: ['campo', 'fg', 'velocidade', 'f50'],
  },
  {
    id: 'mercurial-vapor-01', slug: 'nike-air-zoom-mercurial-vapor-xv-elite-fg',
    brand: 'Nike', line: 'Mercurial', name: 'Air Zoom Mercurial Vapor XV Elite FG', colorway: 'Bright Crimson',
    sku: 'NK-MRC-V15-EL-001', category: 'Campo (FG)', badge: 'new',
    images: [
      { url: '/products/mercurial-vapor/01.jpg', alt: 'Nike Mercurial Vapor XV – lateral' },
      { url: '/products/mercurial-vapor/02.jpg', alt: 'Nike Mercurial Vapor XV – superior' },
      { url: '/products/mercurial-vapor/03.jpg', alt: 'Nike Mercurial Vapor XV – solado' },
    ],
    price: 869.99, sizes: mkSizes(37, 45, [37]),
    description: 'A chuteira mais veloz da Nike. Com Air Zoom no antepé e cabedal Vaporposite+, entrega tração imediata e controle absoluto em campo aberto.',
    features: ['Cabedal Vaporposite+', 'Plataforma Air Zoom no antepé', 'Sola ACC', 'Travas NikeGrip'],
    specs: { 'Travas': 'FG · NikeGrip', 'Superfície': 'Campo firme', 'Cabedal': 'Vaporposite+', 'Peso': '188g', 'Modelagem': 'Estreita a média' },
    rating: 4.9, reviewCount: 213, inStock: true, tags: ['campo', 'fg', 'velocidade', 'mercurial'],
  },
  {
    id: 'predator-accuracy-01', slug: 'adidas-predator-accuracy-fg-energy-citrus',
    brand: 'Adidas', line: 'Predator', name: 'Predator Accuracy FG', colorway: 'Energy Citrus',
    sku: 'AD-PRED-ACC-FG-001', category: 'Campo (FG)', badge: 'sale',
    images: [
      { url: '/products/predator-accuracy/01.jpg', alt: 'Adidas Predator Accuracy – lateral' },
      { url: '/products/predator-accuracy/02.jpg', alt: 'Adidas Predator Accuracy – superior' },
      { url: '/products/predator-accuracy/03.jpg', alt: 'Adidas Predator Accuracy – solado' },
      { url: '/products/predator-accuracy/04.jpg', alt: 'Adidas Predator Accuracy – detalhe' },
    ],
    price: 689.99, originalPrice: 799.99,
    sizes: mkSizes(37, 45, [42]),
    description: 'Construído para quem decide o jogo com bola parada. As zones HYBRID TOUCH cobrem toda a zona de contato com a bola.',
    features: ['Zonas HYBRID TOUCH', 'CONTROLFRAME para estabilidade', 'Cabedal Primeknit', 'Perfeito para bola parada'],
    specs: { 'Travas': 'FG · CONTROLFRAME', 'Superfície': 'Campo firme', 'Cabedal': 'Primeknit + HYBRID TOUCH', 'Peso': '215g', 'Modelagem': 'Média a larga' },
    rating: 4.6, reviewCount: 167, inStock: true, tags: ['campo', 'fg', 'controle', 'predator'],
  },
  {
    id: 'future8-ultimate-01', slug: 'puma-future-8-ultimate-fg-sunset-glow',
    brand: 'Puma', line: 'Future', name: 'Future 8 Ultimate FG', colorway: 'Sunset Glow',
    sku: 'PU-FUT8-ULT-FG-001', category: 'Campo (FG)', badge: 'new',
    images: [
      { url: '/products/future8/01.jpg', alt: 'Puma Future 8 Ultimate – lateral' },
      { url: '/products/future8/02.jpg', alt: 'Puma Future 8 Ultimate – superior' },
      { url: '/products/future8/03.jpg', alt: 'Puma Future 8 Ultimate – solado' },
      { url: '/products/future8/04.jpg', alt: 'Puma Future 8 Ultimate – detalhe' },
    ],
    price: 749.99, sizes: mkSizes(37, 45, [38, 45]),
    description: 'Combina FUZIONFIT+ de ajuste personalizado com a leveza da plataforma MATRYXEVO para o jogador versátil.',
    features: ['FUZIONFIT+ para ajuste personalizado', 'Solado MATRYXEVO ultra-leve', 'Travas de carbono', 'Cabedal sem costura'],
    specs: { 'Travas': 'FG · Carbon', 'Superfície': 'Campo firme', 'Cabedal': 'FUZIONFIT+', 'Peso': '192g', 'Modelagem': 'Média' },
    rating: 4.5, reviewCount: 94, inStock: true, tags: ['campo', 'fg', 'puma', 'future'],
  },
  {
    id: 'mercurial-gold-01', slug: 'nike-air-zoom-mercurial-vapor-xv-elite-fg-gold',
    brand: 'Nike', line: 'Mercurial', name: 'Air Zoom Mercurial Vapor XV Elite FG', colorway: 'Metallic Gold',
    sku: 'NK-MRC-V15-EL-GD-001', category: 'Campo (FG)', badge: 'exclusive',
    images: [
      { url: '/products/mercurial-gold/01.jpg', alt: 'Nike Mercurial Vapor XV Gold – lateral' },
      { url: '/products/mercurial-gold/02.jpg', alt: 'Nike Mercurial Vapor XV Gold – superior' },
    ],
    price: 949.99, sizes: mkSizes(38, 44, [40]),
    description: 'Edição especial em acabamento metálico dourado. Exclusiva para quem quer se destacar dentro e fora do campo.',
    features: ['Acabamento metálico dourado exclusivo', 'Tecnologia Air Zoom', 'Edição limitada', 'Caixa especial colecionável'],
    specs: { 'Travas': 'FG · NikeGrip', 'Superfície': 'Campo firme', 'Cabedal': 'Vaporposite+ dourado', 'Peso': '188g', 'Modelagem': 'Estreita a média' },
    rating: 4.9, reviewCount: 38, inStock: true, tags: ['campo', 'fg', 'exclusiva', 'gold', 'limitada'],
  },
  {
    id: 'tiempo-legend10-ic-01', slug: 'nike-tiempo-legend-10-elite-ic',
    brand: 'Nike', line: 'Tiempo', name: 'Tiempo Legend 10 Elite IC', colorway: 'Obsidian',
    sku: 'NK-TMP-L10-IC-001', category: 'Futsal', badge: 'bestseller',
    images: [{ url: '/products/phantom-gx3/03.jpg', alt: 'Nike Tiempo Legend 10 IC' }],
    price: 479.99, originalPrice: 549.99, sizes: mkSizes(37, 45, []),
    description: 'Projetado para dominar o futsal. Sola lisa de borracha para quadras polidas, com cabedal de couro canguru sintético.',
    features: ['Cabedal K-leather sintético', 'Sola lisa para quadras', 'Nike React no médio-pé'],
    specs: { 'Travas': 'IC · Sola lisa', 'Superfície': 'Quadra', 'Cabedal': 'K-leather', 'Peso': '175g' },
    rating: 4.7, reviewCount: 198, inStock: true, tags: ['futsal', 'ic', 'tiempo'],
  },
  {
    id: 'pegasus-41-01', slug: 'nike-pegasus-41',
    brand: 'Nike', line: 'Pegasus', name: 'Air Zoom Pegasus 41', colorway: 'Wolf Grey',
    sku: 'NK-PEG-41-001', category: 'Corrida', badge: 'new',
    images: [{ url: '/products/mercurial-vapor/02.jpg', alt: 'Nike Pegasus 41' }],
    price: 699.99, sizes: mkSizes(37, 47, [46, 47]),
    description: 'O tênis de corrida mais versátil da Nike. Air Zoom duplo no antepé e salto para amortecimento superior.',
    features: ['Air Zoom Dual Unit', 'Foam ReactX', 'Upper Flyknit', 'Borracha waffle'],
    specs: { 'Drop': '10mm', 'Peso': '290g', 'Amortecimento': 'ReactX + Air Zoom' },
    rating: 4.6, reviewCount: 312, inStock: true, tags: ['corrida', 'treino', 'pegasus'],
  },
  {
    id: 'copa-pure-ic-01', slug: 'adidas-copa-pure-ii-elite-ic',
    brand: 'Adidas', line: 'Copa', name: 'Copa Pure II Elite IC', colorway: 'Core Black',
    sku: 'AD-CPA-P2-IC-001', category: 'Futsal',
    images: [{ url: '/products/predator-accuracy/02.jpg', alt: 'Adidas Copa Pure II IC' }],
    price: 399.99, sizes: mkSizes(37, 45, [43]),
    description: 'Combina couro natural com tecnologia moderna para quadras. O clássico Copa em versão futsal.',
    features: ['Cabedal de couro bovino', 'Sola translúcida', 'LIGHTSTRIKE PRO', 'Design Copa atemporal'],
    specs: { 'Travas': 'IC · Sola lisa', 'Superfície': 'Quadra', 'Cabedal': 'Couro natural', 'Peso': '182g' },
    rating: 4.8, reviewCount: 124, inStock: true, tags: ['futsal', 'ic', 'copa', 'couro'],
  },
  {
    id: 'tocco-iii-01', slug: 'umbro-tocco-iii-pro-fg',
    brand: 'Umbro', line: 'Tocco', name: 'Tocco III Pro FG', colorway: 'Navy/White',
    sku: 'UM-TOC-3-PRO-001', category: 'Campo (FG)',
    images: [{ url: '/products/predator-accuracy/01.jpg', alt: 'Umbro Tocco III Pro' }],
    price: 389.99, sizes: mkSizes(37, 45, [45]),
    description: 'Equilíbrio perfeito entre controle clássico e tecnologia moderna para o jogador técnico.',
    features: ['Cabedal microfibra texturizado', 'Travas conificadas FG', 'Palmilha anatômica'],
    specs: { 'Travas': 'FG · Conificadas', 'Superfície': 'Campo firme', 'Peso': '225g' },
    rating: 4.3, reviewCount: 54, inStock: true, tags: ['campo', 'fg', 'umbro'],
  },
];

export const getBySlug = (slug: string) => catalog.find(p => p.slug === slug);
export const getNewArrivals = () => catalog.filter(p => p.badge === 'new').slice(0, 4);
export const getBestSellers = () => catalog.filter(p => p.rating >= 4.7).slice(0, 8);
export const getSaleProducts = () => catalog.filter(p => p.originalPrice && p.originalPrice > p.price);
export const getByBrand = (brand: string) => catalog.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
export const getByCategory = (cat: string) => catalog.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
