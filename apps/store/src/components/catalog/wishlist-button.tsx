'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WishlistButton({ productId, initialFavorited = false, isLoggedIn: _ = false }: {
  productId: string
  initialFavorited?: boolean
  isLoggedIn?: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const router = useRouter()

  async function toggle(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    const next = !favorited
    setFavorited(next)
    try {
      const res = await fetch('/api/favoritos', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.status === 401) { setFavorited(!next); router.push('/auth/login'); return }
      if (!res.ok) setFavorited(!next)
    } catch {
      setFavorited(!next)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 44, borderRadius: '50%',
        border: `1px solid ${favorited ? '#E23B3B44' : 'var(--border-default, #e5e7eb)'}`,
        background: favorited ? '#E23B3B0A' : 'var(--bg-base, #fff)',
        cursor: 'pointer',
        fontSize: 20, transition: 'all .2s',
        color: favorited ? '#E23B3B' : '#9CA3AF',
        transform: favorited ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {favorited ? '♥' : '♡'}
    </button>
  )
}
