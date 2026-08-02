import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, sellers, riders, orders, products } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userCount] = await db.select({ total: count() }).from(users);
  const [sellerCount] = await db.select({ total: count() }).from(sellers);
  const [riderCount] = await db.select({ total: count() }).from(riders);
  const [orderStats] = await db.select({ total: count(), revenue: sum(orders.total) }).from(orders);
  const [productCount] = await db.select({ total: count() }).from(products).where(eq(products.status, "active"));

  return NextResponse.json({
    totalUsers: userCount.total,
    totalSellers: sellerCount.total,
    totalRiders: riderCount.total,
    totalOrders: orderStats.total,
    totalRevenue: Number(orderStats.revenue) || 0,
    activeProducts: productCount.total,
  });
}
