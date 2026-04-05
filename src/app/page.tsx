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

  const featured = products.slice(0, 5)
  const bestSellers = products.slice(5, 8)
  const trending = products.slice(8, 13)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <HeroSection />

      <div className="space-y-4 mb-12 mt-8">
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

      {params.search || params.category ? (
        // Search Mode
        <AnimatedProductGrid products={products} />
      ) : (
        // Homepage Dashboard Mode
        <div className="space-y-16">
          {/* Featured Products */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Featured Products</h2>
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-[var(--primary)] font-semibold uppercase tracking-wider">Scroll →</span>
              </div>
              <AnimatedProductGrid products={featured} />
            </section>
          )}

          {/* Promo Banner Mid */}
          <div className="w-full bg-gradient-to-r from-[#d8b4e2] to-[#bca0dc] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-md">
             <div className="text-white">
                <p className="text-sm font-semibold uppercase tracking-widest mb-1">From Local Farms to Your Kitchen</p>
                <h3 className="text-2xl md:text-3xl font-bold">Experience the best of Kerala's organic produce</h3>
             </div>
             <div className="text-xl md:text-2xl font-extrabold text-[#7e57c2] mt-4 md:mt-0 drop-shadow-sm bg-white/20 px-6 py-3 rounded-full">
                Freshness Guaranteed
             </div>
          </div>

          {/* Best Sellers Grid Component Map (Reused AnimatedGrid) */}
          {bestSellers.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Best Sellers</h2>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <AnimatedProductGrid products={bestSellers} />
            </section>
          )}

          {/* Trending Products */}
          {trending.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Trending Products</h2>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <AnimatedProductGrid products={trending} />
            </section>
          )}

          {/* Bottom Banner */}
          <div className="w-full bg-gradient-to-br from-pink-200 to-pink-300 rounded-3xl p-8 shadow-md relative overflow-hidden flex items-center min-h-[200px]">
             <div className="relative z-10 w-full md:w-1/2">
                <span className="px-3 py-1 bg-white rounded-full text-[var(--foreground)] text-xs font-bold mb-4 inline-block shadow-sm">Fresh Harvest</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] mb-2 leading-tight">Supporting our local farmers</h2>
                <p className="text-gray-700 mb-6 font-medium">Hyperlocal farm-to-home marketplace.</p>
                <button className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow hover:shadow-md transition">Explore Produce →</button>
             </div>
             <div className="absolute top-0 right-0 w-1/2 h-full opacity-50 md:opacity-100 bg-cover bg-center mix-blend-multiply" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")'}}></div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {page > 1 && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              }).toString()}`}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm hover:bg-gray-50 transition shadow-sm"
            >
              Previous
            </a>
          )}
          <span className="text-sm font-semibold text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              }).toString()}`}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm hover:bg-gray-50 transition shadow-sm"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
