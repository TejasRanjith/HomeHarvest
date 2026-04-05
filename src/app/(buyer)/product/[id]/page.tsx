import { createClient } from "@/lib/supabase-server";
import { ProductWithVendor, ReviewWithUser } from "@/types";
import { AddToCartSection } from "@/components/add-to-cart-section";
import { StarRating } from "@/components/star-rating";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
      *,
      vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified, phone)
    `,
    )
    .eq("id", id)
    .single();

  if (productError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/" className="text-[#8FBC8F] mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const typedProduct = product as unknown as ProductWithVendor & {
    vendor: {
      id: string;
      full_name: string;
      vendor_name: string | null;
      vendor_verified: boolean;
      phone: string | null;
    } | null;
  };

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user:profiles!reviews_user_id_fkey(id, full_name)
    `,
    )
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  const typedReviews = (reviews ?? []) as unknown as ReviewWithUser[];

  const { data: relatedProducts } = await supabase
    .from("products")
    .select(
      `
      *,
      vendor:profiles!products_vendor_id_fkey(id, full_name, vendor_name, vendor_verified)
    `,
    )
    .eq("category_id", typedProduct.category_id)
    .neq("id", id)
    .limit(4);

  const typedRelatedProducts = (relatedProducts ??
    []) as unknown as ProductWithVendor[];

  const images = typedProduct.image_urls?.filter(Boolean) ?? [];

  const isInStock =
    typedProduct.is_available && typedProduct.stock_quantity > 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Link
          href="/"
          className="text-[#8FBC8F] hover:underline inline-flex items-center gap-1 mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to shop
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
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
          <h1 className="text-2xl font-bold text-gray-900">
            {typedProduct.name}
          </h1>
          {typedProduct.name_ml && (
            <p className="text-gray-500 mt-1">{typedProduct.name_ml}</p>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#8FBC8F]">
              {formatPrice(Number(typedProduct.price))}
            </span>
            <span className="text-gray-500">/{typedProduct.unit}</span>
          </div>

          <div className="mt-4">
            {isInStock ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
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
                  {(typedProduct.vendor.full_name ?? "V")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {typedProduct.vendor.vendor_name ??
                      typedProduct.vendor.full_name}
                  </p>
                  {typedProduct.vendor.vendor_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#8FBC8F] font-medium">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Vendor
                    </span>
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
      </motion.div>

      <motion.div variants={itemVariants} className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
          <button
            className="px-4 py-2 bg-[#F0E68C] text-[#5C4033] text-sm font-medium rounded-lg hover:bg-[#e6db7a] transition"
            aria-label="Write a review"
          >
            Write a Review
          </button>
        </div>

        {typedReviews.length > 0 ? (
          <div className="space-y-4">
            {typedReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-2xl border border-gray-100 bg-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E9C4A6] flex items-center justify-center text-[#5C4033] text-sm font-medium">
                    {(review.user?.full_name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.user?.full_name ?? "Anonymous"}
                    </p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </motion.div>

      {typedRelatedProducts.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typedRelatedProducts.map((relatedProduct) => {
              const relatedImages =
                relatedProduct.image_urls?.filter(Boolean) ?? [];
              return (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="group rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden hover:shadow-md transition"
                >
                  <div className="relative w-full aspect-square bg-gray-100">
                    {relatedImages.length > 0 ? (
                      <Image
                        src={relatedImages[0]}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Image
                        src={PLACEHOLDER_IMAGE}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#8FBC8F] mt-1">
                      {formatPrice(Number(relatedProduct.price))}
                      <span className="text-gray-500 font-normal">
                        /{relatedProduct.unit}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
