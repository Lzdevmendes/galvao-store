// Melhor Envio API — OAuth 2.0 client_credentials + cotação de frete
// Docs: https://docs.melhorenvio.com.br
// Token dura 15 dias — cacheado em memória no processo Node.js

const BASE_PROD    = 'https://www.melhorenvio.com.br'
const BASE_SANDBOX = 'https://sandbox.melhorenvio.com.br'
const USER_AGENT   = 'Galvão Store lzmendestechdev@gmail.com'

// Cache em memória — sobrevive entre requests no mesmo processo
let _cache: { token: string; expiresAt: number } | null = null

async function getAccessToken(clientId: string, clientSecret: string, sandbox: boolean): Promise<string> {
  if (_cache && Date.now() < _cache.expiresAt) return _cache.token

  const base = sandbox ? BASE_SANDBOX : BASE_PROD
  const res  = await fetch(`${base}/oauth/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
    body: JSON.stringify({
      grant_type:    'client_credentials',
      client_id:     Number(clientId),
      client_secret: clientSecret,
      scope:         'shipping-calculate',
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Melhor Envio OAuth ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data: { access_token: string; expires_in: number } = await res.json()
  // Cache por 14 dias (token dura 15)
  _cache = { token: data.access_token, expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000 }
  return _cache.token
}

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type MEProduct = {
  id:             string
  widthCm:        number
  heightCm:       number
  lengthCm:       number
  weightKg:       number
  insuranceValue: number  // BRL
  quantity:       number
}

export type MEQuoteResult = {
  serviceId:    number
  name:         string
  carrier:      string
  priceInCents: number
  days:         number
}

type MEServiceRaw = {
  id:            number
  name:          string
  price:         string | null
  delivery_time: number
  company:       { name: string }
  error:         string | null
}

// ── Quote ──────────────────────────────────────────────────────────────────

export async function quoteMelhorEnvio(
  originCep:    string,
  destCep:      string,
  products:     MEProduct[],
  clientId:     string,
  clientSecret: string,
  sandbox = false,
): Promise<MEQuoteResult[]> {
  const token = await getAccessToken(clientId, clientSecret, sandbox)
  const base  = sandbox ? BASE_SANDBOX : BASE_PROD

  const body = {
    from:     { postal_code: originCep.replace(/\D/g, '') },
    to:       { postal_code: destCep.replace(/\D/g, '')   },
    products: products.map(p => ({
      id:              p.id,
      width:           p.widthCm,
      height:          p.heightCm,
      length:          p.lengthCm,
      weight:          p.weightKg,
      insurance_value: p.insuranceValue,
      quantity:        p.quantity,
    })),
    options:  { receipt: false, own_hand: false, collect: false },
    services: '1,2',  // 1=PAC 2=SEDEX
  }

  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept:         'application/json',
      Authorization:  `Bearer ${token}`,
      'User-Agent':   USER_AGENT,
    },
    body:   JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Melhor Envio quote ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data: MEServiceRaw[] = await res.json()

  return data
    .filter(s => !s.error && s.price != null && Number(s.price) > 0)
    .map(s => ({
      serviceId:    s.id,
      name:         s.name,
      carrier:      s.company.name,
      priceInCents: Math.round(Number(s.price) * 100),
      days:         s.delivery_time,
    }))
}

// serviceId → método interno
export function meServiceToMethod(id: number): 'sedex' | 'pac' {
  return id === 2 || id === 4 ? 'sedex' : 'pac'
}
