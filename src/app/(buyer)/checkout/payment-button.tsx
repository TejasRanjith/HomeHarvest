'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay'
import { toast } from 'react-hot-toast'

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
  unit: string
}

interface Profile {
  id: string
  full_name: string
  phone: string | null
  email?: string
}

interface PaymentButtonProps {
  amount: number
  profile: Profile
  address: string
  selectedSlotId: string
  couponCode: string | null
  discountAmount: number
  items: CartItem[]
  onPaymentSuccess: () => void
}

export function PaymentButton({
  amount,
  profile,
  address,
  selectedSlotId,
  couponCode,
  discountAmount,
  items,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address')
      return
    }

    setIsProcessing(true)

    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          receipt: `order_${Date.now()}`,
        }),
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json()
        toast.error(errorData.error ?? 'Failed to create order')
        setIsProcessing(false)
        return
      }

      const order = await orderRes.json()

      await loadRazorpayScript()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'HomeHarvest',
        description: 'Fresh from Thrissur',
        order_id: order.id,
        prefill: {
          name: profile.full_name,
          email: (profile as unknown as Record<string, string>).email ?? '',
          contact: profile.phone ?? '',
        },
        theme: {
          color: '#8FBC8F',
        },
        method: {
          upi: true,
        },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: {
                  address,
                  delivery_slot_id: selectedSlotId || null,
                  coupon_code: couponCode,
                  discount_amount: discountAmount,
                  items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                  })),
                },
              }),
            })

            const verifyResult = await verifyRes.json()

            if (!verifyRes.ok) {
              toast.error(verifyResult.error ?? 'Payment verification failed')
              setIsProcessing(false)
              return
            }

            onPaymentSuccess()
            toast.success('Order placed!')
            router.push('/orders?success=true')
          } catch {
            toast.error('Payment verification failed, please contact support')
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          },
        },
      }

      openRazorpayCheckout(options)
    } catch {
      toast.error('Payment failed, please try again')
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? 'Processing...' : 'Pay Now'}
    </button>
  )
}
