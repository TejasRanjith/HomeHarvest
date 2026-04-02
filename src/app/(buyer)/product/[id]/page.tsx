import { createClient } from '@/lib/supabase-server'
import { ProductWithVendor, ReviewWithUser } from '@/types'
import { AddToCartSection } from '@/components/add-to-cart-section'
import Image from 'next/image'
import Link from 'next/link'

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      `
      *,
      vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified, phone)
    `
    )
    .eq('id', id)
    .single()

  if (productError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/" className="text-[#8FBC8F] mt-4 inline-block">
          Back to products
        </Link>
      </div>
    )
  }

  const typedProduct = product as unknown as ProductWithVendor & {
    vendor: { id: string; full_name: string; vendor_name: string | null; vendor_verified: boolean; phone: string | null } | null
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      *,
      user:profiles!reviews_user_id_fkey(id, full_name)
    `
    )
    .eq('product_id', id)
    .order('created_at', { ascending: false })

  const typedReviews = (reviews ?? []) as unknown as ReviewWithUser[]

  const images = typedProduct.image_urls?.filter(Boolean) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={images[0]}
                  alt={typedProduct.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(1).map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={img}
                        alt={`${typedProduct.name} ${idx + 2}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={PLACEHOLDER_IMAGE}
                alt={typedProduct.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{typedProduct.name}</h1>
          {typedProduct.name_ml && (
            <p className="text-gray-500 mt-1">{typedProduct.name_ml}</p>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#8FBC8F]">
              {formatPrice(Number(typedProduct.price))}
            </span>
            <span className="text-gray-500">/{typedProduct.unit}</span>
          </div>

          {typedProduct.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Description
              </h2>
              <p className="mt-2 text-gray-600">{typedProduct.description}</p>
            </div>
          )}

          <div className="mt-6">
            <AddToCartSection
              product={{
                product_id: typedProduct.id,
                name: typedProduct.name,
                price: Number(typedProduct.price),
                image_url: images[0] ?? null,
                unit: typedProduct.unit,
                min_order_quantity: typedProduct.min_order_quantity,
                stock_quantity: typedProduct.stock_quantity,
                is_available: typedProduct.is_available,
              }}
            />
          </div>

          {typedProduct.vendor && (
            <div className="mt-8 p-4 rounded-2xl border border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Vendor
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8FBC8F] flex items-center justify-center text-white font-medium">
                  {(typedProduct.vendor.full_name ?? 'V').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {typedProduct.vendor.vendor_name ?? typedProduct.vendor.full_name}
                  </p>
                  {typedProduct.vendor.vendor_verified && (
                    <span className="text-xs text-[#8FBC8F] font-medium">Verified Vendor</span>
                  )}
                </div>
              </div>
              {typedProduct.vendor.phone && (
                <a
                  href={`tel:${typedProduct.vendor.phone}`}
                  className="mt-3 inline-block text-sm text-[#8FBC8F] hover:underline"
                >
                  Contact Vendor
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {typedReviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
          <div className="space-y-4">
            {typedReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-2xl border border-gray-100 bg-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E9C4A6] flex items-center justify-center text-[#5C4033] text-sm font-medium">
                    {(review.user?.full_name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.user?.full_name ?? 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
