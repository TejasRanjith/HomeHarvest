import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { DisputesTable } from '@/components/disputes-table'

export default async function AdminDisputesPage() {
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

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      payment_status,
      total_amount,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(full_name)
    `
    )
    .or('status.eq.cancelled,payment_status.eq.failed,payment_status.eq.refunded')
    .order('created_at', { ascending: false })

  const typedOrders = (orders ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Disputes & Refunds</h1>
      <DisputesTable orders={typedOrders} />
    </div>
  )
}
