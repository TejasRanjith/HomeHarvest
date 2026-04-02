import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { CheckoutForm } from '@/components/checkout-form'

export default async function CheckoutPage() {
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

  const { data: deliverySlots } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_available', true)
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <CheckoutForm
        profile={profile}
        deliverySlots={deliverySlots ?? []}
      />
    </div>
  )
}
