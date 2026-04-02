import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { NewProductForm } from '@/components/new-product-form'

export default async function NewProductPage() {
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

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const typedCategories = (categories ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <NewProductForm categories={typedCategories} vendorId={user.id} />
    </div>
  )
}
