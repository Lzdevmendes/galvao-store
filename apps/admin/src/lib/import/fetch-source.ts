// Fetch "educado" pra sites de terceiros: timeout explícito, User-Agent que
// identifica o robô de verdade (mesmo espírito de apps/store/src/lib/melhor-envio.ts:7),
// e pacing entre requisições — não é rate-limit de defesa contra abuso (isso é
// o ratelimit.ts do store, outro app, outro caso de uso), é ritmo de saída pra
// não sobrecarregar o site do importador.
//
// Este pipeline não tenta contornar CAPTCHA/bloqueio anti-bot de nenhum site.
// Se um importador bloquear scraping educado, a resposta é desativar aquele
// `import_sources.active` e sinalizar de volta — não construir evasão aqui.
const USER_AGENT = "Galvão's Store Importer/1.0 (+lzmendestechdev@gmail.com)"
const TIMEOUT_MS = 15_000

export async function fetchSourcePage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${url}: HTTP ${res.status}`)
  }
  return res.text()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
