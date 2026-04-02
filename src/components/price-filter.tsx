'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface PriceFilterProps {
  minPrice: string
  maxPrice: string
}

export function PriceFilter({ minPrice, maxPrice }: PriceFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateUrl = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (min) {
        params.set('min_price', min)
      } else {
        params.delete('min_price')
      }
      if (max) {
        params.set('max_price', max)
      } else {
        params.delete('max_price')
      }
      params.delete('page')
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleBlur = (field: 'min' | 'max', value: string) => {
    const min = field === 'min' ? value : minPrice
    const max = field === 'max' ? value : maxPrice
    updateUrl(min, max)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600">Price:</label>
      <input
        type="number"
        defaultValue={minPrice}
        placeholder="Min"
        onBlur={(e) => handleBlur('min', e.target.value)}
        className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
        aria-label="Minimum price"
        min="0"
      />
      <span className="text-gray-400">—</span>
      <input
        type="number"
        defaultValue={maxPrice}
        placeholder="Max"
        onBlur={(e) => handleBlur('max', e.target.value)}
        className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
        aria-label="Maximum price"
        min="0"
      />
    </div>
  )
}
