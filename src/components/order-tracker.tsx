'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

const STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const STEP_ORDER: Record<string, number> = {
  confirmed: 0,
  preparing: 1,
  out_for_delivery: 2,
  delivered: 3,
}

interface OrderTrackerProps {
  orderId: string
  currentStatus: string
  deliverySlot: {
    slotDate: string
    startTime: string
    endTime: string
  } | null
}

export function OrderTracker({ orderId, currentStatus, deliverySlot }: OrderTrackerProps) {
  const [status, setStatus] = useState(currentStatus)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const currentStepIdx = STEP_ORDER[status] ?? -1

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as Record<string, unknown>).status as string
          if (newStatus) setStatus(newStatus)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [orderId, supabase])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStepIdx > idx
          const isCurrent = currentStepIdx === idx
          const _isFuture = currentStepIdx < idx

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-[#8FBC8F] text-white'
                      : isCurrent
                        ? 'bg-[#F0E68C] text-[#5C4033]'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs mt-1 text-center leading-tight ${
                    isCompleted
                      ? 'text-[#8FBC8F]'
                      : isCurrent
                        ? 'text-[#5C4033] font-medium'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-[-12px] ${
                    isCompleted ? 'bg-[#8FBC8F]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {deliverySlot && (
        <p className="text-xs text-gray-500 text-center">
          Estimated delivery:{' '}
          {new Date(deliverySlot.slotDate).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}{' '}
          {deliverySlot.startTime} — {deliverySlot.endTime}
        </p>
      )}
    </div>
  )
}
