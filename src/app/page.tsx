import { createClient } from '@/lib/supabase-server'
import { ProductWithVendor } from '@/types'
import { SearchBar } from '@/components/search-bar'
import { CategoryFilter } from '@/components/category-filter'
import { PriceFilter } from '@/components/price-filter'
import { AnimatedProductGrid } from '@/components/animated-product-grid'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
  const supabase = await createClient()

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, name_ml, slug, is_active, description, image_url, sort_order, created_at')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  const typedCategories = (categories ?? []) as unknown as import('@/types').Category[]

  const page = parseInt(params.page ?? '1', 10)
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

  const { data: products, error: productsError, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  const totalPages = count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">
          Fresh from Thrissur Farms
        </h1>
        <p className="text-gray-600 text-lg">
          Local produce, delivered to your door
        </p>
        <Link
          href="/register"
          className="inline-block mt-4 bg-cta-yellow text-cta-text px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
        >
          Get Started
        </Link>
      </motion.div>

      <div className="space-y-4 mb-8">
        <SearchBar initialValue={params.search ?? ''} />
        <CategoryFilter
          categories={typedCategories}
          activeCategory={params.category ?? null}
        />
        <PriceFilter
          minPrice={params.min_price ?? ''}
          maxPrice={params.max_price ?? ''}
        />
      </div>

      {products && products.length > 0 ? (
        <>
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
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
