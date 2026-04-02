import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { VendorAnalyticsContent } from '@/components/vendor-analytics-content'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export default async function VendorAnalyticsPage() {
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

  if (!profile || (profile as Record<string, unknown>).role !== 'vendor') {
    redirect('/')
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('vendor_id', user.id)

  const typedProducts = (products ?? []) as Array<Record<string, unknown>>
  const productIds = typedProducts.map((p) => p.id as string)

  const { data: orderItems } = await supabase
    .from('order_items')
    .select(
      `
      product_id,
      quantity,
      total_price,
      orders!order_items_order_id_fkey(buyer_id, created_at)
    `
    )
    .in('product_id', productIds.length > 0 ? productIds : ['00000000-0000-0000-0000-000000000000'])

  const typedOrderItems = (orderItems ?? []) as Array<Record<string, unknown>>

  let totalRevenue = 0
  let totalOrders = 0
  const productSales: Record<string, { name: string; units: number }> = {}
  const monthlyRevenue: Record<string, number> = {}
  const buyerOrders: Record<string, number> = {}

  for (const item of typedOrderItems) {
    const totalPrice = Number(item.total_price ?? 0)
    const quantity = Number(item.quantity ?? 0)
    totalRevenue += totalPrice

    const order = item.orders as Record<string, unknown> | null
    if (order) {
      const buyerId = order.buyer_id as string
      buyerOrders[buyerId] = (buyerOrders[buyerId] ?? 0) + 1

      const createdAt = order.created_at as string | null
      if (createdAt) {
        const monthKey = createdAt.slice(0, 7)
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] ?? 0) + totalPrice
      }
    }

    const productId = item.product_id as string
    const product = typedProducts.find((p) => p.id === productId)
    if (product) {
      if (!productSales[productId]) {
        productSales[productId] = { name: product.name as string, units: 0 }
      }
      productSales[productId].units += quantity
    }
  }

  totalOrders = Object.keys(buyerOrders).length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const repeatBuyers = Object.values(buyerOrders).filter((count) => count > 1).length

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.units - a.units)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }))

  const now = new Date()
  const last6Months: Array<{ month: string; revenue: number }> = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    last6Months.push({ month: label, revenue: monthlyRevenue[key] ?? 0 })
  }

  const maxMonthlyRevenue = Math.max(...last6Months.map((m) => m.revenue), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-[#8FBC8F] mt-2">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatPrice(avgOrderValue)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Repeat Buyers</p>
          <p className="text-2xl font-bold text-[#E9C4A6] mt-2">{repeatBuyers}</p>
        </div>
      </div>

      <VendorAnalyticsContent
        topProducts={topProducts}
        monthlyRevenue={last6Months}
        maxRevenue={maxMonthlyRevenue}
      />
    </div>
  )
}
