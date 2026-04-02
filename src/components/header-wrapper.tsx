'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/header'

export default function HeaderWrapper() {
  const [user, setUser] = useState<{
    id: string
    email?: string
    user_metadata?: { full_name?: string }
  } | null>(null)
  const [profile, setProfile] = useState<{
    full_name: string | null
    role: string | null
    vendor_name: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser(authUser as typeof user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role, vendor_name')
          .eq('id', authUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return <Header user={user} profile={profile} />
}