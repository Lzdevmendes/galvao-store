// Melhor Envio API — SEDEX, PAC e transportadoras privadas
// Docs: https://docs.melhorenvio.com.br
// Sandbox: sandbox.melhorenvio.com.br | Prod: melhorenvio.com.br

const BASE_PROD    = 'https://www.melhorenvio.com.br/api/v2'
const BASE_SANDBOX = 'https://sandbox.melhorenvio.com.br/api/v2'

const USER_AGENT = 'Galvão Store dev@galvaostore.com.br'

// IDs de serviço Melhor Envio (Correios)
// 1 = PAC | 2 = SEDEX | 3 = PAC Mini | 4 = SEDEX Mini
const CORREIOS_SERVICES = '1,2'

export type MEProduct = {
  id:             string   // SKU ou variantId
  widthCm:        number
  heightCm:       number
  lengthCm:       number
  weightKg:       number
  insuranceValue: number   // valor da nota em BRL
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

export async function quoteMelhorEnvio(
  originCep:  string,
  destCep:    string,
  products:   MEProduct[],
  token:      string,
  sandbox = false,
): Promise<MEQuoteResult[]> {
  const base = sandbox ? BASE_SANDBOX : BASE_PROD

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
    services: CORREIOS_SERVICES,
  }

  const res = await fetch(`${base}/me/shipment/calculate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Accept:          'application/json',
      Authorization:   `Bearer ${token}`,
      'User-Agent':    USER_AGENT,
    },
    body:   JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Melhor Envio HTTP ${res.status}: ${text.slice(0, 200)}`)
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

// Mapear serviceId Melhor Envio → método interno
export function meServiceToMethod(id: number): 'sedex' | 'pac' {
  // 2 = SEDEX, 4 = SEDEX Mini → sedex
  // 1 = PAC,  3 = PAC Mini  → pac
  return id === 2 || id === 4 ? 'sedex' : 'pac'
}
