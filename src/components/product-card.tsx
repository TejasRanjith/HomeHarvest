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
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-[var(--surface-elevated)] rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 flex flex-col border border-[var(--border-light)]"
    >
      {/* Image container */}
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-50">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.image_urls?.[0] ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500 absolute inset-0 mix-blend-multiply"
          />
        </Link>

        {/* Stock badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock && (
            <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-md shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Favorite button */}
        {showFavourite && (
          <motion.button
            onClick={handleToggleFavourite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 left-3 p-1.5 bg-white rounded-full shadow-sm hover:shadow transition-all z-10"
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <motion.svg
              className={`w-4 h-4 ${isFavourited ? 'text-red-500' : 'text-gray-400'}`}
              fill={isFavourited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={isFavourited ? { scale: [1, 1.2, 1] } : {}}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </motion.svg>
          </motion.button>
        )}
      </div>

      {/* Content container */}
      <div className="flex flex-col flex-1 p-4 bg-white relative z-20">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-[var(--foreground)] font-bold text-sm tracking-tight truncate hover:text-[var(--primary)] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1 truncate">{vendorName}</p>

        {/* Mock Rating */}
        <div className="flex items-center gap-1 mt-2">
            <span className="text-amber-400 text-xs text-shadow-sm">★★★★☆</span>
            <span className="text-[10px] text-gray-400">(24)</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price and Add button area */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-[var(--primary-dark)]">
              {formatPrice(Number(product.price))}
            </span>
            <span className="text-xs text-[var(--muted-light)] line-through">
              {formatPrice(Number(product.price) * 1.15)}
            </span>
          </div>

          {/* Add to Cart button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            className={`w-full py-2 rounded-full font-semibold text-xs tracking-wider transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-white border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:shadow-md'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdding ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-1"
                >
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>✓</motion.span>
                  Added
                </motion.span>
              ) : (
                <span>{isOutOfStock ? 'Unavailable' : 'Select Options'}</span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}