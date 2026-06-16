'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { spring } from '@/lib/motion'

export function WishlistButton({
  productId,
  initialFavorited = false,
  isLoggedIn: _ = false,
}: {
  productId: string
  initialFavorited?: boolean
  isLoggedIn?: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [animating, setAnimating]  = useState(false)
  const router    = useRouter()
  const pathname  = usePathname()
  const reduced   = useReducedMotion()

  async function toggle(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    const next = !favorited
    setFavorited(next)
    if (!reduced) setAnimating(true)

    try {
      const res = await fetch('/api/favoritos', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.status === 401) {
        setFavorited(!next)
        // Convidado → login, voltando para a página atual depois de autenticar
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }
      if (!res.ok) setFavorited(!next)
    } catch {
      setFavorited(!next)
    } finally {
      setTimeout(() => setAnimating(false), 400)
    }
  }

  return (
    <motion.button
      onClick={toggle}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={favorited}
      whileTap={reduced ? {} : { scale: 0.85 }}
      transition={spring.snappy}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: '50%', border: 'none',
        background: favorited ? 'rgba(226,59,59,.1)' : 'rgba(255,255,255,.92)',
        cursor: 'pointer', backdropFilter: 'blur(4px)',
        boxShadow: '0 1px 4px rgba(0,0,0,.12)',
        outline: 'none',
      }}
    >
      <motion.svg
        width="18" height="18" viewBox="0 0 24 24"
        strokeWidth="2"
        stroke={favorited ? '#E23B3B' : '#9CA3AF'}
        fill={favorited ? '#E23B3B' : 'none'}
        animate={animating && !reduced ? {
          scale: [1, 1.45, 0.9, 1.18, 1],
          rotate: [0, -10, 8, -4, 0],
        } : { scale: 1, rotate: 0 }}
        // type: 'tween' explícito — multi-keyframe não funciona com spring
        transition={{ type: 'tween', duration: 0.38, ease: 'easeOut' }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
      </motion.svg>
    </motion.button>
  )
}
