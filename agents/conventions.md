# Convenções — Como criar feature, rota e fronteiras de import

## Fronteiras de import

```
apps/store   → @galvao/db   (schema + cliente DB)
apps/store   → @galvao/ui   (componentes compartilhados)
apps/admin   → @galvao/db
apps/admin   → @galvao/ui
packages/db  → drizzle-orm, @libsql/client
packages/ui  → radix-ui/*, class-variance-authority

PROIBIDO: apps/store → apps/admin
PROIBIDO: apps/admin → apps/store
PROIBIDO: packages/* → apps/*
```

## Como criar uma nova API Route (store)

1. Criar `apps/store/src/app/api/<recurso>/route.ts`
2. Validar payload com Zod no início (`schema.safeParse(...)`)
3. Verificar autenticação com `createClient()` se necessário
4. Usar `db` de `@/lib/db` para queries
5. Retornar `NextResponse.json()`
6. **NÃO** adicionar rate limiting no webhook MP

```typescript
// Exemplo de rota autenticada
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const schema = z.object({ ... })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  // query sempre filtra por user.id para evitar IDOR
  const rows = await db.all(sql`SELECT ... WHERE user_id = ${user.id}`)
  return NextResponse.json(rows)
}
```

## Como criar uma nova Server Action no Admin

Toda server action do admin deve:
1. Declarar `'use server'` no topo
2. Importar e chamar `requireAdmin()` no início
3. Retornar erro se não autorizado

```typescript
'use server'
import { requireAdmin } from '@/lib/require-admin'
import { NextResponse } from 'next/server'

export async function minhaAction(params: ...) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  // lógica da action...
}
```

## Como adicionar novo campo monetário ao schema

1. Usar `integer('nome_in_cents')` no Drizzle schema
2. Sufixo `_in_cents` é obrigatório para rastreabilidade
3. Nunca usar `real()` para dinheiro
4. Converter para reais apenas na camada de display: `(value / 100).toFixed(2)`

## Como adicionar e-mail transacional

1. Criar template em `apps/store/src/emails/<nome>.tsx` com React Email
2. Adicionar função helper em `apps/store/src/lib/email.ts`
3. No chamador, usar `void sendXxxEmail(...).catch(e => console.error('[email]', e))`
4. **Nunca** `await` e-mail no caminho crítico de pedido

## Padrões de query no Drizzle (raw SQL)

O projeto usa `db.all<T>(sql`...`)` e `db.run(sql`...`)` do `@galvao/db`:

```typescript
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// SELECT
const rows = await db.all<{ id: string; name: string }>(sql`
  SELECT id, name FROM products WHERE status = 'published'
`)

// INSERT
await db.run(sql`
  INSERT INTO orders (id, ...) VALUES (${id}, ...)
`)

// UPDATE condicional (idempotente)
const result = await db.run(sql`
  UPDATE orders SET status = 'paid' WHERE id = ${id} AND status != 'paid'
`)
// result.rowsAffected === 0 → já foi processado
```

## Padrões de autenticação

### Store (cliente)
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return ... 401
// filtrar todas as queries por user.id
```

### Admin (server action)
```typescript
import { requireAdmin } from '@/lib/require-admin'
import { NextResponse } from 'next/server'
const auth = await requireAdmin()
if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }
```

### Admin (API route)
```typescript
import { requireAdmin } from '@/lib/require-admin'
const auth = await requireAdmin()
if (auth instanceof NextResponse) return auth  // retorna o 401 diretamente
```

## Convenção de commits

Commits com título apenas — sem corpo descritivo. Seguir prefixos:

| Prefixo | Quando usar |
|---------|------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correcção de bug |
| `perf:` | Melhoria de performance |
| `refactor:` | Refatoração sem mudança de comportamento |
| `style:` | Formatação, CSS, sem lógica |
| `test:` | Adição ou correcção de testes |
| `docs:` | Documentação |
| `chore:` | Tarefas de manutenção (deps, config, build) |
| `security:` | Correcções de segurança |

**Exemplos:**
```
feat: checkout com cálculo de frete Melhor Envio
fix: webhook MP — idempotência no decremento de estoque
security: preço recalculado no servidor, nunca do cliente
perf: image priority nos primeiros 4 cards
chore: atualizar @mercadopago/sdk para 2.12.1
```

## Ordem dos imports

1. Next.js (`next/server`, `next/navigation`)
2. Bibliotecas externas
3. Packages internos (`@galvao/db`, `@galvao/ui`)
4. Imports locais (`@/lib/...`, `@/components/...`)
