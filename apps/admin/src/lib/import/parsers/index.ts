import type { SourceParser } from '../types'

// Registro de parsers por `import_sources.parser_key`. Vazio até a Fase B —
// cada site do importador ganha um arquivo próprio aqui (ex.: `nike-brasil.ts`)
// implementando `SourceParser`, porque o HTML de cada site é diferente.
//
// Exemplo de como registar quando o primeiro parser existir:
//   import { parser as exemploParser } from './exemplo-importador'
//   export const parsers: Record<string, SourceParser> = { 'exemplo-importador': exemploParser }
export const parsers: Record<string, SourceParser> = {}
