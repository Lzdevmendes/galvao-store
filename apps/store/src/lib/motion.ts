// Configuração central de motion — todos os componentes importam daqui
// Respeita prefers-reduced-motion automaticamente via Framer Motion
//
// ⚠️ REGRA FRAMER MOTION: spring e inertia só suportam 2 keyframes (from → to).
// Para animações com arrays de >2 valores (ex: [1, 1.3, 0.9, 1]), usar:
//   transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
// O spring cria o "bounce" naturalmente com física — não precisa de keyframes.

// ── Springs ──────────────────────────────────────────────────────────────────
// Sport energy: rápido, preciso, decisivo
export const spring = {
  snappy:  { type: 'spring', stiffness: 500, damping: 30 } as const,  // micro-interactions
  bouncy:  { type: 'spring', stiffness: 400, damping: 22 } as const,  // seleções
  smooth:  { type: 'spring', stiffness: 280, damping: 28 } as const,  // hover lifts
  drawer:  { type: 'spring', stiffness: 380, damping: 40 } as const,  // drawer/modal
  page:    { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } as const, // page transitions
}

// ── Variantes reutilizáveis ───────────────────────────────────────────────────
export const fade = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
}

export const slideUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.32, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
}

export const slideRight = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0,  transition: spring.smooth },
  exit:    { opacity: 0, x: 8,  transition: { duration: 0.15 } },
}

// Stagger container — cada filho aparece em cascata
export const staggerContainer = (staggerMs = 0.05) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: staggerMs, delayChildren: 0.05 } },
})

export const staggerItem = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 360, damping: 28 } },
}

// ── Page transition ───────────────────────────────────────────────────────────
export const pageVariants = {
  hidden:  { opacity: 0, y: 8  },
  visible: { opacity: 1, y: 0, transition: spring.page },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.16, ease: 'easeIn' } },
}

// ── Hover presets ─────────────────────────────────────────────────────────────
export const hoverLift   = { y: -4, boxShadow: '0 16px 40px rgba(0,0,0,.14)' }
export const hoverScale  = { scale: 1.04 }
export const tapScale    = { scale: 0.95 }
export const tapPress    = { scale: 0.97 }
