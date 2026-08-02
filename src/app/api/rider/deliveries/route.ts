import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riders, orders, users, sellers } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

  const type = request.nextUrl.searchParams.get("type") || "available";

  if (type === "available") {
    const available = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        deliveryAddress: orders.deliveryAddress,
        customerName: users.name,
        storeName: sellers.storeName,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(sellers, eq(orders.sellerId, sellers.id))
      .where(and(eq(orders.status, "shipped"), isNull(orders.riderId)))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(available);
  }

  const mine = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      deliveryAddress: orders.deliveryAddress,
      customerName: users.name,
      storeName: sellers.storeName,
      pickedUpAt: orders.pickedUpAt,
      deliveredAt: orders.deliveredAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(sellers, eq(orders.sellerId, sellers.id))
    .where(eq(orders.riderId, rider.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(mine);
}

export async function POST(request: NextRequest) {
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

  const { orderId } = await request.json();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "shipped" || order.riderId !== null) {
    return NextResponse.json({ error: "Order not available" }, { status: 400 });
  }

  await db
    .update(orders)
    .set({ riderId: rider.id })
    .where(eq(orders.id, orderId));

  return NextResponse.json({ success: true });
}
