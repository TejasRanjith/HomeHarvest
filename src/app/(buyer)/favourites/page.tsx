import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'

export default async function FavouritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: favourites } = await supabase
    .from('favourites')
    .select(
      `
      product_id,
      products:products(
        *,
        vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified)
      )
    `
    )
    .eq('user_id', user.id)

  const typedFavourites = (favourites ?? []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Favourites</h1>

      {typedFavourites.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No saved items yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Tap the heart on any product to save it
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[#8FBC8F] hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {typedFavourites.map((fav) => {
            const product = fav.products as Record<string, unknown> | null
            if (!product) return null

            const vendor = product.vendor as Record<string, unknown> | null

            return (
              <ProductCard
                key={fav.product_id as string}
                product={{
                  id: product.id as string,
                  vendor_id: product.vendor_id as string,
                  category_id: product.category_id as string,
                  name: product.name as string,
                  name_ml: product.name_ml as string | null,
                  description: product.description as string | null,
                  image_urls: product.image_urls as string[] | null,
                  price: Number(product.price),
                  unit: product.unit as string,
                  stock_quantity: Number(product.stock_quantity),
                  min_order_quantity: Number(product.min_order_quantity),
                  is_available: Boolean(product.is_available),
                  is_featured: Boolean(product.is_featured),
                  created_at: product.created_at as string,
                  updated_at: product.updated_at as string,
                  vendor: vendor
                    ? {
                        id: vendor.id as string,
                        full_name: vendor.full_name as string,
                        vendor_name: vendor.vendor_name as string | null,
                        vendor_verified: Boolean(vendor.vendor_verified),
                      }
                    : null,
                }}
                isFavourited
                showFavourite
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
