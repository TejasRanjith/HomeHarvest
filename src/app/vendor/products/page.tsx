import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { VendorProductsTable } from '@/components/vendor-products-table'
import Link from 'next/link'

export default async function VendorProductsPage() {
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
    .select(
      `
      id,
      name,
      name_ml,
      price,
      unit,
      stock_quantity,
      is_available,
      image_urls,
      category:categories(id, name)
    `
    )
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })

  const typedProducts = (products ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          href="/vendor/products/new"
          className="bg-[#F0E68C] text-[#5C4033] font-semibold px-4 py-2 rounded-lg hover:bg-[#e6db7a] transition text-sm"
        >
          Add New Product
        </Link>
      </div>

      <VendorProductsTable products={typedProducts} vendorId={user.id} />
    </div>
  )
}
