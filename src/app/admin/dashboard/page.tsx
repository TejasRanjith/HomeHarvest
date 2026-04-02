import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as Record<string, unknown>).role !== 'admin') {
    redirect('/')
  }

  const today = new Date().toISOString().split('T')[0]

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalVendors } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'vendor')

  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', today)

  const typedTodayOrders = (todayOrders ?? []) as Array<Record<string, unknown>>
  const revenueToday = typedTodayOrders.reduce(
    (sum: number, o: Record<string, unknown>) => sum + Number(o.total_amount ?? 0),
    0
  )

  const { data: recentOrders } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      total_amount,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(full_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(20)

  const typedRecentOrders = (recentOrders ?? []) as Array<Record<string, unknown>>

  const { data: pendingKyc } = await supabase
    .from('profiles')
    .select('id, full_name, vendor_name, kyc_status, created_at')
    .eq('role', 'vendor')
    .in('kyc_status', ['pending', 'submitted'])
    .order('created_at', { ascending: false })

  const typedPendingKyc = (pendingKyc ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Vendors</p>
          <p className="text-3xl font-bold text-[#8FBC8F] mt-2">{totalVendors ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Orders Today</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{ordersToday ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Revenue Today</p>
          <p className="text-3xl font-bold text-[#8FBC8F] mt-2">
            {formatPrice(revenueToday)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {typedRecentOrders.map((order) => (
                  <tr key={order.id as string}>
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
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
                {typedRecentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending KYC</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {typedPendingKyc.map((vendor) => (
                  <tr key={vendor.id as string}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{vendor.full_name as string}</p>
                      {(vendor.vendor_name != null) && (
                        <p className="text-xs text-gray-500">{vendor.vendor_name as string}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        vendor.kyc_status === 'submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.kyc_status as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {vendor.created_at
                        ? new Date(vendor.created_at as string).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {typedPendingKyc.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      No pending KYC requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
