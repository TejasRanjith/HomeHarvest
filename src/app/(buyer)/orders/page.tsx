import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { OrderSuccessBanner } from '@/components/order-success-banner'
import { OrderCard } from '@/components/order-card'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items:order_items(
        id,
        quantity,
        unit_price,
        total_price,
        product_id,
        products:products(id, name, image_urls)
      )
    `
    )
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', user.id)

  const reviewedProductIds = new Set(
    (reviews ?? []).map((r: Record<string, unknown>) => r.product_id as string)
  )

  const typedOrders = (orders ?? []) as Array<Record<string, unknown>>
  const params = await searchParams
  const showSuccess = params.success === 'true'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {showSuccess && <OrderSuccessBanner />}

      {typedOrders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No orders yet</p>
          <Link
            href="/"
            className="mt-4 inline-block text-[#8FBC8F] hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {typedOrders.map((order) => (
            <OrderCard
              key={order.id as string}
              order={order}
              existingReviewProductIds={reviewedProductIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
