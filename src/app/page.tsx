import { createClient } from '@/lib/supabase-server'
import { ProductWithVendor } from '@/types'
import { SearchBar } from '@/components/search-bar'
import { CategoryFilter } from '@/components/category-filter'
import { PriceFilter } from '@/components/price-filter'
import { AnimatedProductGrid } from '@/components/animated-product-grid'
import { HeroSection } from '@/components/hero-section'

const PRODUCTS_PER_PAGE = 12

interface HomePageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    min_price?: string
    max_price?: string
    page?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams

  let categories: import('@/types').Category[] = []
  let products: ProductWithVendor[] = []
  let totalPages = 1
  let page = 1

  try {
    const supabase = await createClient()

    const { data: cats } = await supabase
      .from('categories')
      .select('id, name, name_ml, slug, is_active, description, image_url, sort_order, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    categories = (cats ?? []) as unknown as import('@/types').Category[]

    page = parseInt(params.page ?? '1', 10)
    const from = (page - 1) * PRODUCTS_PER_PAGE
    const to = from + PRODUCTS_PER_PAGE - 1

    let query = supabase
      .from('products')
      .select(
        `
        *,
        vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified)
      `,
        { count: 'exact' }
      )
      .eq('is_available', true)

    if (params.search) {
      const q = params.search.trim()
      query = query.or(`name.ilike.%${q}%,name_ml.ilike.%${q}%`)
    }

    if (params.category) {
      query = query.eq('category_id', params.category)
    }

    if (params.min_price) {
      query = query.gte('price', parseFloat(params.min_price))
    }

    if (params.max_price) {
      query = query.lte('price', parseFloat(params.max_price))
    }

    const { data: prods, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    products = (prods ?? []) as ProductWithVendor[]
    totalPages = count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 1
  } catch {
    categories = []
    products = []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <HeroSection />

      <div className="space-y-4 mb-8">
        <SearchBar initialValue={params.search ?? ''} />
        <CategoryFilter
          categories={categories}
          activeCategory={params.category ?? null}
        />
        <PriceFilter
          minPrice={params.min_price ?? ''}
          maxPrice={params.max_price ?? ''}
        />
      </div>

      <AnimatedProductGrid products={products} />

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
