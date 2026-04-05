# Agent 5: Footer, UI Components & Smoke Tests

You are working on the HomeHarvest project — a hyperlocal farm-to-home food marketplace for Thrissur, Kerala.
Read AGENTS.md at the project root for full coding style and conventions.

## Your Tasks

### Task 1: Create Site Footer

Create `src/components/footer.tsx`:

**Requirements:**
- Responsive footer with 4 columns on desktop, stacked on mobile
- **Column 1 — Brand**: HomeHarvest logo/name, tagline "Farm Fresh, Delivered Local", Thrissur Kerala badge
- **Column 2 — Quick Links**: Home, Browse Products, My Orders, My Favourites
- **Column 3 — For Vendors**: Vendor Dashboard, List Products, Vendor FAQ
- **Column 4 — Support**: Contact Us, Terms of Service, Privacy Policy, Help Center
- **Bottom bar**: Copyright 2026 HomeHarvest, language toggle, social links (placeholder SVGs)
- Use brand colors: primary green `bg-[#8FBC8F]`, use a dark green/charcoal background for the footer
- Use `next/link` for all internal links
- Mobile-first responsive

Then update `src/app/layout.tsx` to add the footer below `<main>` and above `</body>`:
```tsx
import { Footer } from '@/components/footer'
// ... existing code ...
<main className="flex-1">{children}</main>
<Footer />
```

### Task 2: Create Base UI Components

Create these in `src/components/ui/`:

**`src/components/ui/button.tsx`:**
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`
- Support `disabled`, `isLoading` states
- Wrap `<button>` with proper `aria-label` support
- Use brand colors

**`src/components/ui/badge.tsx`:**
- Variants: `default`, `success`, `warning`, `danger`, `info`
- Used for order status, stock indicators, etc.

**`src/components/ui/skeleton.tsx`:**
- Loading skeleton with shimmer animation (use `.animate-shimmer` from globals.css)
- Variants: `text`, `circle`, `card`, `image`

**`src/components/ui/input.tsx`:**
- Wrap `<input>` with label, error state, helper text
- Support `type`, `placeholder`, `disabled`
- Consistent styling with existing form inputs

### Task 3: Add Smoke Tests

Create smoke tests for the major components. Tests go next to the component file.
Use `vitest` + `@testing-library/react`.

**Tests to create:**
1. `src/components/footer.test.tsx` — renders without crashing, shows brand name
2. `src/components/hero-section.test.tsx` — renders without crashing  
3. `src/components/product-card.test.tsx` — renders without crashing with mock props
4. `src/components/search-bar.test.tsx` — renders without crashing
5. `src/components/category-filter.test.tsx` — renders without crashing
6. `src/components/ui/button.test.tsx` — renders all variants
7. `src/components/ui/badge.test.tsx` — renders all variants

**Test template:**
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './component-name'

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName /* required props */ />)
    expect(screen.getByText('expected text')).toBeDefined()
  })
})
```

**Important:** Many components use `next-intl` which requires a provider. You'll need a test utility wrapper. Create `src/test-utils.tsx`:
```typescript
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../i18n/en.json'

export function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider messages={messages} locale="en">
      {children}
    </NextIntlClientProvider>
  )
}
```

Mock Supabase in tests:
```typescript
vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ data: [], error: null }) }),
    auth: { getUser: () => ({ data: { user: null }, error: null }) },
  }),
}))
```

### Task 4: Setup vitest config if missing

Check if `vitest.config.ts` exists. If not, create it:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

## Files You May Touch
- `src/components/footer.tsx` (NEW)
- `src/components/ui/button.tsx` (NEW)
- `src/components/ui/badge.tsx` (NEW)
- `src/components/ui/skeleton.tsx` (NEW)
- `src/components/ui/input.tsx` (NEW)
- `src/app/layout.tsx` (update — add Footer import and usage)
- `src/test-utils.tsx` (NEW)
- `src/components/*.test.tsx` (NEW — multiple)
- `vitest.config.ts` (verify/create)

## Rules
- Mobile-first always
- Brand tokens: primary green `bg-[#8FBC8F]`, terracotta `bg-[#E9C4A6]`, CTA yellow `bg-[#F0E68C] text-[#5C4033]`
- Cards: `rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800`
- Named exports only from components/ui/
- `'use client'` only when hooks or browser APIs are needed
- All interactive elements need `aria-label`
- Never use `any`
- After creating tests, run `npm run test` to verify they pass
