'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductWithVendor } from '@/types'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface ProductCardProps {
  product: ProductWithVendor
  isFavourited?: boolean
  showFavourite?: boolean
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export function ProductCard({ product, isFavourited: initialFavourited, showFavourite = true }: ProductCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const supabase = createClient()
  const [isFavourited, setIsFavourited] = useState(initialFavourited ?? false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (initialFavourited !== undefined) {
      setIsFavourited(initialFavourited)
    }
  }, [initialFavourited])

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      product_id: product.id,
      quantity: product.min_order_quantity,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_urls?.[0] ?? null,
      unit: product.unit,
    })
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setIsAdding(false), 500)
  }

  const handleToggleFavourite = async () => {
    if (!user) {
      toast.error('Please login to save items')
      router.push('/login')
      return
    }

    if (isFavourited) {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id)

      if (error) {
        toast.error('Failed to remove from favourites')
        return
      }

      setIsFavourited(false)
      toast.success('Removed from favourites')
    } else {
      const { error } = await supabase
        .from('favourites')
        .insert({
          user_id: user.id,
          product_id: product.id,
        })

      if (error) {
        toast.error('Failed to save to favourites')
        return
      }

      setIsFavourited(true)
      toast.success('Added to favourites')
    }
  }

  const vendorName = product.vendor?.vendor_name ?? product.vendor?.full_name ?? 'Unknown Vendor'
  const isOutOfStock = !product.is_available || product.stock_quantity <= 0

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.image_urls?.[0] ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>

        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
              Out of Stock
            </span>
          ) : (
            <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg shadow-primary/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              In Stock
            </span>
          )}
        </div>

        {/* Favorite button */}
        {showFavourite && (
          <motion.button
            onClick={handleToggleFavourite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all"
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <motion.svg
              className={`w-5 h-5 ${isFavourited ? 'text-red-500' : 'text-gray-400'}`}
              fill={isFavourited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={isFavourited ? { scale: [1, 1.2, 1] } : {}}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </motion.svg>
          </motion.button>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(Number(product.price))}
          </span>
          <span className="text-xs text-muted">/{product.unit}</span>
        </div>

        {/* Add to Cart button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
          whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
          className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            isOutOfStock
              ? 'bg-gray-100 text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30'
          }`}
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ✓
                </motion.span>
                Added!
              </motion.span>
            ) : (
              <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}