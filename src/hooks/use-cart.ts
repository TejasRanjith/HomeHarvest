'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

const CART_STORAGE_KEY = 'hh_cart'

interface CartItemData {
  product_id: string
  quantity: number
  name: string
  price: number
  image_url: string | null
  unit: string
}

interface GuestCartItem {
  product_id: string
  quantity: number
  name: string
  price: number
  image_url: string | null
  unit: string
}

interface UseCartReturn {
  items: CartItemData[]
  addItem: (item: CartItemData) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
}

function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : []
  } catch {
    return []
  }
}

function setGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function useCart(): UseCartReturn {
  const { user } = useAuth()
  const supabase = createClient()
  const [items, setItems] = useState<CartItemData[]>([])

  const loadGuestCart = useCallback((): void => {
    const guestItems = getGuestCart()
    const mapped: CartItemData[] = guestItems.map((g) => ({
      product_id: g.product_id,
      quantity: g.quantity,
      name: g.name,
      price: g.price,
      image_url: g.image_url,
      unit: g.unit,
    }))
    setItems(mapped)
  }, [])

  const loadUserCart = useCallback(async (): Promise<void> => {
    if (!user) return
    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        product_id,
        quantity,
        products!cart_items_product_id_fkey(name, price, image_urls, unit)
      `
      )
      .eq('user_id', user.id)

    if (error) {
      console.error('Error loading cart:', error)
      return
    }

    const mapped: CartItemData[] = (data ?? []).map((row: Record<string, unknown>) => {
      const product = row.products as Record<string, unknown> | null
      return {
        product_id: row.product_id as string,
        quantity: Number(row.quantity),
        name: (product?.name as string) ?? 'Unknown',
        price: Number(product?.price ?? 0),
        image_url: (product?.image_urls as string[] | null)?.[0] ?? null,
        unit: (product?.unit as string) ?? 'kg',
      }
    })
    setItems(mapped)
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      void loadUserCart()
    } else {
      loadGuestCart()
    }
  }, [user, loadGuestCart, loadUserCart])

  const _syncGuestCartToSupabase = useCallback(
    async (guestItems: GuestCartItem[]): Promise<void> => {
      if (!user) return
      for (const item of guestItems) {
        const { error } = await supabase.from('cart_items').upsert({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
        })
        if (error) {
          console.error('Error syncing cart item:', error)
        }
      }
      setGuestCart([])
      await loadUserCart()
    },
    [user, supabase, loadUserCart]
  )

  const addItem = useCallback(
    (item: CartItemData): void => {
      if (user) {
        supabase
          .from('cart_items')
          .upsert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
          })
          .then((result: { error: unknown }) => {
            if (result.error) {
              console.error('Error adding to cart:', result.error)
              return
            }
            void loadUserCart()
          })
      } else {
        const guestItems = getGuestCart()
        const existing = guestItems.find((i) => i.product_id === item.product_id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          guestItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            unit: item.unit,
          })
        }
        setGuestCart(guestItems)
        loadGuestCart()
      }
    },
    [user, supabase, loadGuestCart, loadUserCart]
  )

  const removeItem = useCallback(
    (productId: string): void => {
      if (user) {
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .then((result: { error: unknown }) => {
            if (result.error) {
              console.error('Error removing from cart:', result.error)
              return
            }
            void loadUserCart()
          })
      } else {
        const guestItems = getGuestCart().filter((i) => i.product_id !== productId)
        setGuestCart(guestItems)
        loadGuestCart()
      }
    },
    [user, supabase, loadGuestCart, loadUserCart]
  )

  const updateQty = useCallback(
    (productId: string, quantity: number): void => {
      if (quantity <= 0) {
        removeItem(productId)
        return
      }

      if (user) {
        supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .then((result: { error: unknown }) => {
            if (result.error) {
              console.error('Error updating cart:', result.error)
              return
            }
            void loadUserCart()
          })
      } else {
        const guestItems = getGuestCart()
        const item = guestItems.find((i) => i.product_id === productId)
        if (item) {
          item.quantity = quantity
          setGuestCart(guestItems)
          loadGuestCart()
        }
      }
    },
    [user, supabase, removeItem, loadGuestCart, loadUserCart]
  )

  const clearCart = useCallback((): void => {
    if (user) {
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .then((result: { error: unknown }) => {
          if (result.error) {
            console.error('Error clearing cart:', result.error)
            return
          }
          void loadUserCart()
        })
    } else {
      setGuestCart([])
      setItems([])
    }
  }, [user, supabase, loadUserCart])

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return { items, addItem, removeItem, updateQty, clearCart, totalAmount }
}
