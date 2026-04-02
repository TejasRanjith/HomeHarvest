import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, orderAmount } = body as { code: string; orderAmount: number }

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    const typedCoupon = coupon as Record<string, unknown>

    const now = new Date()
    const validFrom = typedCoupon.valid_from ? new Date(typedCoupon.valid_from as string) : null
    const validUntil = typedCoupon.valid_until ? new Date(typedCoupon.valid_until as string) : null

    if (validFrom && now < validFrom) {
      return NextResponse.json(
        { error: 'Coupon is not yet valid' },
        { status: 400 }
      )
    }

    if (validUntil && now > validUntil) {
      return NextResponse.json(
        { error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    const minOrderAmount = Number(typedCoupon.min_order_amount ?? 0)
    if (orderAmount < minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${minOrderAmount}` },
        { status: 400 }
      )
    }

    const usageLimit = typedCoupon.usage_limit as number | null
    const usedCount = Number(typedCoupon.used_count ?? 0)
    if (usageLimit !== null && usedCount >= usageLimit) {
      return NextResponse.json(
        { error: 'Coupon usage limit reached' },
        { status: 400 }
      )
    }

    const discountType = typedCoupon.discount_type as string
    const discountValue = Number(typedCoupon.discount_value)
    let discount = 0

    if (discountType === 'percentage') {
      discount = (orderAmount * discountValue) / 100
      const maxDiscount = typedCoupon.max_discount_amount
        ? Number(typedCoupon.max_discount_amount)
        : null
      if (maxDiscount !== null && discount > maxDiscount) {
        discount = maxDiscount
      }
    } else {
      discount = discountValue
    }

    await supabase
      .from('coupons')
      .update({ used_count: usedCount + 1 })
      .eq('id', typedCoupon.id)

    return NextResponse.json({
      discount: Math.round(discount * 100) / 100,
      code: typedCoupon.code,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to validate coupon'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
