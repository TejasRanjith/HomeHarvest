# Agent 2: Product Detail Page & Reviews Enhancement

You are working on the HomeHarvest project — a hyperlocal farm-to-home food marketplace for Thrissur, Kerala.
Read AGENTS.md at the project root for full coding style and conventions.

## Your Tasks

### Task 1: Complete `src/app/(buyer)/product/[id]/page.tsx`

Check the current state of this file and ensure it includes:

1. **Server Component** that fetches the product by ID from Supabase
2. **Product info section**: name, name_ml (Malayalam), description, price (formatted with `Intl.NumberFormat`), unit, vendor info
3. **Image gallery**: display `image_urls` array — show first image large, thumbnails below. Use Next.js `<Image>` component.
4. **Stock indicator**: show "In Stock" / "Out of Stock" based on `is_available` and `stock_quantity`
5. **Vendor badge**: show vendor name + verified badge if `vendor_verified`
6. **Add to cart section**: integrate the existing `<AddToCartSection>` component from `@/components/add-to-cart-section`
7. **Reviews section**: fetch reviews for this product from Supabase with user info, display star ratings and comments
8. **Review modal trigger**: button to open the existing `<ReviewModal>` component from `@/components/review-modal`
9. **Related products**: fetch 4 products from same category (excluding current), display as cards
10. **Back to shop link**

**Styling:**
- Mobile-first responsive layout
- Use brand tokens: primary green `text-[#8FBC8F]`, terracotta `bg-[#E9C4A6]`, CTA yellow `bg-[#F0E68C] text-[#5C4033]`
- Cards: `rounded-2xl shadow-sm border border-gray-100`
- Use `framer-motion` for entrance animations (already installed)

### Task 2: Verify Review Components

Check `src/components/review-modal.tsx` and `src/components/add-to-cart-section.tsx`:
- Ensure they work correctly with the product detail page
- Fix any issues you find
- Ensure proper i18n usage with `useTranslations`

### Task 3: Add Star Rating Display Component

If not already present, create a reusable star rating display component at `src/components/star-rating.tsx`:
- Accept `rating` (number 1-5) and optional `size` prop
- Display filled/empty stars using SVG
- Used for both the review list and product summary rating

## Files You May Touch
- `src/app/(buyer)/product/[id]/page.tsx`
- `src/components/star-rating.tsx` (NEW)
- `src/components/review-modal.tsx` (verify/fix only)
- `src/components/add-to-cart-section.tsx` (verify/fix only)

## Rules
- Server Components by default — only add `'use client'` if hooks/browser APIs needed
- Never fetch data inside client components
- Use `@/` path alias for all imports
- Import order: React → Next.js → third-party → @/components → @/lib → @/hooks → @/types
- All interactive elements need `aria-label`
- Never hardcode currency — use `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
