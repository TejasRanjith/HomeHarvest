'use client'

import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface VendorDashboardContentProps {
  orders: Array<Record<string, unknown>>
  topProducts: Array<Record<string, unknown>>
}

export function VendorDashboardContent({ orders, topProducts }: VendorDashboardContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const shortId = (order.id as string).slice(-8).toUpperCase()
                const buyer = order.buyer as Record<string, unknown> | null
                const orderItems = (order.order_items ?? []) as Array<Record<string, unknown>>
                const itemCount = orderItems.length
                const status = order.status as string
                const statusColor = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
                const date = order.created_at
                  ? new Date(order.created_at as string).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''

                return (
                  <tr key={order.id as string} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs">{shortId}</td>
                    <td className="px-4 py-3">{(buyer?.full_name as string) ?? '—'}</td>
                    <td className="px-4 py-3">{itemCount}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(Number(order.total_amount ?? 0))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{date}</td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {topProducts.map((product, idx) => (
            <div key={product.id as string} className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#8FBC8F] w-6">#{idx + 1}</span>
              <span className="text-sm text-gray-700 truncate">
                {product.name as string}
              </span>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No products yet</p>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/vendor/products/new"
            className="block w-full text-center bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition"
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  )
}
