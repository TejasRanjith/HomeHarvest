# Agent 4: Admin Panel Completion & Notifications

You are working on the HomeHarvest project — a hyperlocal farm-to-home food marketplace for Thrissur, Kerala.
Read AGENTS.md at the project root for full coding style and conventions.

## Your Tasks

### Task 1: Complete Admin Disputes Page

Check `src/app/admin/disputes/page.tsx`. It should be a Server Component that:
1. Authenticates the admin (check profile role === 'admin')
2. Fetches disputes/problematic orders (orders with status 'cancelled' or 'refunded', or with payment_status 'failed')
3. Renders using the existing `<DisputesTable>` component from `@/components/disputes-table`
4. If the page doesn't exist, create it

### Task 2: Complete Admin Vendors Page

Check `src/app/admin/vendors/page.tsx`. It should be a Server Component that:
1. Authenticates the admin
2. Fetches all vendor profiles with their KYC status
3. Renders using the existing `<VendorManagementTable>` component from `@/components/vendor-management-table`
4. If the page doesn't exist, create it

### Task 3: Create Notifications Page for Buyers

Create `src/app/(buyer)/notifications/page.tsx`:
1. Server Component that fetches the user's notifications from Supabase
2. Display notifications in a list grouped by date
3. Each notification shows: title, message, type icon, timestamp, read/unread state
4. Mark-all-as-read button at the top
5. Individual mark-as-read on click
6. Styling: use card layout, brand colors, subtle animations

**Create a companion client component** `src/components/notification-list.tsx`:
- Handle marking notifications as read (calls Supabase directly)
- Uses `react-hot-toast` for feedback
- Grouped by date using section headers

### Task 4: Add Notification Bell to Header

Update `src/components/header.tsx` to add a notification bell icon:
1. Show unread notification count as a badge
2. Link to `/notifications` page
3. Use a bell SVG icon
4. Only show when user is authenticated
5. Fetch unread count from Supabase

**Important:** The header is a client component. You'll need to carefully add just a notification count fetch. Create a small `src/hooks/use-notifications.ts` hook:
```typescript
export function useNotifications(): { unreadCount: number } {
  // Fetch unread notification count from Supabase
  // Poll every 30 seconds
  // Return { unreadCount }
}
```

## Files You May Touch
- `src/app/admin/disputes/page.tsx` (verify/create)
- `src/app/admin/vendors/page.tsx` (verify/create)
- `src/app/(buyer)/notifications/page.tsx` (NEW)
- `src/components/notification-list.tsx` (NEW)
- `src/hooks/use-notifications.ts` (NEW)
- `src/components/header.tsx` (update — ADD notification bell only, do not rewrite)

## Rules
- Server Components by default in app/
- Never fetch data inside client components — lift to Server Component (except for the header notification count which polls)
- All interactive elements need `aria-label`
- Import order: React → Next.js → third-party → @/components → @/lib → @/hooks → @/types
- Use `useTranslations` from `next-intl` for user-visible strings where possible
- Supabase: always check `{ data, error }` before using data
