import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'

// Extracted pure signature validation logic (mirrors the webhook route)
function validateMPSignature(opts: {
  secret:    string
  sig:       string
  requestId: string
  dataId:    string
}): boolean {
  const { secret, sig, requestId, dataId } = opts
  const tsMatch = sig.match(/ts=(\d+)/)
  const v1Match = sig.match(/v1=([a-f0-9]+)/)
  if (!tsMatch || !v1Match) return false

  const ts       = tsMatch[1]
  const expected = v1Match[1]
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const computed  = createHmac('sha256', secret).update(manifest).digest('hex')

  return computed === expected
}

const SECRET     = 'test-webhook-secret'
const REQUEST_ID = 'req-123'
const DATA_ID    = 'payment-456'
const TS         = '1700000000'

function buildSig(secret: string, requestId: string, dataId: string, ts: string): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const hash     = createHmac('sha256', secret).update(manifest).digest('hex')
  return `ts=${ts},v1=${hash}`
}

describe('MercadoPago webhook signature', () => {
  it('accepts a valid signature', () => {
    const sig = buildSig(SECRET, REQUEST_ID, DATA_ID, TS)
    expect(validateMPSignature({ secret: SECRET, sig, requestId: REQUEST_ID, dataId: DATA_ID })).toBe(true)
  })

  it('rejects a tampered data.id', () => {
    const sig = buildSig(SECRET, REQUEST_ID, DATA_ID, TS)
    expect(validateMPSignature({ secret: SECRET, sig, requestId: REQUEST_ID, dataId: 'tampered' })).toBe(false)
  })

  it('rejects a tampered request-id', () => {
    const sig = buildSig(SECRET, REQUEST_ID, DATA_ID, TS)
    expect(validateMPSignature({ secret: SECRET, sig, requestId: 'tampered', dataId: DATA_ID })).toBe(false)
  })

  it('rejects wrong secret', () => {
    const sig = buildSig('wrong-secret', REQUEST_ID, DATA_ID, TS)
    expect(validateMPSignature({ secret: SECRET, sig, requestId: REQUEST_ID, dataId: DATA_ID })).toBe(false)
  })

  it('rejects malformed signature (no ts= prefix)', () => {
    expect(validateMPSignature({ secret: SECRET, sig: 'v1=abc123', requestId: REQUEST_ID, dataId: DATA_ID })).toBe(false)
  })

  it('rejects empty signature', () => {
    expect(validateMPSignature({ secret: SECRET, sig: '', requestId: REQUEST_ID, dataId: DATA_ID })).toBe(false)
  })
})
