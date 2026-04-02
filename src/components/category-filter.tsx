'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
          !activeCategory
            ? 'bg-[#8FBC8F] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.slug)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCategory === category.slug
              ? 'bg-[#8FBC8F] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
