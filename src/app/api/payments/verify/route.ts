import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase-server'

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

interface OrderItemData {
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderData {
  address: string
  delivery_slot_id: string | null
  coupon_code: string | null
  discount_amount: number
  items: OrderItemData[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data,
    } = body as {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      order_data: OrderData
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    const generatedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subtotal = order_data.items.reduce(
      (sum: number, item: OrderItemData) => sum + item.total_price,
      0
    )
    const deliveryFee = 0
    const totalAmount = subtotal + deliveryFee - order_data.discount_amount

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: order_data.discount_amount,
        total_amount: totalAmount,
        delivery_address: sanitize(order_data.address),
        delivery_slot_id: order_data.delivery_slot_id,
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const orderItemsToInsert = order_data.items.map((item: OrderItemData) => ({
      order_id: (order as Record<string, unknown>).id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    for (const item of order_data.items) {
      const { data: productData } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()

      if (productData) {
        const currentStock = Number((productData as Record<string, unknown>).stock_quantity)
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, currentStock - item.quantity) })
          .eq('id', item.product_id)
      }
    }

    return NextResponse.json({
      success: true,
      order_id: (order as Record<string, unknown>).id,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Payment verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
