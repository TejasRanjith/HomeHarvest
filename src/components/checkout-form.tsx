'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { PaymentButton } from '@/app/(buyer)/checkout/payment-button'
import { toast } from 'react-hot-toast'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface Profile {
  id: string
  full_name: string
  phone: string | null
  address: string | null
  city: string
  state: string
  pincode: string | null
  role: string
  vendor_name: string | null
  vendor_verified: boolean
  created_at: string
  updated_at: string
}

interface DeliverySlot {
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

interface CheckoutFormProps {
  profile: Profile
  deliverySlots: DeliverySlot[]
}

export function CheckoutForm({ profile, deliverySlots }: CheckoutFormProps) {
  const { items, totalAmount, clearCart } = useCart()
  const [address, setAddress] = useState(profile.address ?? '')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [_isProcessing, setIsProcessing] = useState(false)

  const deliveryFee = 0
  const subtotal = totalAmount
  const total = subtotal + deliveryFee - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplyingCoupon(true)
    setCouponError('')

    try {
      const res = await fetch('/api/payments/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      })

      const result = await res.json()

      if (!res.ok) {
        setCouponError(result.error ?? 'Invalid coupon')
        return
      }

      setDiscountAmount(result.discount)
      setCouponApplied(true)
      toast.success(`Coupon applied! ${formatPrice(result.discount)} off`)
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Delivery Address
          </h2>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition resize-none"
            aria-label="Delivery address"
          />
        </div>

        {deliverySlots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Slot
            </h2>
            <div className="space-y-3">
              {deliverySlots.map((slot) => (
                <label
                  key={slot.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    selectedSlotId === slot.id
                      ? 'border-[#8FBC8F] bg-[#8FBC8F]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliverySlot"
                    value={slot.id}
                    checked={selectedSlotId === slot.id}
                    onChange={() => setSelectedSlotId(slot.id)}
                    className="w-4 h-4 text-[#8FBC8F] focus:ring-[#8FBC8F]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(slot.slot_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {slot.start_time} — {slot.end_time}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Coupon Code
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase())
                setCouponError('')
              }}
              placeholder="Enter coupon code"
              disabled={couponApplied}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition disabled:bg-gray-50"
              aria-label="Coupon code"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || couponApplied || !couponCode.trim()}
              className="px-6 py-3 bg-[#8FBC8F] text-white font-medium rounded-lg hover:bg-[#7daa7d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingCoupon ? 'Checking...' : couponApplied ? 'Applied' : 'Apply'}
            </button>
          </div>
          {couponError && (
            <p className="mt-2 text-sm text-red-500">{couponError}</p>
          )}
          {couponApplied && (
            <p className="mt-2 text-sm text-[#8FBC8F] font-medium">
              Coupon applied! You save {formatPrice(discountAmount)}
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-900 font-medium flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-[#8FBC8F]">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="text-gray-900">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-[#8FBC8F]">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <PaymentButton
              amount={total}
              profile={profile}
              address={address}
              selectedSlotId={selectedSlotId}
              couponCode={couponApplied ? couponCode : null}
              discountAmount={discountAmount}
              items={items}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
