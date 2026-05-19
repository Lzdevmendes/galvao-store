'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WishlistButton({ productId, initialFavorited, isLoggedIn }: {
  productId: string
  initialFavorited: boolean
  isLoggedIn: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading]     = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!isLoggedIn) { router.push('/auth/login'); return }
    setLoading(true)
    const method = favorited ? 'DELETE' : 'POST'
    await fetch('/api/favoritos', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    setFavorited(!favorited)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 44, borderRadius: '50%',
        border: '1px solid var(--border-default, #e5e7eb)',
        background: 'var(--bg-base, #fff)',
        cursor: loading ? 'wait' : 'pointer',
        fontSize: 20, transition: 'all .15s',
        color: favorited ? '#E23B3B' : '#9CA3AF',
      }}
    >
      {favorited ? '♥' : '♡'}
    </button>
  )
}
