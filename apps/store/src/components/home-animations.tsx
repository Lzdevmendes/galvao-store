'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

// Aplica classes de animação nos elementos da home via IntersectionObserver
export function HomeAnimations() {
  // Marca o home no <html> — ativa o hero full-bleed + header transparente (CSS escopado)
  useEffect(() => {
    document.documentElement.dataset.home = 'true'
    return () => { delete document.documentElement.dataset.home }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}

// Card com hover lift
export function AnimCard({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,.18)' }}
      whileTap={{ scale: .98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// Fade-in para seções
export function FadeIn({ children, delay = 0, className, style }: {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .5, delay, ease: [.25, .46, .45, .94] }}
    >
      {children}
    </motion.div>
  )
}

// Stagger container para grids de produtos
export function StaggerGrid({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        visible: { transition: { staggerChildren: 0.07 } },
        hidden:  {},
      }}
    >
      {children}
    </motion.div>
  )
}

// Item do stagger
export function StaggerItem({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: .4, ease: [.25,.46,.45,.94] } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Trust bar item com bounce
export function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="item"
      initial={{ opacity: 0, scale: .9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
