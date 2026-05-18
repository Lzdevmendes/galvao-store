'use client'

import { useRef, useState } from 'react'

type Img = { id: string; url: string; alt: string; sort_order: number; is_primary: number }

export default function ImageManager({ productId, initialImages }: { productId: string; initialImages: Img[] }) {
  const [images, setImages]   = useState<Img[]>(initialImages)
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
    const res = await fetch(`/api/images/${imgId}`, { method: 'DELETE' })
    if (!res.ok) return
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== imgId)
      // Se era primária, promover primeira
      if (prev.find(i => i.id === imgId)?.is_primary && filtered.length > 0) {
        filtered[0] = { ...filtered[0], is_primary: 1 }
      }
      return filtered.map((i, idx) => ({ ...i, sort_order: idx }))
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
    const tmp      = updated[index]
    updated[index] = { ...updated[next],  sort_order: index }
    updated[next]  = { ...tmp,            sort_order: next  }

    setImages(updated)
    await fetch('/api/images/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: updated.map(i => ({ id: i.id, sortOrder: i.sort_order })) }),
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
          Imagens <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>({images.length}/10)</span>
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= 10}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: images.length >= 10 ? 0.4 : 1 }}
        >
          {uploading ? 'Enviando...' : '+ Adicionar'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#E23B3B', background: '#E23B3B11', border: '1px solid #E23B3B33', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
        onClick={() => images.length === 0 && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#F26B1F' : '#1E2530'}`,
          borderRadius: 12,
          padding: images.length === 0 ? 48 : 16,
          textAlign: 'center',
          background: dragOver ? '#F26B1F0A' : '#0F1318',
          transition: 'all .15s',
          cursor: images.length === 0 ? 'pointer' : 'default',
          marginBottom: 16,
        }}
      >
        {images.length === 0 ? (
          <div>
            <p style={{ fontSize: 32, margin: '0 0 8px' }}>🖼️</p>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Arraste imagens aqui</p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>ou clique para selecionar · JPG, PNG, WebP · máx. 5 MB cada</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {images.map((img, idx) => (
              <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `2px solid ${img.is_primary ? '#F26B1F' : '#1E2530'}`, background: '#141922' }}>
                {/* Primary badge */}
                {img.is_primary ? (
                  <div style={{ position: 'absolute', top: 6, left: 6, background: '#F26B1F', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, zIndex: 2 }}>
                    PRINCIPAL
                  </div>
                ) : null}

                <img src={img.url} alt={img.alt || 'produto'} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />

                {/* Controls */}
                <div style={{ display: 'flex', gap: 4, padding: 6, background: '#0F1318' }}>
                  <button
                    onClick={() => move(idx, -1)} disabled={idx === 0}
                    title="Mover para a esquerda"
                    style={btnStyle(idx === 0)}
                  >←</button>
                  <button
                    onClick={() => move(idx, 1)} disabled={idx === images.length - 1}
                    title="Mover para a direita"
                    style={btnStyle(idx === images.length - 1)}
                  >→</button>
                  {!img.is_primary && (
                    <button
                      onClick={() => setPrimary(img.id)}
                      title="Definir como principal"
                      style={{ ...btnStyle(false), flex: 1, background: '#F26B1F22', color: '#F26B1F' }}
                    >★</button>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    title="Remover"
                    style={{ ...btnStyle(false), marginLeft: 'auto', background: '#E23B3B22', color: '#E23B3B' }}
                  >✕</button>
                </div>
              </div>
            ))}

            {/* Mini drop zone quando já tem imagens */}
            {images.length < 10 && (
              <div
                onClick={() => inputRef.current?.click()}
                style={{ borderRadius: 8, border: '2px dashed #1E2530', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', cursor: 'pointer', color: '#4A5462', fontSize: 28, background: '#141922' }}
              >+</div>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p style={{ fontSize: 11, color: '#4A5462', margin: 0 }}>
          Arraste arquivos para a área acima para adicionar mais · A imagem marcada como PRINCIPAL aparece no catálogo
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={e => uploadFiles(e.target.files)}
      />
    </div>
  )
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '3px 8px',
    borderRadius: 6,
    border: 'none',
    background: '#1E2530',
    color: disabled ? '#2A3340' : '#9CA3AF',
    fontSize: 12,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
  }
}
