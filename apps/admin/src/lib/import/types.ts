// Formato normalizado que TODO parser de site importador precisa produzir,
// independente da estrutura HTML de origem — é o contrato entre a Fase B
// (parsers específicos por site) e a Fase A (pipeline genérico).
export interface ScrapedProduct {
  externalRef: string          // SKU ou URL do produto no site do importador — usado pro dedupe
  name: string
  brandName: string            // nome da marca como aparece no site de origem (normalizado em normalize.ts)
  categoryName: string         // categoria/piso como aparece no site de origem (ex: "Society", "Campo", "Futsal")
  costInCents?: number         // preço de custo/atacado, se visível no site — nunca vira preço de venda sozinho
  sizes: { size: string; stock: number }[]
  imageUrls: string[]
}

// Cada parser (apps/admin/src/lib/import/parsers/<parser_key>.ts) implementa isto.
export interface SourceParser {
  parse(html: string, baseUrl: string): ScrapedProduct[]
}
