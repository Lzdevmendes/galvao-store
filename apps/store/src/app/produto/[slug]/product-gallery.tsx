'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface GalleryImage {
  id:         string
  url:        string
  alt:        string
  is_primary: boolean
  sort_order: number
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(images.findIndex(i => i.is_primary) ?? 0)
  const [zoomed, setZoomed] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [cursor, setCursor] = useState({ x: 50, y: 50 })

  const current = images[active]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursor({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (!images.length) {
    return (
      <div style={{ background: 'var(--ink-100)', borderRadius: 16, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48 }}>👟</span>
      </div>
    )
  }

  return (
    <>
      {/* Main image */}
      <div
        style={{ background: 'var(--ink-100)', borderRadius: 16, aspectRatio: '1', overflow: 'hidden', cursor: zoomed ? 'zoom-out' : 'zoom-in', position: 'relative', marginBottom: 12 }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightbox(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: .97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .97 }}
            transition={{ duration: .22, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Image
              src={current.url}
              alt={current.alt}
              width={600}
              height={600}
              priority={active === 0}
              style={{
                width: '88%',
                height: '88%',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                transformOrigin: `${cursor.x}% ${cursor.y}%`,
                transform: zoomed ? 'scale(1.8)' : 'scale(1)',
                transition: 'transform .3s ease',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom button — estilo do design system */}
        <button
          className="main-img-zoom"
          onClick={e => { e.stopPropagation(); setLightbox(true) }}
          title="Ver em tamanho real"
          aria-label="Abrir lightbox"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>

        {/* Badge position */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,.4)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', backdropFilter: 'blur(4px)' }}>
            {active + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <motion.button
              key={img.id}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: .95 }}
              style={{
                width: 72, height: 72, padding: 0,
                background: 'var(--ink-100)', borderRadius: 10, overflow: 'hidden',
                border: `2.5px solid ${i === active ? 'var(--brand-orange)' : 'var(--border)'}`,
                cursor: 'pointer', flexShrink: 0,
                boxShadow: i === active ? '0 0 0 2px rgba(242,107,31,.25)' : 'none',
                transition: 'border-color .15s, box-shadow .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={68}
                height={68}
                style={{ width: '88%', height: '88%', objectFit: 'contain', mixBlendMode: 'multiply' }}
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <motion.div
              initial={{ scale: .85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: .85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', cursor: 'default' }}
            >
              <Image
                src={current.url}
                alt={current.alt}
                width={900}
                height={900}
                style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
              />
              <button
                onClick={() => setLightbox(false)}
                style={{ position: 'absolute', top: -16, right: -16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </motion.div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                {active > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActive(a => a - 1) }}
                    style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
                  >
                    ‹
                  </button>
                )}
                {active < images.length - 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActive(a => a + 1) }}
                    style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
                  >
                    ›
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
