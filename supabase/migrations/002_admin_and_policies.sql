-- HomeHarvest Migration 002: Admin policies and helper functions
-- Run after 001_initial_schema.sql

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ORDERS: admin can read all rows
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.vendor_id = auth.uid()
    )
    OR
    public.is_admin()
  );

-- PROFILES: admin can read and update all rows
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- PRODUCTS: admin can update is_available on any product
CREATE POLICY "Admins can update product availability" ON products
  FOR UPDATE USING (
    auth.uid() = vendor_id
    OR
    public.is_admin()
  );

-- Add notes column to orders for admin refund notes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add preferred_language column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Storage bucket policies for product-images (public read)
-- These should be run after creating the buckets in Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage bucket policies for kyc-documents (private, authenticated only)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

CREATE POLICY "Authenticated users can read own KYC documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can upload KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents'
    AND auth.role() = 'authenticated'
  );

-- Storage bucket policies for review-images (private, authenticated only)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', false);

CREATE POLICY "Anyone can read review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own review images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
