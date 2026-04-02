'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string | null
}

const categoryIcons: Record<string, string> = {
  'thrissur-chantha-vegetables': '🥬',
  'palakkad-rice-grains': '🍚',
  'nattukozhi-country-chicken': '🐔',
  'nadan-fish': '🐟',
  'home-cooked-sadhya-items': '🍛',
  'dairy-milk': '🥛',
  'fruits': '🍎',
  'spices-condiments': '🌶️',
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
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        <motion.button
          onClick={() => handleCategoryClick(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            !activeCategory
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white text-muted hover:bg-gray-50 border border-border'
          }`}
        >
          <span className="flex items-center gap-2">
            ✨ All
          </span>
        </motion.button>
        
        {categories.map((category, index) => {
          const isActive = activeCategory === category.slug
          const icon = categoryIcons[category.slug] || '🥡'
          
          return (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-muted hover:bg-gray-50 border border-border'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                {category.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-primary rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  )
}