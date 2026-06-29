import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// ── Redis singleton ─────────────────────────────────────────────────────────
// Uma única conexão compartilhada por todos os limiters (não cria N instâncias)
const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let _redis: Redis | null = null
function getRedis(): Redis | null {
  if (!hasUpstash) return null
  if (!_redis) {
    _redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

function makeLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`, prefix: string) {
  const redis = getRedis()
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window), prefix })
}

// ── Limiters (todos usam o mesmo Redis) ────────────────────────────────────
export const limiters = {
  // Auth — 5 tentativas de login por IP / 15min
  login:       makeLimiter(5,   '15 m', 'rl:login'),
  // Auth — 10 tentativas por e-mail / 1h (protege conta específica de brute force)
  loginEmail:  makeLimiter(10,  '1 h',  'rl:login_email'),
  // Newsletter — 3 inscrições por IP / 10min + 1 por e-mail / 24h
  newsletter:  makeLimiter(3,   '10 m', 'rl:newsletter_ip'),
  newsletterEmail: makeLimiter(1, '24 h', 'rl:newsletter_email'),
  // Avise-me — 5 por IP / 10min
  aviseme:     makeLimiter(5,   '10 m', 'rl:aviseme'),
  // Checkout — 5 pedidos por IP / 5min (anti-fraude)
  checkout:    makeLimiter(5,   '5 m',  'rl:checkout'),
  // Cart sync — 30 por userId / 1min (autenticado mas pode ser abusado)
  cartSync:    makeLimiter(30,  '1 m',  'rl:cart_sync'),
  // Frete — 20 cálculos por IP / 1min (anti-scraping)
  frete:       makeLimiter(20,  '1 m',  'rl:frete'),
  // API global — 300 req por IP / 1min (DDoS geral, aplicado no middleware)
  apiGlobal:   makeLimiter(300, '1 m',  'rl:api_global'),
  // LGPD — registo de consentimento (cookie banner pode disparar várias vezes)
  consent:     makeLimiter(30,  '10 m', 'rl:consent'),
  // LGPD — exportar dados pessoais (custoso; 3 por hora por user)
  accountExport: makeLimiter(3, '1 h',  'rl:account_export'),
  // LGPD — apagar conta (irreversível; 3 por hora por user)
  accountDelete: makeLimiter(3, '1 h',  'rl:account_delete'),
}

// ── IP anti-spoofing ────────────────────────────────────────────────────────
// Em Vercel: x-real-ip é definido pela infra (não pode ser forjado pelo cliente).
// x-forwarded-for pode ter IPs falsos injetados pelo cliente no início.
// Nunca usar split(',')[0] diretamente — isso é vulnerável.
export function getRealIp(req: NextRequest): string {
  // Vercel injeta x-real-ip com o IP real do cliente
  const realIp = req.headers.get('x-real-ip')
  if (realIp && isValidIp(realIp)) return realIp

  // Fallback: último IP no x-forwarded-for adicionado por proxy confiável
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // Pegar IPs da direita para a esquerda, ignorar IPs privados/loopback
    const ips = forwarded.split(',').map(s => s.trim()).reverse()
    const publicIp = ips.find(ip => isValidIp(ip) && !isPrivateIp(ip))
    if (publicIp) return publicIp
    // Em dev local todos os IPs são privados/loopback — aceitar qualquer um
    if (ips[0] && isValidIp(ips[0])) return ips[0]
  }

  return 'unknown'
}

// Variante para Server Actions (usa next/headers, não NextRequest)
export async function getRealIpFromHeaders(): Promise<string> {
  const hdrs = await headers()
  const realIp = hdrs.get('x-real-ip')
  if (realIp && isValidIp(realIp)) return realIp

  const forwarded = hdrs.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).reverse()
    const publicIp = ips.find(ip => isValidIp(ip) && !isPrivateIp(ip))
    if (publicIp) return publicIp
    if (ips[0] && isValidIp(ips[0])) return ips[0]
  }

  return 'unknown'
}

function isValidIp(ip: string): boolean {
  // IPv4 simples ou IPv6
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip.includes(':')
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('192.168.') ||
    ip === 'unknown'
  )
}

// ── Fallback in-memory (dev / sem Upstash) ─────────────────────────────────
// Namespace por prefixo para isolar contadores
const memStore = new Map<string, { count: number; firstAt: number }>()

function cleanupMemStore() {
  const now = Date.now()
  for (const [k, v] of memStore.entries()) {
    if (now - v.firstAt > 60 * 60 * 1000) memStore.delete(k) // limpar entradas > 1h
  }
}

export function checkMemory(key: string, max: number, windowMs: number): boolean {
  cleanupMemStore()
  const now = Date.now()
  const existing = memStore.get(key)
  if (existing && now - existing.firstAt < windowMs) {
    existing.count++
    return existing.count <= max
  }
  memStore.set(key, { count: 1, firstAt: now })
  return true
}

// ── Resposta padronizada 429 ────────────────────────────────────────────────
// Inclui Retry-After (segundos) e X-RateLimit-* para clientes bem-comportados
export function rateLimitResponse(windowSeconds = 60): NextResponse {
  return NextResponse.json(
    { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(windowSeconds),
        'X-RateLimit-Limit': 'exceeded',
        'Content-Type': 'application/json',
      },
    }
  )
}

// ── Helper unificado para rotas de API ─────────────────────────────────────
// Uso: const blocked = await checkRateLimit(req, limiters.newsletter, ip)
//      if (blocked) return blocked  // retorna o NextResponse 429 direto
export async function checkRateLimit(
  limiter: ReturnType<typeof makeLimiter>,
  key: string,
  fallbackMax: number,
  fallbackWindowMs: number,
  fallbackWindowSec: number,
): Promise<NextResponse | null> {
  if (limiter) {
    const { success, reset } = await limiter.limit(key)
    if (!success) {
      const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : fallbackWindowSec
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': 'exceeded',
          },
        }
      )
    }
  } else if (!checkMemory(key, fallbackMax, fallbackWindowMs)) {
    return rateLimitResponse(fallbackWindowSec)
  }
  return null
}
