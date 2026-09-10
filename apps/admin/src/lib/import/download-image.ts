import { storeProductImage, MAX_IMAGE_SIZE } from '@/lib/product-images'

// Baixa uma imagem do site do importador e reaplica a MESMA validação
// (magic bytes + limite de 5MB) do upload manual — nunca confiar que o site
// de origem está servindo o que o `<img>` promete.
export async function downloadAndStoreImage(productId: string, imageUrl: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  let res: Response
  try {
    res = await fetch(imageUrl, {
      headers: { 'User-Agent': "Galvão's Store Importer/1.0 (+lzmendestechdev@gmail.com)" },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return { ok: false, error: `Falha de rede ao baixar imagem: ${imageUrl}` }
  }
  if (!res.ok) return { ok: false, error: `HTTP ${res.status} ao baixar imagem: ${imageUrl}` }

  const contentLength = res.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_IMAGE_SIZE) {
    return { ok: false, error: 'Imagem muito grande (máx. 5 MB)' }
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  const stored = await storeProductImage(productId, buffer)
  if (!stored.ok) return { ok: false, error: stored.error }
  return { ok: true, url: stored.url }
}
