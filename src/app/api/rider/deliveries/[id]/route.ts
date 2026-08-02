import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riders, orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "rider") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rider] = await db
    .select()
    .from(riders)
    .where(eq(riders.userId, parseInt(session.user.id)))
    .limit(1);

  if (!rider) {
    return NextResponse.json({ error: "Rider not found" }, { status: 404 });
  }

  const { id } = await params;
  const orderId = parseInt(id);

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.riderId !== rider.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { action } = await request.json();

  if (action === "pickup") {
    await db
      .update(orders)
      .set({ pickedUpAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ success: true });
  }

  if (action === "deliver") {
    await db
      .update(orders)
      .set({ deliveredAt: new Date(), status: "delivered" })
      .where(eq(orders.id, orderId));

    await db
      .update(riders)
      .set({ totalDeliveries: sql`${riders.totalDeliveries} + 1` })
      .where(eq(riders.id, rider.id));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
