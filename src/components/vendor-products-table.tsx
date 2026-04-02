'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface VendorProductsTableProps {
  products: Array<Record<string, unknown>>
  vendorId: string
}

export function VendorProductsTable({ products, vendorId }: VendorProductsTableProps) {
  const supabase = createClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editField, setEditField] = useState<'price' | 'stock_quantity' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [localProducts, setLocalProducts] = useState(products)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const startEdit = (id: string, field: 'price' | 'stock_quantity', value: string) => {
    setEditingId(id)
    setEditField(field)
    setEditValue(value)
  }

  const saveEdit = async (id: string) => {
    if (!editField) return

    const value = editField === 'price' ? parseFloat(editValue) : parseInt(editValue, 10)
    if (isNaN(value) || value < 0) {
      toast.error('Invalid value')
      return
    }

    const { error } = await supabase
      .from('products')
      .update({ [editField]: value })
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (error) {
      toast.error('Failed to update')
      return
    }

    setLocalProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [editField]: value } : p))
    )
    toast.success('Updated successfully')
    setEditingId(null)
    setEditField(null)
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !current })
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (error) {
      toast.error('Failed to update availability')
      return
    }

    setLocalProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_available: !current } : p))
    )
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (error) {
      toast.error('Failed to delete product')
      return
    }

    setLocalProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
    toast.success('Product deleted')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Image</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Available</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {localProducts.map((product) => {
              const stockQty = Number(product.stock_quantity ?? 0)
              const isLowStock = stockQty < 5
              const imageUrls = product.image_urls as string[] | null
              const category = product.category as Record<string, unknown> | null

              return (
                <tr
                  key={product.id as string}
                  className={`hover:bg-gray-50/50 ${
                    isLowStock ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={imageUrls?.[0] ?? PLACEHOLDER_IMAGE}
                        alt={product.name as string}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name as string}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(category?.name as string) ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === product.id && editField === 'price' ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(product.id as string)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(product.id as string)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="w-20 px-2 py-1 text-sm border border-[#8FBC8F] rounded outline-none"
                        autoFocus
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <button
                        onClick={() =>
                          startEdit(
                            product.id as string,
                            'price',
                            String(product.price)
                          )
                        }
                        className="text-gray-900 hover:text-[#8FBC8F] transition"
                      >
                        {formatPrice(Number(product.price))}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.unit as string}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === product.id && editField === 'stock_quantity' ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(product.id as string)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(product.id as string)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="w-16 px-2 py-1 text-sm border border-[#8FBC8F] rounded outline-none"
                        autoFocus
                        min="0"
                      />
                    ) : (
                      <button
                        onClick={() =>
                          startEdit(
                            product.id as string,
                            'stock_quantity',
                            String(product.stock_quantity)
                          )
                        }
                        className={`hover:text-[#8FBC8F] transition ${
                          isLowStock ? 'text-amber-600 font-medium' : 'text-gray-900'
                        }`}
                      >
                        {stockQty}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(product.is_available)}
                        onChange={() =>
                          toggleAvailable(
                            product.id as string,
                            Boolean(product.is_available)
                          )
                        }
                        className="w-4 h-4 text-[#8FBC8F] focus:ring-[#8FBC8F] rounded"
                        aria-label={`Toggle availability for ${product.name as string}`}
                      />
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteProduct(product.id as string)}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id as string)}
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {localProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No products yet. Add your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
