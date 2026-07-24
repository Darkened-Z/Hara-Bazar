import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, orders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [seller] = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, parseInt(session.user.id)))
    .limit(1);

  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const sellerOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      customerName: users.name,
      customerPhone: users.phone,
      deliveryAddress: orders.deliveryAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.sellerId, seller.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(sellerOrders);
}
