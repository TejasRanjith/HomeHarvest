'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'react-hot-toast'

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface CartVendorGroup {
  vendorName: string
  items: Array<{
    product_id: string
    name: string
    price: number
    quantity: number
    image_url: string | null
    unit: string
  }>
  subtotal: number
}

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQty, removeItem, totalAmount } = useCart()
  const router = useRouter()

  const groupedByVendor = items.reduce<CartVendorGroup[]>((acc, item) => {
    const vendorName = 'HomeHarvest Vendor'
    const existing = acc.find((g) => g.vendorName === vendorName)
    if (existing) {
      existing.items.push(item)
      existing.subtotal += item.price * item.quantity
    } else {
      acc.push({
        vendorName,
        items: [item],
        subtotal: item.price * item.quantity,
      })
    }
    return acc
  }, [])

  const handleProceedToCheckout = useCallback(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setIsOpen(false)
    router.push('/checkout')
  }, [items.length, router])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-[#8FBC8F] transition"
        aria-label="Open cart"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8FBC8F] text-white text-xs rounded-full flex items-center justify-center font-medium">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">Your cart is empty</p>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/')
                    }}
                    className="mt-4 text-[#8FBC8F] hover:underline text-sm"
                  >
                    Browse products
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedByVendor.map((group) => (
                    <div key={group.vendorName}>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        {group.vendorName}
                      </h3>
                      <div className="space-y-4">
                        {group.items.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex gap-3 p-3 rounded-xl border border-gray-100"
                          >
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={item.image_url ?? PLACEHOLDER_IMAGE}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatPrice(item.price)}/{item.unit}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border border-gray-200 rounded-lg">
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        item.product_id,
                                        item.quantity - 1
                                      )
                                    }
                                    className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 transition"
                                    aria-label="Decrease quantity"
                                  >
                                    −
                                  </button>
                                  <span className="px-2 text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        item.product_id,
                                        item.quantity + 1
                                      )
                                    }
                                    className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 transition"
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-sm font-semibold text-[#8FBC8F]">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-gray-400 hover:text-red-500 transition self-start"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#8FBC8F]">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
