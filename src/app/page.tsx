import { HeroSection } from '@/components/hero-section'
import { SearchBar } from '@/components/search-bar'
import { CategoryFilter } from '@/components/category-filter'
import { PriceFilter } from '@/components/price-filter'
import { createClient } from '@/lib/supabase-server'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    min_price?: string
    max_price?: string
    page?: string
  }>
}) {
  const params = await searchParams

  // Try to fetch data, but gracefully handle failures
  let categories: unknown[] = []
  let products: unknown[] = []
  let totalPages = 1
  let page = 1

  try {
    const supabase = await createClient()
    
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
    
    categories = cats ?? []

    page = parseInt(params.page ?? '1', 10)
    const from = (page - 1) * 12
    const to = from + 11

    const { data: prods, count } = await supabase
      .from('products')
      .select('*, vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified)', { count: 'exact' })
      .eq('is_available', true)
      .range(from, to)

    products = prods ?? []
    totalPages = count ? Math.ceil(count / 12) : 1
  } catch {
    // Silently fail - page will show empty state
    categories = []
    products = []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <HeroSection />

      <div className="space-y-4 mb-8">
        <SearchBar initialValue={params.search ?? ''} />
        <CategoryFilter
          categories={categories as never}
          activeCategory={params.category ?? null}
        />
        <PriceFilter
          minPrice={params.min_price ?? ''}
          maxPrice={params.max_price ?? ''}
        />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: { id: string }) => (
            <div key={product.id} className="rounded-2xl border p-4">
              Product: {product.id}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
