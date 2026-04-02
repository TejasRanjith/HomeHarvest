'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'react-hot-toast'

interface AddToCartSectionProps {
  product: {
    product_id: string
    name: string
    price: number
    image_url: string | null
    unit: string
    min_order_quantity: number
    stock_quantity: number
    is_available: boolean
  }
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(product.min_order_quantity)

  const handleAddToCart = () => {
    addItem({
      product_id: product.product_id,
      quantity,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      unit: product.unit,
    })
    toast.success(`${product.name} added to cart`)
  }

  const incrementQty = () => {
    if (quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQty = () => {
    if (quantity > product.min_order_quantity) {
      setQuantity((prev) => prev - 1)
    }
  }

  const isDisabled = !product.is_available || product.stock_quantity <= 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={decrementQty}
            disabled={quantity <= product.min_order_quantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
            {quantity} {product.unit}
          </span>
          <button
            onClick={incrementQty}
            disabled={quantity >= product.stock_quantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="w-full bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`Add ${product.name} to cart`}
      >
        {isDisabled ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
