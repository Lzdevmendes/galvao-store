'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STORAGE_KEY = 'galvao_cookie_consent'
const ANON_KEY    = 'galvao_anon_id'

interface CookieConsent {
  necessary:  true
  analytics:  boolean
  marketing:  boolean
  acceptedAt: string
}

export function CookieBanner() {
  const [show, setShow]           = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setTimeout(() => setShow(true), 1500)
  }, [])

  const save = (consent: Omit<CookieConsent, 'necessary' | 'acceptedAt'>) => {
    const data: CookieConsent = { necessary: true, ...consent, acceptedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setShow(false)
    // Dispara evento para activar scripts de analytics se consentido
    if (consent.analytics) window.dispatchEvent(new Event('consent:analytics'))
    if (consent.marketing) window.dispatchEvent(new Event('consent:marketing'))
    // LGPD: regista a decisão no servidor (auditável). Best-effort — não bloqueia a UI.
    let anonId = localStorage.getItem(ANON_KEY)
    if (!anonId) { anonId = crypto.randomUUID(); localStorage.setItem(ANON_KEY, anonId) }
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics: consent.analytics, marketing: consent.marketing, anonId }),
    }).catch(() => { /* silent */ })
  }

  const acceptAll     = () => save({ analytics: true,     marketing: true     })
  const acceptPartial = () => save({ analytics,            marketing           })
  const rejectAll     = () => save({ analytics: false,    marketing: false    })

  const Toggle = ({ checked, onChange, label, desc }: {
    checked: boolean; onChange: (v: boolean) => void; label: string; desc: string
  }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--brand-orange)' : 'var(--border)',
          position: 'relative', flexShrink: 0, transition: 'background .2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  )

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 520, zIndex: 9000,
            background: 'var(--bg-elev)', border: '1px solid var(--border)',
            borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.18)',
            padding: expanded ? 28 : '20px 28px',
          }}
        >
          {/* Cabeçalho */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🍪</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, margin: '0 0 4px' }}>
                Utilizamos cookies
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>
                Usamos cookies para melhorar sua experiência e mostrar anúncios relevantes. Veja nossa{' '}
                <Link href="/privacidade" style={{ color: 'var(--brand-orange)', textDecoration: 'none', fontWeight: 600 }}>
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>

          {/* Detalhes expandidos */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: .25 }}
                style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}
              >
                {/* Necessários — sempre activos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>Necessários</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', margin: 0 }}>Autenticação, carrinho, segurança — não podem ser desactivados.</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--brand-green)', fontWeight: 700, padding: '2px 8px', background: 'rgba(44,179,90,.1)', borderRadius: 99, whiteSpace: 'nowrap' }}>Sempre activo</span>
                </div>
                <Toggle
                  checked={analytics} onChange={setAnalytics}
                  label="Analíticos"
                  desc="Google Analytics, Microsoft Clarity — dados agregados de uso para melhorar o site."
                />
                <Toggle
                  checked={marketing} onChange={setMarketing}
                  label="Marketing"
                  desc="Meta Pixel — anúncios personalizados no Facebook e Instagram."
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Acções */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={acceptAll}
              style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: 'var(--brand-orange)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, cursor: 'pointer', minWidth: 140 }}
            >
              Aceitar todos
            </button>

            {expanded ? (
              <button
                onClick={acceptPartial}
                style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 120 }}
              >
                Salvar escolha
              </button>
            ) : (
              <button
                onClick={() => setExpanded(true)}
                style={{ padding: '11px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Personalizar
              </button>
            )}

            <button
              onClick={rejectAll}
              style={{ padding: '11px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--fg-muted)', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' }}
            >
              Rejeitar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para verificar consentimento
export function useCookieConsent() {
  if (typeof window === 'undefined') return { analytics: false, marketing: false }
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return { analytics: false, marketing: false }
  const data: CookieConsent = JSON.parse(saved)
  return { analytics: data.analytics, marketing: data.marketing }
}
