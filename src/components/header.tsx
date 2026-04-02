import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { CartDrawer } from '@/components/cart-drawer'
import { LanguageToggle } from '@/components/language-toggle'

export default async function Header() {
  await cookies()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, vendor_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-[#8FBC8F]">
            HomeHarvest
          </Link>

          <div className="flex items-center gap-4">
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <CartDrawer />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8FBC8F] flex items-center justify-center text-white text-sm font-medium">
                    {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700">
                    {profile?.full_name}
                  </span>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CartDrawer />
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-[#8FBC8F] transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-[#F0E68C] text-[#5C4033] px-4 py-2 rounded-lg font-medium hover:bg-[#e6db7a] transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
