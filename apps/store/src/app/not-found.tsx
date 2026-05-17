'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const MESSAGES = [
  { headline: 'FORA\nDE CAMPO.', sub: 'Esta página foi para o banco de reservas.' },
  { headline: 'GOL\nANULADO.', sub: 'O link que você chutou foi para fora.' },
  { headline: 'PÊNALTI\nERRADO.', sub: 'A página que você queria foi para o travessão.' },
  { headline: 'CARTÃO\nVERMELHO.', sub: 'Esta URL foi expulsa de campo.' },
]

const BALLS = [
  { x: '15%',  y: '20%',  size: 24, delay: 0 },
  { x: '80%',  y: '10%',  size: 16, delay: .3 },
  { x: '90%',  y: '60%',  size: 32, delay: .6 },
  { x: '5%',   y: '70%',  size: 20, delay: .9 },
  { x: '50%',  y: '85%',  size: 14, delay: 1.2 },
  { x: '70%',  y: '40%',  size: 18, delay: .15 },
]

export default function NotFound() {
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])

  const lines = msg.headline.split('\n')

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>

      {/* Bolas de fundo flutuantes */}
      {BALLS.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left: b.x, top: b.y,
            width: b.size, height: b.size,
            borderRadius: '50%', background: 'var(--border)',
            pointerEvents: 'none',
          }}
          animate={{ y: [-8, 8, -8], rotate: [0, 180, 360] }}
          transition={{ duration: 3 + i * .4, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Número 404 gigante de fundo */}
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .8, ease: [.25, .46, .45, .94] }}
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-stencil)',
          fontSize: 'clamp(200px,30vw,320px)',
          lineHeight: 1,
          color: 'var(--brand-orange)',
          opacity: .06,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '.04em',
        }}
      >
        404
      </motion.div>

      {/* Conteúdo principal */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>

        {/* Ícone */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .1 }}
          style={{ fontSize: 72, marginBottom: 24, display: 'block' }}
        >
          ⚽
        </motion.div>

        {/* Headline */}
        <div style={{ overflow: 'hidden' }}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: .5, delay: .15 + i * .1, ease: [.25, .46, .45, .94] }}
            >
              <h1 style={{
                fontFamily: 'var(--font-stencil)',
                fontSize: 'clamp(56px,9vw,96px)',
                lineHeight: .92,
                margin: 0,
                color: i === 1 ? 'var(--brand-orange)' : 'var(--fg)',
              }}>
                {line}
              </h1>
            </motion.div>
          ))}
        </div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .45, duration: .4 }}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 16, color: 'var(--fg-muted)', margin: '20px 0 36px', lineHeight: 1.5 }}
        >
          {msg.sub} Mas o nosso catálogo está cheio de lançamentos esperando por você.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .55, duration: .4 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" className="btn btn-primary btn-lg">
            🏠 Ir para o Início
          </Link>
          <Link href="/busca" className="btn btn-ghost btn-lg">
            🔍 Buscar produto
          </Link>
          <Link href="/produtos" className="btn btn-ghost btn-lg">
            Ver catálogo →
          </Link>
        </motion.div>

        {/* Divider + marcas populares */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .8 }}
          style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-faint)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Explore as marcas
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Nike', 'Adidas', 'Puma', 'Umbro'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .85 + i * .07 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: .95 }}
              >
                <Link
                  href={`/${brand.toLowerCase()}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    borderRadius: 'var(--r-pill)',
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-stencil)',
                    fontSize: 18,
                    letterSpacing: '.06em',
                    color: 'var(--fg)',
                    textDecoration: 'none',
                  }}
                >
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
