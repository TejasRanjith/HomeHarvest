'use client'

import { useSearchParams } from 'next/navigation'

export function OrderSuccessBanner() {
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get('success') === 'true'

  if (!showSuccess) return null

  return (
    <div className="mb-6 p-4 rounded-xl bg-[#8FBC8F]/10 border border-[#8FBC8F]/20">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-[#8FBC8F] flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-[#8FBC8F]">
          Order placed successfully! We&apos;ll notify you when it&apos;s confirmed.
        </p>
      </div>
    </div>
  )
}
