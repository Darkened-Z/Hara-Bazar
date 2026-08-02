import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riders, orders } from "@/lib/db/schema";
import { eq, count, sql, and, isNull, ne } from "drizzle-orm";

export async function GET() {
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

  const [todayStats] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      sql`${orders.riderId} = ${rider.id} AND ${orders.deliveredAt}::date = CURRENT_DATE`
    );

  const [available] = await db
    .select({ count: count() })
    .from(orders)
    .where(and(eq(orders.status, "shipped"), isNull(orders.riderId)));

  const [active] = await db
    .select({ count: count() })
    .from(orders)
    .where(and(eq(orders.riderId, rider.id), ne(orders.status, "delivered")));

  return NextResponse.json({
    totalDeliveries: rider.totalDeliveries,
    todayDeliveries: todayStats.count || 0,
    availableOrders: available.count || 0,
    activeDeliveries: active.count || 0,
  });
}
