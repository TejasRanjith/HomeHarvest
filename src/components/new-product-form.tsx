'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_ml: z.string().optional(),
  description: z.string().optional(),
  description_ml: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  unit: z.enum(['kg', 'g', 'litre', 'piece', 'dozen', 'bundle']),
  stock_quantity: z.coerce.number().int().nonnegative('Stock cannot be negative'),
})

interface NewProductFormProps {
  categories: Array<Record<string, unknown>>
  vendorId: string
}

export function NewProductForm({ categories, vendorId }: NewProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    name_ml: '',
    description: '',
    description_ml: '',
    category_id: '',
    price: '',
    unit: 'kg' as string,
    stock_quantity: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4)
    setImageFiles(files)
    const previews = files.map((f) => URL.createObjectURL(f))
    setImagePreviews(previews)
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of imageFiles) {
      const fileName = `${vendorId}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl)
      }
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = productSchema.safeParse({
      name: formData.name,
      name_ml: formData.name_ml || undefined,
      description: formData.description || undefined,
      description_ml: formData.description_ml || undefined,
      category_id: formData.category_id,
      price: formData.price,
      unit: formData.unit,
      stock_quantity: formData.stock_quantity,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of result.error.issues) {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const imageUrls = await uploadImages()

      const { error } = await supabase.from('products').insert({
        vendor_id: vendorId,
        category_id: formData.category_id,
        name: formData.name,
        name_ml: formData.name_ml || null,
        description: formData.description || null,
        description_ml: formData.description_ml || null,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock_quantity: parseInt(formData.stock_quantity, 10),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        is_available: true,
      })

      if (error) {
        toast.error('Failed to create product')
        setIsSubmitting(false)
        return
      }

      toast.success('Product listed!')
      router.push('/vendor/products')
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name (English) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            } focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition`}
            placeholder="e.g., Fresh Tomatoes"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name (Malayalam)
          </label>
          <input
            type="text"
            value={formData.name_ml}
            onChange={(e) => updateField('name_ml', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
            placeholder="ഉദാ: തക്കാളി"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (English)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition resize-none"
          placeholder="Describe your product..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Malayalam)
        </label>
        <textarea
          value={formData.description_ml}
          onChange={(e) => updateField('description_ml', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition resize-none"
          placeholder="ഉൽപ്പന്ന വിവരണം..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => updateField('category_id', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.category_id ? 'border-red-500' : 'border-gray-200'
            } focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition`}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id as string} value={cat.id as string}>
                {cat.name as string}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateField('price', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.price ? 'border-red-500' : 'border-gray-200'
            } focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => updateField('unit', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="litre">litre</option>
            <option value="piece">piece</option>
            <option value="dozen">dozen</option>
            <option value="bundle">bundle</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity *
        </label>
        <input
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => updateField('stock_quantity', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.stock_quantity ? 'border-red-500' : 'border-gray-200'
          } focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition`}
          placeholder="0"
          min="0"
        />
        {errors.stock_quantity && (
          <p className="mt-1 text-sm text-red-500">{errors.stock_quantity}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images (up to 4)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8FBC8F] file:text-white hover:file:bg-[#7daa7d] cursor-pointer"
        />
        {imagePreviews.length > 0 && (
          <div className="flex gap-3 mt-3">
            {imagePreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Listing...' : 'List Product'}
      </button>
    </form>
  )
}
