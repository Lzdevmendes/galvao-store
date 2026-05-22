'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: '85vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,59,59,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px', maxWidth: 560 }}>
        {/* Ícone */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          style={{ marginBottom: 24 }}
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{ display: 'inline-block', fontSize: 56 }}
          >
            🟥
          </motion.span>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(40px,6vw,64px)', lineHeight: .95, margin: 0, letterSpacing: '.02em' }}>
            <span style={{ color: 'var(--fg)' }}>CARTÃO</span>
            <br />
            <span style={{ color: '#E23B3B' }}>VERMELHO.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .35 }}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', margin: '0 auto 12px', maxWidth: 380, lineHeight: 1.65 }}
        >
          {error?.message && error.message !== 'An error occurred in the Server Components render.'
            ? error.message
            : 'Algo correu mal num dos jogadores da nossa equipa. Estamos a resolver.'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .4 }}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-faint)', marginBottom: 36 }}
        >
          Nenhum valor foi cobrado.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .5 }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={reset}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--brand-orange)', color: '#fff', cursor: 'pointer' }}
          >
            ↺ Tentar novamente
          </button>
          <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--fg-muted)', textDecoration: 'none' }}>
            Voltar ao início
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
