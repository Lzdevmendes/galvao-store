import type { Product } from '../../core/domain/product';

// Stock determinístico — sem Math.random para evitar inconsistências entre renders
const STOCKS: Record<number, number> = { 37:3, 38:5, 39:7, 40:8, 41:6, 42:9, 43:4, 44:3, 45:2, 46:1 }
const mkSizes = (from: number, to: number, out: number[] = []) =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const size = from + i
    return { size, available: !out.includes(size), stock: out.includes(size) ? 0 : (STOCKS[size] ?? 4) }
  })

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
  // ── Tênis Casual ───────────────────────────────────────────
  {
    id: 'air-max-90-01', slug: 'nike-air-max-90-white',
    brand: 'Nike', line: 'Air Max', name: 'Air Max 90', colorway: 'White/White',
    sku: 'NK-AM90-WHT-001', category: 'Tênis Casual', badge: 'bestseller',
    images: [{ url: '/products/mercurial-vapor/02.jpg', alt: 'Nike Air Max 90 White' }],
    price: 649.99, originalPrice: 749.99,
    sizes: mkSizes(37, 46, [46]),
    description: 'Ícone do streetwear esportivo. O Air Max 90 combina a unidade Air visível no calcanhar com a silhueta que definiu uma geração.',
    features: ['Unidade Air visível no calcanhar', 'Cabedal em couro e mesh', 'Entressola de espuma leve', 'Outsole de borracha waffle'],
    specs: { 'Drop': '10mm', 'Peso': '350g', 'Cabedal': 'Couro + Mesh', 'Sola': 'Borracha waffle' },
    rating: 4.8, reviewCount: 423, inStock: true, tags: ['casual', 'streetwear', 'air max', 'branco'],
  },
  {
    id: 'samba-og-01', slug: 'adidas-samba-og-white-black',
    brand: 'Adidas', line: 'Samba', name: 'Samba OG', colorway: 'White/Black',
    sku: 'AD-SAMBA-OG-WB-001', category: 'Tênis Casual',
    images: [{ url: '/products/f50-elite/02.jpg', alt: 'Adidas Samba OG' }],
    price: 549.99,
    sizes: mkSizes(37, 45, []),
    description: 'Nascido para o futsal nos anos 50, o Samba se tornou o tênis mais icónico do mundo. Cabedal de couro premium, goma na sola.',
    features: ['Cabedal de couro premium', 'Sola de goma T-toe', 'Palmilha macia OrthoLite', 'Silhueta atemporal'],
    specs: { 'Drop': '8mm', 'Peso': '320g', 'Cabedal': 'Couro bovino', 'Sola': 'Goma natural' },
    rating: 4.9, reviewCount: 876, inStock: true, tags: ['casual', 'samba', 'couro', 'streetwear'],
  },
  {
    id: 'suede-classic-01', slug: 'puma-suede-classic-blue',
    brand: 'Puma', line: 'Suede', name: 'Suede Classic XXI', colorway: 'Royal Blue/White',
    sku: 'PU-SUEDE-XXI-RB-001', category: 'Tênis Casual', badge: 'sale',
    images: [{ url: '/products/future8/02.jpg', alt: 'Puma Suede Classic' }],
    price: 299.99, originalPrice: 379.99,
    sizes: mkSizes(37, 45, []),
    description: 'O Suede é o tênis mais reconhecível da Puma. Cabedal de camurça suave, sola de borracha e detalhes contrastantes.',
    features: ['Cabedal de camurça suave', 'Sola de borracha com ranhuras', 'Palmilha foam confortável', 'Listras Puma em contraste'],
    specs: { 'Drop': '9mm', 'Peso': '310g', 'Cabedal': 'Camurça', 'Sola': 'Borracha' },
    rating: 4.5, reviewCount: 312, inStock: true, tags: ['casual', 'suede', 'camurça', 'azul'],
  },
  // ── Corrida ────────────────────────────────────────────────
  {
    id: 'ultraboost-24-01', slug: 'adidas-ultraboost-24-black',
    brand: 'Adidas', line: 'Ultraboost', name: 'Ultraboost 24', colorway: 'Core Black',
    sku: 'AD-UB24-BLK-001', category: 'Corrida', badge: 'new',
    images: [{ url: '/products/f50-elite/03.jpg', alt: 'Adidas Ultraboost 24 Black' }],
    price: 899.99,
    sizes: mkSizes(37, 46, []),
    description: 'O máximo em retorno de energia. A plataforma BOOST absorve o impacto e devolve cada passo com força propulsora.',
    features: ['Plataforma BOOST para máximo retorno', 'LIGHTSTRIKE PRO na zona de impacto', 'Primeknit+ respirável', 'Continental Rubber outsole'],
    specs: { 'Drop': '10mm', 'Peso': '310g', 'Amortecimento': 'BOOST', 'Upper': 'Primeknit+' },
    rating: 4.8, reviewCount: 567, inStock: true, tags: ['corrida', 'boost', 'treino', 'diário'],
  },
  {
    id: 'invincible-3-01', slug: 'nike-invincible-3-white',
    brand: 'Nike', line: 'Invincible', name: 'InvincibleRun Flyknit 3', colorway: 'White/Volt',
    sku: 'NK-INV3-WV-001', category: 'Corrida',
    images: [{ url: '/products/mercurial-gold/01.jpg', alt: 'Nike InvincibleRun 3' }],
    price: 1099.99,
    sizes: mkSizes(37, 46, [37, 38]),
    description: 'O máximo amortecimento da Nike. Dupla camada de ZoomX foam para corridas longas que exigem proteção máxima das articulações.',
    features: ['Dupla camada ZoomX foam', 'Flyknit respirável e adaptável', 'Geometria de rocking para eficiência', 'Widened base para estabilidade'],
    specs: { 'Drop': '9mm', 'Peso': '330g', 'Amortecimento': 'ZoomX duplo', 'Upper': 'Flyknit' },
    rating: 4.7, reviewCount: 234, inStock: true, tags: ['corrida', 'zoomx', 'máximo amortecimento', 'longa distância'],
  },
  // ── Camisas ────────────────────────────────────────────────
  {
    id: 'camisa-brasil-2026-01', slug: 'nike-camisa-selecao-brasileira-2026',
    brand: 'Nike', line: 'Seleção', name: 'Camisa Seleção Brasileira I', colorway: 'Amarelo Ouro',
    sku: 'NK-CBF-26-H-001', category: 'Camisas', badge: 'new',
    images: [{ url: '/products/mercurial-gold/02.jpg', alt: 'Camisa Brasil 2026' }],
    price: 399.99, originalPrice: 449.99,
    sizes: [
      { size: 1, available: true, stock: 5 },  // PP
      { size: 2, available: true, stock: 8 },  // P
      { size: 3, available: true, stock: 12 }, // M
      { size: 4, available: true, stock: 6 },  // G
      { size: 5, available: false, stock: 0 }, // GG
    ],
    description: 'A camisa oficial da Seleção Brasileira para a Copa 2026. Dri-FIT ADV para máximo desempenho no calor.',
    features: ['Tecido Dri-FIT ADV', 'Corte slim para atletas', 'Patches bordados oficiais', 'Certificação FIFA Quality'],
    specs: { 'Material': '100% Poliéster reciclado', 'Tecnologia': 'Dri-FIT ADV', 'Fit': 'Slim', 'Certificação': 'FIFA Quality' },
    rating: 4.9, reviewCount: 892, inStock: true, tags: ['camisa', 'seleção', 'brasil', 'copa 2026'],
  },
  {
    id: 'camisa-real-madrid-01', slug: 'adidas-camisa-real-madrid-2025',
    brand: 'Adidas', line: 'Real Madrid', name: 'Camisa Real Madrid I 2025/26', colorway: 'Branca',
    sku: 'AD-RMA-25-H-001', category: 'Camisas',
    images: [{ url: '/products/f50-elite/04.jpg', alt: 'Camisa Real Madrid 2025/26' }],
    price: 499.99,
    sizes: [
      { size: 1, available: true, stock: 3 },
      { size: 2, available: true, stock: 7 },
      { size: 3, available: true, stock: 10 },
      { size: 4, available: true, stock: 4 },
      { size: 5, available: true, stock: 2 },
    ],
    description: 'A camisa oficial do Real Madrid 2025/26. HEAT.RDY mantém a temperatura ideal nos jogos mais intensos.',
    features: ['Tecido HEAT.RDY', 'Escudo bordado oficial', 'Torcedor fan version', 'Certificação UCL'],
    specs: { 'Material': 'Poliéster reciclado', 'Tecnologia': 'HEAT.RDY', 'Fit': 'Regular' },
    rating: 4.7, reviewCount: 345, inStock: true, tags: ['camisa', 'real madrid', 'laliga', 'branca'],
  },
  // ── Meias ──────────────────────────────────────────────────
  {
    id: 'meias-nike-elite-01', slug: 'nike-elite-crew-meias',
    brand: 'Nike', line: 'Elite', name: 'Meias Elite Crew Futebol', colorway: 'Preto/Laranja',
    sku: 'NK-SOC-ELT-CRW-001', category: 'Meias',
    images: [{ url: '/products/phantom-gx3/04.jpg', alt: 'Meias Nike Elite' }],
    price: 49.99,
    sizes: [
      { size: 1, available: true, stock: 20 }, // P (34-38)
      { size: 2, available: true, stock: 15 }, // M (39-42)
      { size: 3, available: true, stock: 10 }, // G (43-46)
    ],
    description: 'As meias Nike Elite Crew para futebol. Suporte de arco integrado e amortecimento em zonas de impacto.',
    features: ['Suporte de arco integrado', 'Amortecimento estratégico', 'Malha Dri-FIT', 'Cano alto'],
    specs: { 'Material': '70% Nylon, 28% Poliéster, 2% Elastano', 'Altura': 'Cano alto', 'Pack': '1 par' },
    rating: 4.5, reviewCount: 156, inStock: true, tags: ['meias', 'futebol', 'elite', 'crew'],
  },
  {
    id: 'meias-adidas-3s-01', slug: 'adidas-3-stripes-meias-pack',
    brand: 'Adidas', name: 'Meias 3-Stripes Performance', colorway: 'Branco Pack 3 pares',
    sku: 'AD-SOC-3S-W3-001', category: 'Meias', badge: 'sale',
    images: [{ url: '/products/predator-accuracy/03.jpg', alt: 'Meias Adidas 3 Stripes' }],
    price: 69.99, originalPrice: 89.99,
    sizes: [
      { size: 1, available: true, stock: 25 },
      { size: 2, available: true, stock: 18 },
      { size: 3, available: true, stock: 12 },
    ],
    description: 'Pack com 3 pares de meias Adidas Performance CLIMALITE. Perfeitas para treinos diários.',
    features: ['Tecnologia CLIMALITE', 'Costuras planas anti-bolhas', '3 listras icónicas', 'Pack com 3 pares'],
    specs: { 'Material': '75% Poliéster, 23% Nylon, 2% Elastano', 'Tecnologia': 'CLIMALITE', 'Pack': '3 pares' },
    rating: 4.4, reviewCount: 234, inStock: true, tags: ['meias', 'futebol', 'performance', 'pack'],
  },
  // ── Society ────────────────────────────────────────────────
  {
    id: 'superfly-10-society-01', slug: 'nike-superfly-10-elite-sg',
    brand: 'Nike', line: 'Superfly', name: 'Superfly 10 Elite SG-Pro', colorway: 'Black/Chrome',
    sku: 'NK-SFY10-EL-SG-001', category: 'Society (SG)', badge: 'new',
    images: [{ url: '/products/phantom-gx3/02.jpg', alt: 'Nike Superfly 10 SG' }],
    price: 849.99,
    sizes: mkSizes(38, 45, []),
    description: 'A bota Superfly 10 Elite em versão SG-Pro para campos moles. Travas de aço anti-clog para máxima tração.',
    features: ['Bota alta integrada', 'Travas SG-Pro Anti-Clog', 'Cabedal Vaporposite+', 'Air Zoom no antepé'],
    specs: { 'Travas': 'SG · Anti-Clog', 'Superfície': 'Campo mole', 'Peso': '215g' },
    rating: 4.6, reviewCount: 67, inStock: true, tags: ['society', 'sg', 'superfly', 'bota'],
  },
  {
    id: 'x-crazyfast-society-01', slug: 'adidas-x-crazyfast-elite-sg',
    brand: 'Adidas', line: 'X Crazyfast', name: 'X Crazyfast.1 Elite SG', colorway: 'Solar Orange',
    sku: 'AD-XCF-EL-SG-001', category: 'Society (SG)',
    images: [{ url: '/products/f50-elite/01.jpg', alt: 'Adidas X Crazyfast SG' }],
    price: 779.99, originalPrice: 899.99,
    sizes: mkSizes(38, 45, [44]),
    description: 'A mais veloz da linha X em versão Society. Travas de aço removíveis para campos de grama natural molhada.',
    features: ['Travas de aço removíveis', 'Cabedal Carb0n Ultra', 'Peso abaixo de 185g', 'Ideal para campos molhados'],
    specs: { 'Travas': 'SG · Removíveis', 'Superfície': 'Grama molhada', 'Peso': '183g' },
    rating: 4.5, reviewCount: 43, inStock: true, tags: ['society', 'sg', 'velocidade', 'crazyfast'],
  },
];

export const getBySlug = (slug: string) => catalog.find(p => p.slug === slug);
export const getNewArrivals = () => catalog.filter(p => p.badge === 'new').slice(0, 4);
export const getBestSellers = () => catalog.filter(p => p.rating >= 4.7).slice(0, 8);
export const getSaleProducts = () => catalog.filter(p => p.originalPrice && p.originalPrice > p.price);
export const getByBrand = (brand: string) => catalog.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
export const getByCategory = (cat: string) => catalog.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
