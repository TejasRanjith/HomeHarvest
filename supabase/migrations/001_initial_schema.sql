-- HomeHarvest Initial Schema
-- Hyperlocal farm-to-home marketplace for Thrissur, Kerala

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  address TEXT,
  city TEXT DEFAULT 'Thrissur',
  state TEXT DEFAULT 'Kerala',
  pincode TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  vendor_name TEXT,
  vendor_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  kyc_rejection_reason TEXT,
  kudumbashree_unit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ml TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ml TEXT,
  description TEXT,
  image_urls TEXT[],
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity NUMERIC(10, 2) DEFAULT 1,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  delivery_address TEXT NOT NULL,
  delivery_slot_id UUID REFERENCES delivery_slots(id),
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER_ITEMS TABLE
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CART_ITEMS TABLE
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 7. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 8. FAVOURITES TABLE
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. COUPONS TABLE
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DELIVERY_SLOTS TABLE
CREATE TABLE delivery_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area TEXT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 20,
  current_orders INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area, slot_date, start_time, end_time)
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('order', 'delivery', 'promo', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY ""Users can view own profile"" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY ""Users can update own profile"" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES POLICIES (public read, admin write)
CREATE POLICY ""Anyone can read categories"" ON categories
  FOR SELECT USING (true);

CREATE POLICY ""Admins can insert categories"" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can update categories"" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can delete categories"" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS POLICIES (anyone read, vendor write their own)
CREATE POLICY ""Anyone can read products"" ON products
  FOR SELECT USING (true);

CREATE POLICY ""Vendors can insert own products"" ON products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY ""Vendors can update own products"" ON products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY ""Vendors can delete own products"" ON products
  FOR DELETE USING (auth.uid() = vendor_id);

-- ORDERS POLICIES (buyers see own, vendors see orders with their products)
CREATE POLICY ""Buyers can view own orders"" ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY ""Vendors can see orders with their products"" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.vendor_id = auth.uid()
    )
  );

CREATE POLICY ""Buyers can create orders"" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY ""Buyers can update own orders"" ON orders
  FOR UPDATE USING (auth.uid() = buyer_id);

-- ORDER_ITEMS POLICIES (follow orders access)
CREATE POLICY ""Users can view order items for their orders"" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM order_items oi2
      JOIN products p ON p.id = oi2.product_id
      WHERE oi2.order_id = order_items.order_id AND p.vendor_id = auth.uid()
    )
  );

CREATE POLICY ""System can insert order items"" ON order_items
  FOR INSERT WITH CHECK (true);

-- CART_ITEMS POLICIES (users own cart only)
CREATE POLICY ""Users can view own cart"" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ""Users can insert into own cart"" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ""Users can update own cart"" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ""Users can delete from own cart"" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- REVIEWS POLICIES (users own reviews only)
CREATE POLICY ""Anyone can read reviews"" ON reviews
  FOR SELECT USING (true);

CREATE POLICY ""Users can insert own reviews"" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ""Users can update own reviews"" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ""Users can delete own reviews"" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- FAVOURITES POLICIES (users own favourites only)
CREATE POLICY ""Users can view own favourites"" ON favourites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ""Users can insert own favourites"" ON favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ""Users can delete own favourites"" ON favourites
  FOR DELETE USING (auth.uid() = user_id);

-- COUPONS POLICIES (public read, admin write)
CREATE POLICY ""Anyone can read active coupons"" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY ""Admins can insert coupons"" ON coupons
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can update coupons"" ON coupons
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can delete coupons"" ON coupons
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELIVERY_SLOTS POLICIES (public read, admin write)
CREATE POLICY ""Anyone can read delivery slots"" ON delivery_slots
  FOR SELECT USING (true);

CREATE POLICY ""Admins can insert delivery slots"" ON delivery_slots
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can update delivery slots"" ON delivery_slots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY ""Admins can delete delivery slots"" ON delivery_slots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- NOTIFICATIONS POLICIES (users own notifications only)
CREATE POLICY ""Users can view own notifications"" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ""System can insert notifications"" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY ""Users can update own notifications"" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ""Users can delete own notifications"" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_favourites_user_id ON favourites(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_delivery_slots_area_date ON delivery_slots(area, slot_date);

-- STORAGE BUCKETS (run these in Supabase Dashboard SQL Editor or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);
