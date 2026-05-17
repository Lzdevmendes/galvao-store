'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const MESSAGES = [
  { top: 'FORA',     bottom: 'DE CAMPO.',  sub: 'Esta página foi para o banco de reservas.' },
  { top: 'GOL',      bottom: 'ANULADO.',   sub: 'O link que você chutou foi para fora.' },
  { top: 'PÊNALTI',  bottom: 'ERRADO.',    sub: 'A página que você queria foi para o travessão.' },
  { top: 'CARTÃO',   bottom: 'VERMELHO.',  sub: 'Esta URL foi expulsa do campo.' },
]

export default function NotFound() {
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])

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

      {/* Círculo central que esmaece para o branco — o "spotlight" */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 680,
        height: 680,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,107,31,.07) 0%, rgba(11,14,18,.04) 35%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Anel laranja subtil */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 520,
        height: 520,
        borderRadius: '50%',
        border: '1px solid rgba(242,107,31,.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
        height: 700,
        borderRadius: '50%',
        border: '1px solid rgba(242,107,31,.04)',
        pointerEvents: 'none',
      }} />

      {/* Conteúdo */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px', maxWidth: 620 }}>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, scale: .92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .6, ease: [.25, .46, .45, .94] }}
          style={{
            fontFamily: 'var(--font-stencil)',
            fontSize: 'clamp(110px, 18vw, 180px)',
            lineHeight: 1,
            letterSpacing: '.06em',
            color: 'var(--ink-200)',
            userSelect: 'none',
            marginBottom: -16,
          }}
        >
          404
        </motion.div>

        {/* Bola flutuante */}
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: .25 }}
          style={{ marginBottom: 28 }}
        >
          <motion.span
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: .9 }}
            style={{ display: 'inline-block', fontSize: 52, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.15))' }}
          >
            ⚽
          </motion.span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, delay: .3 }}
          style={{ marginBottom: 16 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-stencil)',
            fontSize: 'clamp(48px, 7.5vw, 80px)',
            lineHeight: .95,
            margin: 0,
            letterSpacing: '.02em',
          }}>
            <span style={{ color: 'var(--fg)' }}>{msg.top}</span>
            <br />
            <span style={{ color: 'var(--brand-orange)' }}>{msg.bottom}</span>
          </h1>
        </motion.div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .45 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            color: 'var(--fg-muted)',
            margin: '0 auto 36px',
            maxWidth: 400,
            lineHeight: 1.65,
          }}
        >
          {msg.sub} Mas o nosso catálogo está cheio de chuteiras esperando por você.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .55 }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" className="btn btn-primary btn-lg">🏠 Início</Link>
          <Link href="/busca" className="btn btn-ghost btn-lg">🔍 Buscar</Link>
          <Link href="/produtos" className="btn btn-ghost btn-lg">Catálogo →</Link>
        </motion.div>

        {/* Marcas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .75 }}
          style={{ marginTop: 48 }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 10,
            color: 'var(--fg-faint)', letterSpacing: '.2em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            Explore as marcas
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Nike', 'Adidas', 'Puma', 'Umbro'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .8 + i * .07 }}
                whileHover={{ scale: 1.06, borderColor: 'var(--brand-orange)' }}
                whileTap={{ scale: .95 }}
              >
                <Link href={`/${brand.toLowerCase()}`} style={{
                  display: 'inline-block',
                  padding: '8px 18px',
                  borderRadius: 99,
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-stencil)',
                  fontSize: 17,
                  letterSpacing: '.06em',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                  transition: 'border-color .15s',
                }}>
                  {brand.toUpperCase()}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
