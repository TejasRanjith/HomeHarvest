import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { VendorOrdersContent } from '@/components/vendor-orders-content'

export default async function VendorOrdersPage() {
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

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(id, full_name),
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

  const typedOrders = (orders ?? []) as Array<Record<string, unknown>>

  const vendorOrders = typedOrders.filter((order: Record<string, unknown>) => {
    const orderItems = (order.order_items ?? []) as Array<Record<string, unknown>>
    return orderItems.some((item: Record<string, unknown>) => {
      const product = item.products as Record<string, unknown> | null
      return product?.vendor_id === user.id
    })
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <VendorOrdersContent orders={vendorOrders} vendorId={user.id} />
    </div>
  )
}
