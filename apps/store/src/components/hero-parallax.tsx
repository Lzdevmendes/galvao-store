'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue, useSpring, useTransform, useScroll,
} from 'framer-motion'

// ── Imagem do atleta — troque o src quando tiver a foto oficial ──────────────
const ATHLETE_SRC = '/athlete-placeholder.png' // trocar por foto real
const SHOW_ATHLETE = false // mudar para true quando tiver a imagem

// ── Partícula ────────────────────────────────────────────────────────────────
function Particle({ x, y, size, color }: { x: string; y: string; size: number; color: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      opacity: .35,
      filter: 'blur(1px)',
      pointerEvents: 'none',
    }} />
  )
}

const PARTICLES = [
  { x: '8%',  y: '20%', size: 4,  color: '#F26B1F' },
  { x: '15%', y: '70%', size: 6,  color: '#1FB5A8' },
  { x: '25%', y: '40%', size: 3,  color: '#F26B1F' },
  { x: '72%', y: '15%', size: 5,  color: '#1FB5A8' },
  { x: '85%', y: '55%', size: 7,  color: '#F26B1F' },
  { x: '90%', y: '80%', size: 3,  color: '#fff' },
  { x: '55%', y: '85%', size: 4,  color: '#F26B1F' },
  { x: '40%', y: '10%', size: 5,  color: '#fff' },
  { x: '60%', y: '30%', size: 3,  color: '#1FB5A8' },
  { x: '78%', y: '65%', size: 6,  color: '#F26B1F' },
]

// ── SVG silhueta de jogador a chutar ────────────────────────────────────────
function PlayerSilhouette() {
  return (
    <svg viewBox="0 0 300 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 40px rgba(242,107,31,.3))' }}>
      {/* Cabeça */}
      <ellipse cx="155" cy="52" rx="28" ry="30" fill="rgba(242,107,31,0.85)" />
      {/* Corpo */}
      <path d="M120 80 C110 100 105 130 108 160 L115 200 L160 205 L195 195 L198 155 C202 125 196 100 185 80 L155 75 Z"
        fill="rgba(242,107,31,0.85)" />
      {/* Braço direito — levantado */}
      <path d="M185 90 C200 75 215 60 225 45 C230 38 225 30 218 35 C205 50 195 70 188 90 Z"
        fill="rgba(242,107,31,0.8)" />
      {/* Braço esquerdo */}
      <path d="M120 90 C108 110 100 130 95 150 C93 158 100 163 105 158 C112 138 118 115 125 92 Z"
        fill="rgba(242,107,31,0.8)" />
      {/* Perna direita — pé de apoio */}
      <path d="M160 200 L168 270 L172 330 L165 380 C163 390 170 395 176 388 L185 340 L180 270 L175 200 Z"
        fill="rgba(242,107,31,0.85)" />
      {/* Perna esquerda — chutando */}
      <path d="M118 200 L108 260 C100 290 88 315 75 335 C68 345 75 355 85 348 L115 325 C130 308 138 280 145 255 L155 200 Z"
        fill="rgba(242,107,31,0.85)" />
      {/* Pé de chute */}
      <ellipse cx="78" cy="350" rx="22" ry="12" fill="rgba(242,107,31,0.9)" transform="rotate(-20 78 350)" />
      {/* Chuteira — destaque */}
      <ellipse cx="75" cy="353" rx="24" ry="13" fill="rgba(255,255,255,0.15)" transform="rotate(-20 75 353)" />
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function HeroParallax({ minPrice }: { minPrice?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Rastreio do rato
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const springCfg = { damping: 20, stiffness: 120, mass: .8 }
  const mouseX = useSpring(rawX, springCfg)
  const mouseY = useSpring(rawY, springCfg)

  // Scroll
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroOpacity    = useTransform(scrollYProgress, [0, .5], [1, 0])
  const heroScale      = useTransform(scrollYProgress, [0, .5], [1, .94])
  const heroTranslateY = useTransform(scrollYProgress, [0, .5], [0, -60])

  // Layers parallax — cada camada move a uma velocidade diferente
  const glow_x  = useTransform(mouseX, [-1, 1], ['-3%',  '3%'])
  const glow_y  = useTransform(mouseY, [-1, 1], ['-3%',  '3%'])

  const ath_x   = useTransform(mouseX, [-1, 1], ['-6%',  '6%'])
  const ath_y   = useTransform(mouseY, [-1, 1], ['-4%',  '4%'])

  const txt_x   = useTransform(mouseX, [-1, 1], ['-10px', '10px'])
  const txt_y   = useTransform(mouseY, [-1, 1], ['-6px',  '6px'])

  const prod_x  = useTransform(mouseX, [-1, 1], ['8%',  '-8%'])
  const prod_y  = useTransform(mouseY, [-1, 1], ['4%',  '-4%'])
  const prod_rot= useTransform(mouseX, [-1, 1], [-8,     8])

  const part_x  = useTransform(mouseX, [-1, 1], ['-16px', '16px'])
  const part_y  = useTransform(mouseY, [-1, 1], ['-10px', '10px'])

  // Perspectiva 3D no texto
  const rotX = useTransform(mouseY, [-1, 1], [6, -6])
  const rotY = useTransform(mouseX, [-1, 1], [-8, 8])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - rect.left) / rect.width  - 0.5) * 2)
    rawY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 2)
  }
  function handleMouseLeave() { rawX.set(0); rawY.set(0) }

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity: heroOpacity, scale: heroScale, y: heroTranslateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-parallax"
    >
      {/* ── Fundo gradiente ── */}
      <div className="hp-bg" />

      {/* ── Glow laranja — camada lenta ── */}
      <motion.div className="hp-glow" style={{ left: glow_x, top: glow_y }} />
      <motion.div className="hp-glow hp-glow-teal" style={{ right: glow_x, bottom: glow_y }} />

      {/* ── Grid de linhas (efeito futurista) ── */}
      <div className="hp-grid" />

      {/* ── Partículas — camada rápida ── */}
      <motion.div className="hp-particles" style={{ x: part_x, y: part_y }}>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </motion.div>

      {/* ── Atleta — camada média ── */}
      <motion.div className="hp-athlete" style={{ x: ath_x, y: ath_y }}>
        {SHOW_ATHLETE
          ? <img src={ATHLETE_SRC} alt="Atleta" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(242,107,31,.5))' }} />
          : <PlayerSilhouette />
        }
      </motion.div>

      {/* ── Conteúdo — texto 3D ── */}
      <div className="hp-content container">
        <motion.div
          className="hp-text"
          style={{ x: txt_x, y: txt_y, rotateX: rotX, rotateY: rotY, perspective: 800 }}
        >
          <motion.div
            className="hp-pre"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 }}
          >
            PRONTA ENTREGA · LANÇAMENTO 2026
          </motion.div>

          <motion.h1
            className="hp-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2, duration: .7, ease: [.25,.46,.45,.94] }}
          >
            JOGO<br />
            <motion.span className="hp-accent">
              RÁPIDO.
            </motion.span>
          </motion.h1>

          <motion.p
            className="hp-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .35 }}
          >
            Phantom GX III, F50 Elite, Future 8 Ultimate.<br />
            As chuteiras que fizeram a temporada.
          </motion.p>

          <motion.div
            className="hp-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .45 }}
          >
            <Link href="/produtos" className="btn btn-primary btn-lg">
              Comprar agora
            </Link>
            <Link href="/ofertas" className="btn btn-lg hp-btn-ghost">
              ★ Ofertas
            </Link>
          </motion.div>

          {minPrice && (
            <motion.div
              className="hp-badge"
              initial={{ opacity: 0, scale: .8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: .6, type: 'spring', stiffness: 300 }}
            >
              <span className="hp-badge-label">A PARTIR DE</span>
              <span className="hp-badge-price">
                R$ {(minPrice / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Produto flutuante — camada frontal ── */}
        <motion.div
          className="hp-product"
          style={{ x: prod_x, y: prod_y, rotate: prod_rot }}
          initial={{ opacity: 0, scale: .7, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: .4, duration: .8, type: 'spring', stiffness: 120 }}
        >
          {/* Anel de glow atrás do produto */}
          <div className="hp-product-glow" />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div className="hp-product-img">
              <span style={{ fontSize: 120 }}>👟</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="hp-scroll"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ opacity: useTransform(scrollYProgress, [0, .15], [1, 0]) }}
      >
        <div className="hp-scroll-line" />
        <span>SCROLL</span>
      </motion.div>
    </motion.section>
  )
}
