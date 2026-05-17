'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 24,
    }}>

      {/* Bola saltando */}
      <div style={{ position: 'relative', height: 80 }}>
        <motion.div
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: .8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 40 }}
        >
          ⚽
        </motion.div>

        {/* Sombra */}
        <motion.div
          animate={{ scaleX: [1, .5, 1], opacity: [.3, .1, .3] }}
          transition={{ duration: .8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: -4, left: '50%',
            transform: 'translateX(-50%)',
            width: 28, height: 6,
            borderRadius: '50%',
            background: 'var(--fg)',
            filter: 'blur(3px)',
          }}
        />
      </div>

      {/* Texto e dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', fontWeight: 500 }}>
          Carregando
        </span>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * .2 }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-orange)', display: 'inline-block' }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        style={{ width: 120, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ height: '100%', width: '60%', background: 'var(--brand-orange)', borderRadius: 1 }}
        />
      </motion.div>
    </div>
  )
}
