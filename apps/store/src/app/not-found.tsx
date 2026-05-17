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
    <section style={{
      minHeight: '88vh',
      background: 'linear-gradient(150deg, #0B0E12 0%, #14181F 50%, #1F252E 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 24px',
    }}>

      {/* Glow laranja de fundo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(242,107,31,.18) 0%, transparent 70%)',
      }} />

      {/* Grade de pontos sutil */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .04,
        backgroundImage: 'radial-gradient(circle, #F26B1F 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* ── Conteúdo ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 680, width: '100%' }}>

        {/* 404 integrado — tratado como elemento de design */}
        <div style={{ position: 'relative', marginBottom: -24 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            style={{
              fontFamily: 'var(--font-stencil)',
              fontSize: 'clamp(120px, 20vw, 200px)',
              lineHeight: 1,
              letterSpacing: '.08em',
              background: 'linear-gradient(180deg, rgba(242,107,31,.35) 0%, rgba(242,107,31,.08) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              userSelect: 'none',
              display: 'block',
            }}
          >
            404
          </motion.div>

          {/* Bola sobre o 404 */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: .2 }}
            style={{
              position: 'absolute',
              bottom: -10, left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 56,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.5))',
            }}
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: .8 }}
              style={{ display: 'block' }}
            >
              ⚽
            </motion.span>
          </motion.div>
        </div>

        {/* Headline */}
        <div style={{ marginTop: 40, marginBottom: 16, overflow: 'hidden' }}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: .5, delay: .3, ease: [.25, .46, .45, .94] }}
          >
            <h1 style={{
              fontFamily: 'var(--font-stencil)',
              fontSize: 'clamp(52px, 8vw, 88px)',
              lineHeight: .95,
              margin: 0,
              letterSpacing: '.02em',
            }}>
              <span style={{ color: '#fff' }}>{msg.top}</span>
              <br />
              <span style={{ color: 'var(--brand-orange)' }}>{msg.bottom}</span>
            </h1>
          </motion.div>
        </div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .5 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            color: 'rgba(255,255,255,.55)',
            margin: '0 auto 40px',
            maxWidth: 440,
            lineHeight: 1.6,
          }}
        >
          {msg.sub} Mas o nosso catálogo está cheio de chuteiras esperando por você.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .6 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            🏠 Início
          </Link>
          <Link href="/busca" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 28px', borderRadius: 10, fontSize: 16, fontWeight: 600,
            fontFamily: 'var(--font-ui)', textDecoration: 'none',
            background: 'rgba(255,255,255,.08)', color: '#fff',
            border: '1px solid rgba(255,255,255,.15)',
            backdropFilter: 'blur(8px)',
            transition: 'background .15s',
          }}>
            🔍 Buscar produto
          </Link>
          <Link href="/produtos" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 28px', borderRadius: 10, fontSize: 16, fontWeight: 600,
            fontFamily: 'var(--font-ui)', textDecoration: 'none',
            background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.7)',
            border: '1px solid rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)',
          }}>
            Catálogo →
          </Link>
        </motion.div>

        {/* Marcas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .85 }}
          style={{ marginTop: 56 }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 11,
            color: 'rgba(255,255,255,.3)', letterSpacing: '.18em',
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            Explore as marcas
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Nike', 'Adidas', 'Puma', 'Umbro'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .9 + i * .07 }}
                whileHover={{ scale: 1.06, background: 'rgba(242,107,31,.15)' }}
                whileTap={{ scale: .96 }}
              >
                <Link href={`/${brand.toLowerCase()}`} style={{
                  display: 'inline-block',
                  padding: '9px 20px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  fontFamily: 'var(--font-stencil)',
                  fontSize: 19,
                  letterSpacing: '.08em',
                  color: 'rgba(255,255,255,.7)',
                  textDecoration: 'none',
                  backdropFilter: 'blur(4px)',
                  transition: 'all .15s',
                }}>
                  {brand.toUpperCase()}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
