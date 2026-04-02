'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface DisputesTableProps {
  orders: Array<Record<string, unknown>>
}

export function DisputesTable({ orders }: DisputesTableProps) {
  const supabase = createClient()
  const [openNoteId, setOpenNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAddNote = async (orderId: string) => {
    if (!noteText.trim()) return
    setProcessingId(orderId)

    const sanitized = noteText.replace(/<[^>]*>/g, '')

    const { error } = await supabase
      .from('orders')
      .update({ special_instructions: sanitized })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to add note')
    } else {
      toast.success('Refund note added')
      setOpenNoteId(null)
      setNoteText('')
    }
    setProcessingId(null)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setProcessingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Status updated')
      window.location.reload()
    }
    setProcessingId(null)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Order</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Payment</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id as string} className="hover:bg-gray-50/50">
              <td className="px-4 py-3 font-mono text-xs">
                {(order.id as string).slice(-8).toUpperCase()}
              </td>
              <td className="px-4 py-3">
                {(order.buyer as Record<string, unknown>)?.full_name as string ?? '—'}
              </td>
              <td className="px-4 py-3 font-medium">
                {formatPrice(Number(order.total_amount))}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.status as string}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.payment_status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : order.payment_status === 'refunded'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.payment_status as string}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {openNoteId === order.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Refund note..."
                        className="w-40 px-2 py-1 text-xs border border-gray-200 rounded outline-none"
                      />
                      <button
                        onClick={() => handleAddNote(order.id as string)}
                        disabled={processingId === order.id}
                        className="text-xs text-green-600 hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setOpenNoteId(null)
                          setNoteText('')
                        }}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenNoteId(order.id as string)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Add Note
                    </button>
                  )}
                  <select
                    value={order.status as string}
                    onChange={(e) => handleStatusUpdate(order.id as string, e.target.value)}
                    disabled={processingId === order.id}
                    className="text-xs px-2 py-1 border border-gray-200 rounded outline-none disabled:opacity-50"
                    aria-label={`Update status for order ${order.id as string}`}
                  >
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No disputes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
