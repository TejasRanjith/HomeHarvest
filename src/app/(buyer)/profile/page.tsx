import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { ProfileForm } from '@/components/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const typedProfile = profile as Record<string, unknown>

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('buyer_id', user.id)

  const typedOrders = (orders ?? []) as Array<Record<string, unknown>>
  const totalOrders = typedOrders.length
  const totalSpent = typedOrders.reduce(
    (sum: number, o: Record<string, unknown>) => sum + Number(o.total_amount ?? 0),
    0
  )
  const memberSince = typedProfile.created_at
    ? new Date(typedProfile.created_at as string).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#8FBC8F] flex items-center justify-center text-white text-2xl font-bold">
            {(typedProfile.full_name as string)?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {typedProfile.full_name as string}
            </h2>
            <p className="text-sm text-gray-500">Member since {memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#8FBC8F]">{totalOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-[#8FBC8F]">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(totalSpent)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#8FBC8F] capitalize">
              {typedProfile.role as string}
            </p>
            <p className="text-xs text-gray-500 mt-1">Account Type</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Edit Profile
        </h2>
        <ProfileForm profile={typedProfile} />
      </div>
    </div>
  )
}
