'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { Variants } from 'framer-motion'

const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 8  },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.16, ease: 'easeIn' } },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname()
  const reduced      = useReducedMotion()

  // Com reduced-motion: sem animação, só renderiza
  if (reduced) return <>{children}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Scroll reveal — aparece ao entrar no viewport ─────────────────────────────
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'none'
  className?: string
  style?: React.CSSProperties
}) {
  const reduced = useReducedMotion()

  const initial = reduced ? {} : {
    opacity: 0,
    y: direction === 'up'  ? 28 : 0,
    x: direction === 'left' ? -20 : 0,
  }
  const animate = { opacity: 1, y: 0, x: 0 }
  const transition = { duration: 0.45, ease: 'easeOut' as const, delay }

  return (
    <motion.div
      className={className}
      style={style}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger grid — filhos aparecem em cascata ─────────────────────────────────
export function StaggerGrid({
  children,
  className,
  style,
  stagger = 0.05,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  stagger?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className} style={style}>{children}</div>

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.04 } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Item do stagger grid
export function StaggerItem({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden:  { opacity: 0, y: 22, scale: 0.97 },
        visible: { opacity: 1, y: 0,  scale: 1,
          transition: { type: 'spring', stiffness: 360, damping: 28 } },
      }}
    >
      {children}
    </motion.div>
  )
}
