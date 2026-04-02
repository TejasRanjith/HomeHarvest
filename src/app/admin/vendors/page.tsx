import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { VendorManagementTable } from '@/components/vendor-management-table'

export default async function AdminVendorsPage() {
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

  const { data: vendors } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      vendor_name,
      kyc_status,
      vendor_verified,
      created_at,
      products:products(count),
      orders:order_items!order_items_product_id_fkey(orders(buyer_id))
    `
    )
    .eq('role', 'vendor')
    .order('created_at', { ascending: false })

  const typedVendors = (vendors ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Management</h1>
      <VendorManagementTable vendors={typedVendors} />
    </div>
  )
}
