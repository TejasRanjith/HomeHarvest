import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { optimiseDelivery } from "@/lib/ai-delivery";
import { z } from "zod";

const orderSchema = z.object({
  orderId: z.string(),
  address: z.string(),
  area: z.string(),
  items: z.number(),
});

const bodySchema = z.object({
  orders: z.array(orderSchema),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Failed to verify user role" },
        { status: 403 },
      );
    }

    if (profile.role !== "vendor" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: vendors and admins only" },
        { status: 403 },
      );
    }

    const json = (await request.json()) as unknown;
    const parseResult = bodySchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { orders } = parseResult.data;

    const result = await optimiseDelivery(orders, []);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to optimise delivery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
