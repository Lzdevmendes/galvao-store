'use client'

import { useRef, useState } from 'react'

type Img = { id: string; url: string; alt: string; sort_order: number; is_primary: number }

export default function ImageManager({ productId, initialImages }: { productId: string; initialImages: Img[] }) {
  const [images, setImages]       = useState<Img[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('productId', productId)
      const res  = await fetch('/api/images/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error); break }
      setImages(prev => [...prev, { id: data.id, url: data.url, alt: '', sort_order: data.sortOrder, is_primary: data.isPrimary ? 1 : 0 }])
    }
    setUploading(false)
  }

  async function deleteImage(imgId: string) {
    if (!confirm('Remover esta imagem?')) return
    const wasPrimary = images.find(i => i.id === imgId)?.is_primary === 1
    const res = await fetch(`/api/images/${imgId}`, { method: 'DELETE' })
    if (!res.ok) return
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== imgId).map((i, idx) => ({ ...i, sort_order: idx }))
      if (wasPrimary && filtered.length > 0) filtered[0] = { ...filtered[0], is_primary: 1 }
      return filtered
    })
  }

  async function setPrimary(imgId: string) {
    await fetch('/api/images/primary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId: imgId, productId }),
    })
    setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imgId ? 1 : 0 })))
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= images.length) return
    const updated = [...images]
    const tmp = updated[index]
    updated[index] = { ...updated[next], sort_order: index }
    updated[next]  = { ...tmp,           sort_order: next }
    setImages(updated)
    await fetch('/api/images/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: updated.map(i => ({ id: i.id, sortOrder: i.sort_order })) }),
    })
  }

  const canAdd = images.length < 10 && !uploading

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px' }}>Imagens do produto</h2>
          <p style={{ fontSize: 12, color: '#4A5462', margin: 0 }}>{images.length}/10 imagens · A primeira é exibida no catálogo</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!canAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: canAdd ? '#F26B1F' : '#1E2530', color: canAdd ? '#fff' : '#4A5462', fontSize: 13, fontWeight: 700, cursor: canAdd ? 'pointer' : 'not-allowed', transition: 'all .15s' }}
        >
          {uploading ? (
            <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #ffffff44', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Enviando...</>
          ) : '+ Adicionar imagem'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#E23B3B', background: '#E23B3B11', border: '1px solid #E23B3B33', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Drop zone vazia */}
      {images.length === 0 ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? '#F26B1F' : '#2A3340'}`, borderRadius: 12, padding: '60px 24px', textAlign: 'center', background: dragOver ? '#F26B1F08' : 'transparent', cursor: 'pointer', transition: 'all .15s' }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#D1D5DB' }}>Arraste imagens aqui</p>
          <p style={{ fontSize: 13, color: '#4A5462', margin: 0 }}>ou clique para selecionar · JPG, PNG, WebP · máx. 10 MB cada</p>
        </div>
      ) : (
        <>
          {/* Grid de imagens */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, padding: dragOver ? 12 : 0, border: dragOver ? '2px dashed #F26B1F' : '2px dashed transparent', borderRadius: 12, transition: 'all .15s' }}
          >
            {images.map((img, idx) => (
              <div key={img.id} style={{ borderRadius: 10, overflow: 'hidden', border: `2px solid ${img.is_primary ? '#F26B1F' : '#1E2530'}`, background: '#141922', transition: 'border-color .15s' }}>
                {/* Imagem */}
                <div style={{ position: 'relative', aspectRatio: '1', background: '#0F1318', overflow: 'hidden' }}>
                  {img.url.startsWith('http') ? (
                    <img
                      src={img.url}
                      alt={img.alt || `Imagem ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#141922' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2A3340" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#2A3340', textAlign: 'center', padding: '0 12px', wordBreak: 'break-all', lineHeight: 1.4 }}>
                        {img.url.split('/').pop()}
                      </span>
                      <span style={{ fontSize: 9, color: '#1E2530', textAlign: 'center' }}>imagem local · faça re-upload</span>
                    </div>
                  )}
                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {img.is_primary ? (
                      <span style={{ background: '#F26B1F', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, letterSpacing: '.05em' }}>
                        ★ PRINCIPAL
                      </span>
                    ) : null}
                    <span style={{ background: '#00000066', color: '#9CA3AF', fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                      {idx + 1}/{images.length}
                    </span>
                  </div>
                </div>

                {/* Acções */}
                <div style={{ padding: '8px 10px', display: 'flex', gap: 4, background: '#0F1318' }}>
                  <button onClick={() => move(idx, -1)} disabled={idx === 0}
                    title="Mover para a esquerda"
                    style={actionBtn(idx === 0, 'neutral')}>←</button>

                  <button onClick={() => move(idx, 1)} disabled={idx === images.length - 1}
                    title="Mover para a direita"
                    style={actionBtn(idx === images.length - 1, 'neutral')}>→</button>

                  <button
                    onClick={() => !img.is_primary && setPrimary(img.id)}
                    disabled={!!img.is_primary}
                    title={img.is_primary ? 'Já é a imagem principal' : 'Definir como principal'}
                    style={{ ...actionBtn(!!img.is_primary, img.is_primary ? 'active' : 'primary'), flex: 1, fontSize: 11 }}
                  >{img.is_primary ? '★ Principal' : '☆ Principal'}</button>

                  <button onClick={() => deleteImage(img.id)}
                    title="Remover imagem"
                    style={actionBtn(false, 'danger')}>✕</button>
                </div>
              </div>
            ))}

            {/* Card para adicionar */}
            {canAdd && (
              <div
                onClick={() => inputRef.current?.click()}
                style={{ borderRadius: 10, border: '2px dashed #2A3340', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4A5462', gap: 8, transition: 'all .15s', background: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#F26B1F'; (e.currentTarget as HTMLDivElement).style.color = '#F26B1F' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A3340'; (e.currentTarget as HTMLDivElement).style.color = '#4A5462' }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Adicionar</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: '#2A3340', marginTop: 12, marginBottom: 0 }}>
            Arraste arquivos para a área acima para adicionar · Máx. 10 imagens por produto
          </p>
        </>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function actionBtn(disabled: boolean, variant: 'neutral' | 'primary' | 'active' | 'danger'): React.CSSProperties {
  const colors = {
    neutral: { bg: '#1E2530',    color: disabled ? '#2A3340' : '#9CA3AF' },
    primary: { bg: '#F26B1F22',  color: '#F26B1F' },
    active:  { bg: '#F26B1F',    color: '#fff' },   // estrela já é principal
    danger:  { bg: '#E23B3B22',  color: '#E23B3B' },
  }
  const c = colors[variant]
  return {
    padding: '7px 12px',
    borderRadius: 6,
    border: 'none',
    background: c.bg,
    color: c.color,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    transition: 'opacity .1s',
    opacity: disabled ? 0.3 : 1,
  }
}
