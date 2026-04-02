'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface ProfileFormProps {
  profile: Record<string, unknown>
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState((profile.full_name as string) ?? '')
  const [phone, setPhone] = useState((profile.phone as string) ?? '')
  const [address, setAddress] = useState((profile.address as string) ?? '')
  const [preferredLanguage, setPreferredLanguage] = useState(
    (profile.preferred_language as string) ?? 'en'
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        preferred_language: preferredLanguage,
      })
      .eq('id', profile.id as string)

    if (error) {
      toast.error('Failed to update profile')
      setIsSaving(false)
      return
    }

    toast.success('Profile updated!')
    setIsSaving(false)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSave()
      }}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
          placeholder="9876543210"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition resize-none"
          placeholder="Enter your full delivery address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Language
        </label>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition"
        >
          <option value="en">English</option>
          <option value="ml">Malayalam (മലയാളം)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#F0E68C] text-[#5C4033] font-semibold py-3 rounded-lg hover:bg-[#e6db7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
