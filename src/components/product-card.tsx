'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

  useEffect(() => {
    if (initialFavourited !== undefined) {
      setIsFavourited(initialFavourited)
    }
  }, [initialFavourited])

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      quantity: product.min_order_quantity,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_urls?.[0] ?? null,
      unit: product.unit,
    })
    toast.success(`${product.name} added to cart`)
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

  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden bg-white flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={product.image_urls?.[0] ?? PLACEHOLDER_IMAGE}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
            {product.is_available && product.stock_quantity > 0 && (
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  In Stock
                </span>
              </div>
            )}
          </div>
        </Link>
        {showFavourite && (
          <button
            onClick={handleToggleFavourite}
            className="absolute top-2 left-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition shadow-sm"
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg
              className={`w-5 h-5 ${isFavourited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
              fill={isFavourited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          {product.name_ml && (
            <p className="text-xs text-gray-500 mt-0.5">{product.name_ml}</p>
          )}
        </Link>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">
            {formatPrice(Number(product.price))}
          </span>
          <span className="text-xs text-gray-500">/{product.unit}</span>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-1">{vendorName}</p>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.is_available || product.stock_quantity <= 0}
            className="flex-1 bg-cta-yellow text-cta-text text-sm font-medium py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
