# Agent 1: AI Delivery Optimiser & Missing API Routes

You are working on the HomeHarvest project — a hyperlocal farm-to-home food marketplace for Thrissur, Kerala.
Read AGENTS.md at the project root for full coding style and conventions.

## Your Tasks

### Task 1: Implement `src/lib/ai-delivery.ts`

The file currently contains only a comment. Implement the Groq-powered AI delivery optimisation module.

**Requirements:**
- Use the `groq` npm package (already installed) to call the Groq API
- Use model `llama-3.3-70b-versatile`
- Export named functions only (no default exports from lib/)
- The module should:
  1. Accept a list of orders with delivery addresses (all in Thrissur area)
  2. Accept available delivery slots
  3. Use Groq to optimise delivery route grouping by area proximity
  4. Return optimised delivery batches with estimated times
- Type all inputs and outputs explicitly
- Use `GROQ_API_KEY` env var (server-only, never expose to client)
- Handle errors gracefully — return a safe error object, never throw unhandled

**Interfaces to export:**
```typescript
interface DeliveryOrder {
  orderId: string
  address: string
  area: string
  items: number
}

interface DeliveryBatch {
  batchId: string
  orders: DeliveryOrder[]
  estimatedTime: string
  route: string[]
  area: string
}

interface OptimiseResult {
  batches: DeliveryBatch[]
  totalEstimatedTime: string
}
```

### Task 2: Create `src/app/api/delivery/optimise/route.ts`

Create the API route that calls the AI delivery optimiser.

**Requirements:**
- POST endpoint that accepts `{ orders: DeliveryOrder[] }`
- Must authenticate the user via Supabase — only vendors and admins can call
- Call the `optimiseDelivery` function from `@/lib/ai-delivery`
- Return `NextResponse.json(result)` on success
- Return `NextResponse.json({ error: message }, { status: N })` on failure
- Validate input with zod

### Task 3: Verify/Fix OAuth Callback Route

Check if `src/app/api/auth/callback/route.ts` exists. If it doesn't, create it:

```typescript
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

## Rules
- Run `npx tsc --noEmit` on your files when done
- Use `async/await` not `.then()` chains
- Never use `any` — use `unknown` and narrow
- Named exports only from lib/
- All Supabase queries must check `{ data, error }` before using data
