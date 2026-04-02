'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProps {
  initialValue: string
}

export function SearchBar({ initialValue }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  const updateUrl = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  useEffect(() => {
    if (debouncedValue !== initialValue) {
      updateUrl(debouncedValue)
    }
  }, [debouncedValue, initialValue, updateUrl])

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products / ഉൽപ്പന്നങ്ങൾ തിരയുക"
        className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition text-sm"
        aria-label="Search products"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}
