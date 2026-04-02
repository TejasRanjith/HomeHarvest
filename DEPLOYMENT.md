# HomeHarvest — Deployment Guide

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon/public key** from **Project Settings > API**.

### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

Alternatively, paste the contents of each migration file into the **Supabase SQL Editor**:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_admin_and_policies.sql`

### Create Storage Buckets
In **Supabase Dashboard > Storage**, create these buckets:

| Bucket | Public? |
|---|---|
| `product-images` | Yes |
| `kyc-documents` | No |
| `review-images` | No |

The RLS policies in `002_admin_and_policies.sql` will be applied automatically.

### Enable Google OAuth
1. Go to **Authentication > Providers > Google**.
2. Enable the provider.
3. Add your **Google OAuth Client ID** and **Client Secret** (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
4. Add the **Authorized Redirect URL**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
5. For local dev, also add:
   ```
   http://localhost:3000/api/auth/callback
   ```

### Seed Categories
In the **Supabase SQL Editor**, paste and run:
```sql
INSERT INTO categories (name, name_ml, slug, description, is_active) VALUES
  ('Thrissur Chantha Vegetables', 'തൃശ്ശൂർ ചന്ത പച്ചക്കറികൾ', 'thrissur-chantha-vegetables', 'Fresh vegetables from the famous Thrissur Shandy market', true),
  ('Palakkad Rice & Grains', 'പാലക്കാട് അരിയും ധാന്യങ്ങളും', 'palakkad-rice-grains', 'Traditional rice varieties and grains from Palakkad region', true),
  ('Nattukozhi (Country Chicken)', 'നാടുകോഴി', 'nattukozhi-country-chicken', 'Free-range country chicken from local farms', true),
  ('Nadan Fish', 'നാടൻ മത്സ്യം', 'nadan-fish', 'Fresh catch from Kerala backwaters and Arabian Sea', true),
  ('Home-cooked Sadhya Items', 'വീട്ടിലുണ്ടാക്കിയ സദ്യ വിഭവങ്ങൾ', 'home-cooked-sadhya-items', 'Traditional Kerala sadhya delicacies made at home', true),
  ('Dairy & Milk', 'പാൽ ഉൽപ്പന്നങ്ങൾ', 'dairy-milk', 'Fresh milk and dairy products from local dairies', true),
  ('Fruits', 'പഴങ്ങൾ', 'fruits', 'Seasonal fruits from Kerala orchards', true),
  ('Spices & Condiments', 'സുഗന്ധവ്യഞ്ജനങ്ങൾ', 'spices-condiments', 'Authentic Kerala spices and homemade condiments', true);
```

Or use the CLI:
```bash
supabase db reset --linked
```

## 2. Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com).
2. Go to **Settings > API Keys** and generate **Live Keys**.
3. Copy the **Key ID** (public) and **Key Secret** (private).
4. Enable **UPI** as a payment method in **Settings > Payment Methods**.
5. For testing, use **Test Mode** keys. Switch to **Live Mode** for production.

## 3. Deploy to Vercel

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy
```bash
vercel --prod
```

### Set Environment Variables in Vercel Dashboard
Go to your project on [vercel.com](https://vercel.com) > **Settings > Environment Variables** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay Key ID (same as above) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Your Google Maps API key |
| `GROQ_API_KEY` | Your Groq API key |

### Add Supabase URL to Razorpay
In **Razorpay Dashboard > Settings > Webhooks**, add:
```
https://YOUR_VERCEL_URL/api/payments/verify
```

## 4. Set First Admin User

After the first user signs up, run this SQL in the **Supabase SQL Editor** to promote them to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@example.com'
  LIMIT 1
);
```

Replace `admin@example.com` with the actual email of the admin user.

## 5. Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase migrations applied
- [ ] Storage buckets created with correct policies
- [ ] Google OAuth enabled and redirect URLs configured
- [ ] Razorpay live keys set and UPI enabled
- [ ] First admin user promoted
- [ ] Categories seeded
- [ ] Run `npm run build` locally to confirm zero errors
- [ ] Test login flow (email + Google OAuth)
- [ ] Test checkout flow with Razorpay test mode
- [ ] Test vendor product creation
- [ ] Test admin dashboard access
