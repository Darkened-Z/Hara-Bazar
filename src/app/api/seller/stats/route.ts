import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, orders, products } from "@/lib/db/schema";
import { eq, sum, count, sql } from "drizzle-orm";

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

  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const [orderStats] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sum(orders.total),
    })
    .from(orders)
    .where(eq(orders.sellerId, seller.id));

  const [productStats] = await db
    .select({ totalProducts: count() })
    .from(products)
    .where(eq(products.sellerId, seller.id));

  const [pendingOrders] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.sellerId} = ${seller.id} AND ${orders.status} IN ('pending', 'confirmed')`);

  return NextResponse.json({
    sellerId: seller.id,
    storeName: seller.storeName,
    totalOrders: orderStats.totalOrders || 0,
    totalRevenue: Number(orderStats.totalRevenue) || 0,
    totalProducts: productStats.totalProducts || 0,
    pendingOrders: pendingOrders.count || 0,
  });
}
