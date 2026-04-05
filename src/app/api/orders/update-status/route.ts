import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const statusSchema = z.enum([
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

const bodySchema = z.object({
  order_id: z.uuid(),
  status: statusSchema,
});

const statusLabels: Record<string, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parseResult = bodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { order_id, status } = parseResult.data;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile as Record<string, unknown>).role !== "vendor") {
      return NextResponse.json(
        { error: "Forbidden: vendor access required" },
        { status: 403 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select(
        `
        id,
        products:products(id, vendor_id)
      `,
      )
      .eq("order_id", order_id);

    const typedOrderItems = (orderItems ?? []) as Array<
      Record<string, unknown>
    >;

    const ownsProduct = typedOrderItems.some(
      (item: Record<string, unknown>) => {
        const product = item.products as Record<string, unknown> | null;
        return product?.vendor_id === user.id;
      },
    );

    if (!ownsProduct) {
      return NextResponse.json(
        { error: "Forbidden: you do not own any products in this order" },
        { status: 403 },
      );
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order_id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 },
      );
    }

    const statusLabel = statusLabels[status] ?? status;

    await supabase.from("notifications").insert({
      user_id: (order as Record<string, unknown>).buyer_id,
      title: `Order ${statusLabel}`,
      message: `Your order #${order_id.slice(-8).toUpperCase()} has been ${statusLabel}.`,
      type: "order",
      link: "/orders",
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update order status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
