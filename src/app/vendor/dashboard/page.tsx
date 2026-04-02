import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { VendorDashboardContent } from '@/components/vendor-dashboard-content'
import { KycBanner } from '@/components/kyc-banner'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as Record<string, unknown>).role !== 'vendor') {
    redirect('/')
  }

  const vendorId = user.id
  const today = new Date().toISOString().split('T')[0]

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status')
    .eq('buyer_id', vendorId)
    .gte('created_at', today)

  const { data: allOrders } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      total_amount,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(full_name),
      order_items:order_items(
        id,
        quantity,
        unit_price,
        total_price,
        products:products(id, name, vendor_id)
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(10)

  const typedAllOrders = (allOrders ?? []) as Array<Record<string, unknown>>
  const typedTodayOrders = (todayOrders ?? []) as Array<Record<string, unknown>>

  const todayOrderCount = typedTodayOrders.length
  const todayRevenue = typedTodayOrders.reduce(
    (sum: number, order: Record<string, unknown>) => sum + Number(order.total_amount ?? 0),
    0
  )

  const pendingOrderCount = typedAllOrders.filter(
    (o: Record<string, unknown>) => o.status === 'pending'
  ).length

  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .eq('vendor_id', vendorId)

  const typedProducts = (products ?? []) as Array<Record<string, unknown>>
  const lowStockCount = typedProducts.filter(
    (p: Record<string, unknown>) => Number(p.stock_quantity ?? 0) < 5
  ).length

  const topProducts = typedProducts.slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KycBanner profile={profile as Record<string, unknown>} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Today&apos;s Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{todayOrderCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
          <p className="text-3xl font-bold text-[#8FBC8F] mt-2">
            {formatPrice(todayRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {pendingOrderCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockCount}</p>
        </div>
      </div>

      <VendorDashboardContent orders={typedAllOrders} topProducts={topProducts} />
    </div>
  )
}
