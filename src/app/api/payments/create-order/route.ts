import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRazorpayInstance } from '@/lib/razorpay'

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

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
    const { amount, receipt } = body as { amount: number; receipt: string }

    const sanitizedReceipt = sanitize(String(receipt ?? ''))

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const razorpay = getRazorpayInstance()

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: sanitizedReceipt,
    })

    return NextResponse.json(order)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
