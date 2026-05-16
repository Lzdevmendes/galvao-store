// Frenet API — cálculo de frete via Correios (SEDEX, PAC, Impresso)
// Docs: https://www.frenet.com.br/integracao-api
// Plano gratuito: até 500 consultas/mês sem contrato com Correios

const FRENET_URL = 'https://api.frenet.com.br/shipping/quote'

export type FrenetItem = {
  sku:      string
  quantity: number
  weightKg: number  // peso em kg (ex: 0.5)
  heightCm: number
  widthCm:  number
  lengthCm: number
}

export type FrenetQuoteResult = {
  serviceCode:  string
  description:  string
  carrier:      string
  priceInCents: number  // BRL → centavos
  days:         number
}

type FrenetServiceRaw = {
  ServiceCode:           string
  ServiceDescription:    string
  Carrier:               string
  OriginalDeliveryTime:  number
  OriginalShippingPrice: number
  Error:                 boolean
  Msg:                   string | null
}

type FrenetResponse = {
  ShippingSevicesArray: FrenetServiceRaw[]  // typo intencional da API Frenet
}

export async function quoteFrenet(
  originCep:    string,
  destCep:      string,
  invoiceValue: number,   // em reais (BRL)
  items:        FrenetItem[],
  token:        string,
): Promise<FrenetQuoteResult[]> {
  const body = {
    SellerCEP:            originCep.replace(/\D/g, ''),
    RecipientCEP:         destCep.replace(/\D/g, ''),
    ShipmentInvoiceValue: invoiceValue,
    ShippingItemArray:    items.map(i => ({
      SKU:      i.sku,
      Quantity: i.quantity,
      Weight:   i.weightKg,
      Height:   i.heightCm,
      Width:    i.widthCm,
      Length:   i.lengthCm,
    })),
  }

  const res = await fetch(FRENET_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept:         'application/json',
      token,
    },
    body:    JSON.stringify(body),
    // Timeout 8s — Frenet pode ser lento em horário de pico
    signal:  AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`Frenet HTTP ${res.status}`)

  const data: FrenetResponse = await res.json()

  return data.ShippingSevicesArray
    .filter(s => !s.Error && s.OriginalShippingPrice > 0)
    .map(s => ({
      serviceCode:  s.ServiceCode,
      description:  s.ServiceDescription,
      carrier:      s.Carrier,
      priceInCents: Math.round(s.OriginalShippingPrice * 100),
      days:         s.OriginalDeliveryTime,
    }))
}

// Mapear código de serviço Frenet → método interno
export function frenetCodeToMethod(code: string): 'sedex' | 'pac' {
  // SEDEX: 04014, 04162, 04065, 04553 …
  // PAC:   04510, 04669, 04693 …
  return code.startsWith('04014') || code.startsWith('04162') || code.startsWith('04065')
    ? 'sedex'
    : 'pac'
}
