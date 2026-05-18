'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  defaultValue?: string
  placeholder?: string
}

export function SearchInput({ defaultValue = '', placeholder = 'Buscar chuteira, marca, modelo...' }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const submit = useCallback((q: string) => {
    const trimmed = q.trim()
    if (trimmed) {
      router.push(`/busca?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/busca')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => submit(v), 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current)
      submit(value)
    }
    if (e.key === 'Escape') {
      setValue('')
      if (timerRef.current) clearTimeout(timerRef.current)
      router.push('/busca')
    }
  }

  const handleClear = () => {
    setValue('')
    if (timerRef.current) clearTimeout(timerRef.current)
    router.push('/busca')
    inputRef.current?.focus()
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--fg-muted)', pointerEvents: 'none', flexShrink: 0,
        }}
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: '100%',
          padding: '14px 48px 14px 48px',
          borderRadius: 'var(--r-pill)',
          border: '2px solid var(--border-strong)',
          background: 'var(--bg-elev)',
          color: 'var(--fg)',
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          outline: 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--brand-orange)'
          e.currentTarget.style.boxShadow = 'var(--sh-glow)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        aria-label="Campo de busca"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--bg-sunk)', border: 'none',
            color: 'var(--fg-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s, color .15s',
            fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--border-strong)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-sunk)'
            e.currentTarget.style.color = 'var(--fg-muted)'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
