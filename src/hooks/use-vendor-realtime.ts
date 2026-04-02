'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseVendorRealtimeOptions {
  vendorId: string
  onNewOrder: (payload: Record<string, unknown>) => void
}

export function useVendorRealtime({ vendorId, onNewOrder }: UseVendorRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onNewOrderRef = useRef(onNewOrder)
  onNewOrderRef.current = onNewOrder

  const stableCallback = useCallback((payload: Record<string, unknown>) => {
    onNewOrderRef.current(payload)
  }, [])

  useEffect(() => {
    if (!vendorId) return

    const supabase = createClient()

    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          stableCallback(payload.new as Record<string, unknown>)
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
  }, [vendorId, stableCallback])
}
