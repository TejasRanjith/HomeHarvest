'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function LanguageToggle() {
  const router = useRouter()

  const toggleLanguage = useCallback(() => {
    const current = document.cookie
      .split('; ')
      .find((row) => row.startsWith('hh_lang='))
      ?.split('=')[1]

    const next = current === 'ml' ? 'en' : 'ml'
    document.cookie = `hh_lang=${next}; path=/; max-age=31536000`
    router.refresh()
  }, [router])

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm px-3 py-1 rounded-md bg-[#E9C4A6] text-[#5C4033] hover:bg-[#d4b08f] transition"
      aria-label="Toggle language"
    >
      EN / മലയാളം
    </button>
  )
}
