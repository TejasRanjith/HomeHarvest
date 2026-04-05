# Agent 3: Vendor Order Status Updates

You are working on the HomeHarvest project — a hyperlocal farm-to-home food marketplace for Thrissur, Kerala.
Read AGENTS.md at the project root for full coding style and conventions.

## Your Tasks

### Task 1: Create Order Status Update API

Create `src/app/api/orders/update-status/route.ts`:

**Requirements:**
- POST endpoint accepting `{ order_id: string, status: string }`
- Validate input with zod:
  - `order_id` must be a UUID string
  - `status` must be one of: `'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'`
- Authenticate user via Supabase
- Verify the user is a vendor by checking their profile role
- Verify the vendor owns at least one product in the order (check via order_items → products → vendor_id)
- Update the order status in the `orders` table
- Create a notification for the buyer about the status change (insert into `notifications` table)
- Return the updated order on success
- Return proper error responses with appropriate HTTP status codes

```typescript
// Example notification insert:
await supabase.from('notifications').insert({
  user_id: order.buyer_id,
  title: `Order ${statusLabel}`,
  message: `Your order #${orderId.slice(-8).toUpperCase()} has been ${statusLabel}.`,
  type: 'order',
  link: `/orders`,
})
```

### Task 2: Update Vendor Orders Page

Check `src/app/vendor/orders/page.tsx` — it should be a Server Component that:
1. Authenticates the vendor
2. Fetches orders containing the vendor's products (via order_items → products)
3. Passes data to `<VendorOrdersContent>` component

### Task 3: Add Status Update Controls to VendorOrdersContent

Update `src/components/vendor-orders-content.tsx` to add:
1. A status update dropdown/button group for each order
2. Only show valid next statuses (e.g., pending → confirmed → preparing → out_for_delivery → delivered)
3. Call the `/api/orders/update-status` endpoint when a status is selected
4. Show toast notifications on success/failure
5. Refresh the order list after an update

**Status flow:**
```
pending → confirmed → preparing → out_for_delivery → delivered
                                                   ↘ cancelled (from any status except delivered)
```

**UI Requirements:**
- Use color-coded badges for each status
- Dropdown or button group for the next valid status
- Confirmation dialog before cancellation
- Use brand colors and card styling from AGENTS.md

## Files You May Touch
- `src/app/api/orders/update-status/route.ts` (NEW)
- `src/app/vendor/orders/page.tsx` (verify/update)
- `src/components/vendor-orders-content.tsx` (update)

## Rules
- API routes: always return `NextResponse.json({ error: message }, { status: N })` on failure
- Validate HMAC signature for payment-related endpoints (not needed here, just order updates)
- Never use `any` — use `unknown` and narrow
- Use `async/await` not `.then()` chains
- Supabase: always destructure `{ data, error }` and check `if (error)` before using data
