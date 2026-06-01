import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

function makeRedisLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`, prefix: string) {
  if (!hasUpstash) return null
  return new Ratelimit({
    redis: new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  })
}

// 5 inscrições por IP a cada 10 minutos
export const newsletterLimit = makeRedisLimiter(5, '10 m', 'galvao:newsletter')

// 10 alertas por IP a cada 10 minutos
export const aviseMeLimit = makeRedisLimiter(10, '10 m', 'galvao:aviseme')

// Fallback in-memory quando sem Upstash (dev / single instance)
const inMemoryStore = new Map<string, { count: number; firstAt: number }>()

export function checkInMemory(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  for (const [k, v] of inMemoryStore.entries()) {
    if (now - v.firstAt > windowMs) inMemoryStore.delete(k)
  }
  const entry = inMemoryStore.get(key) ?? { count: 0, firstAt: now }
  entry.count++
  if (entry.count === 1) entry.firstAt = now
  inMemoryStore.set(key, entry)
  return entry.count <= max
}
