'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { OrderTracker } from '@/components/order-tracker'
import { ReviewModal } from '@/components/review-modal'
import { toast } from 'react-hot-toast'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

interface OrderCardProps {
  order: Record<string, unknown>
  existingReviewProductIds: Set<string>
}

export function OrderCard({ order, existingReviewProductIds }: OrderCardProps) {
  const { addItem } = useCart()
  const [reviewModal, setReviewModal] = useState<{
    productId: string
    orderId: string
    productName: string
  } | null>(null)

  const orderItems = (order.order_items ?? []) as Array<Record<string, unknown>>
  const status = order.status as string
  const statusColor = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
  const statusLabel = STATUS_LABELS[status] ?? status
  const shortId = (order.id as string).slice(-8).toUpperCase()
  const createdAt = order.created_at
    ? new Date(order.created_at as string).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const deliverySlot = order.delivery_slot_id
    ? {
        slotDate: (order as Record<string, unknown>).delivery_slots
          ? ((order as Record<string, unknown>).delivery_slots as Record<string, unknown>)?.slot_date
          : null,
        startTime: (order as Record<string, unknown>).delivery_slots
          ? ((order as Record<string, unknown>).delivery_slots as Record<string, unknown>)?.start_time
          : null,
        endTime: (order as Record<string, unknown>).delivery_slots
          ? ((order as Record<string, unknown>).delivery_slots as Record<string, unknown>)?.end_time
          : null,
      }
    : null

  const typedDeliverySlot = deliverySlot?.slotDate
    ? {
        slotDate: deliverySlot.slotDate as string,
        startTime: deliverySlot.startTime as string,
        endTime: deliverySlot.endTime as string,
      }
    : null

  const handleReorder = () => {
    for (const item of orderItems) {
      const product = item.products as Record<string, unknown> | null
      addItem({
        product_id: item.product_id as string,
        quantity: Number(item.quantity),
        name: (product?.name as string) ?? 'Product',
        price: Number(item.unit_price),
        image_url: (product?.image_urls as string[] | null)?.[0] ?? null,
        unit: 'kg',
      })
    }
    toast.success('All items added to cart!')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-mono text-gray-500">#{shortId}</p>
          <p className="text-xs text-gray-400 mt-0.5">{createdAt}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {status !== 'pending' && status !== 'cancelled' && (
        <div className="mb-4">
          <OrderTracker
            orderId={order.id as string}
            currentStatus={status}
            deliverySlot={typedDeliverySlot}
          />
        </div>
      )}

      <div className="space-y-2 mb-4">
        {orderItems.slice(0, 3).map((item) => {
          const product = item.products as Record<string, unknown> | null
          const productId = item.product_id as string
          const canReview =
            status === 'delivered' &&
            !existingReviewProductIds.has(productId)

          return (
            <div
              key={item.id as string}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600 truncate mr-2">
                {(product?.name as string) ?? 'Product'} ×{' '}
                {Number(item.quantity)}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-gray-900 font-medium">
                  {formatPrice(Number(item.total_price))}
                </span>
                {canReview && (
                  <button
                    onClick={() =>
                      setReviewModal({
                        productId,
                        orderId: order.id as string,
                        productName: (product?.name as string) ?? 'Product',
                      })
                    }
                    className="text-xs text-[#8FBC8F] hover:underline"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {orderItems.length > 3 && (
          <p className="text-xs text-gray-400">
            +{orderItems.length - 3} more items
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          {status === 'delivered' && (
            <button
              onClick={handleReorder}
              className="text-sm text-[#8FBC8F] hover:underline font-medium"
            >
              Reorder
            </button>
          )}
        </div>
        <span className="text-lg font-bold text-[#8FBC8F]">
          {formatPrice(Number(order.total_amount))}
        </span>
      </div>

      {reviewModal && (
        <ReviewModal
          productId={reviewModal.productId}
          orderId={reviewModal.orderId}
          productName={reviewModal.productName}
          onClose={() => setReviewModal(null)}
          onSubmit={() => {
            setReviewModal(null)
          }}
        />
      )}
    </div>
  )
}
