export interface Profile {
  id: string
  full_name: string
  phone: string | null
  address: string | null
  city: string
  state: string
  pincode: string | null
  role: 'buyer' | 'vendor' | 'admin'
  vendor_name: string | null
  vendor_verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_ml: string | null
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  vendor_id: string
  category_id: string
  name: string
  name_ml: string | null
  description: string | null
  image_urls: string[] | null
  price: number
  unit: string
  stock_quantity: number
  min_order_quantity: number
  is_available: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  delivery_fee: number
  discount_amount: number
  total_amount: number
  delivery_address: string
  delivery_slot_id: string | null
  payment_id: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id: string | null
  rating: number
  comment: string | null
  is_verified_purchase: boolean
  created_at: string
}

export interface Favourite {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export interface DeliverySlot {
  id: string
  area: string
  slot_date: string
  start_time: string
  end_time: string
  max_orders: number
  current_orders: number
  is_available: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'order' | 'delivery' | 'promo' | 'system'
  is_read: boolean
  link: string | null
  created_at: string
}

export interface ProductWithVendor extends Product {
  vendor: Pick<Profile, 'id' | 'full_name' | 'vendor_name' | 'vendor_verified'> | null
}

export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'id' | 'full_name'> | null
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile }
      categories: { Row: Category }
      products: { Row: Product }
      orders: { Row: Order }
      order_items: { Row: OrderItem }
      cart_items: { Row: CartItem }
      reviews: { Row: Review }
      favourites: { Row: Favourite }
      coupons: { Row: Coupon }
      delivery_slots: { Row: DeliverySlot }
      notifications: { Row: Notification }
    }
  }
}
