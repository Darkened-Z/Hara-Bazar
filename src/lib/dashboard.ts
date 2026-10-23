import { and, count, desc, eq, gte, lte, ne, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, products, sellers, users } from "@/lib/db/schema";

const DAYS = 14;

export async function dailyRevenue(scope?: SQL) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));
  const day = sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`;
  const rows = await db
    .select({ day, total: sql<number>`coalesce(sum(${orders.total}), 0)::int`, orders: count() })
    .from(orders)
    .where(and(scope, ne(orders.status, "cancelled"), gte(orders.createdAt, since)))
    .groupBy(day);
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { day: key, total: Number(byDay.get(key)?.total ?? 0), orders: Number(byDay.get(key)?.orders ?? 0) };
  });
}

export async function statusCounts(scope?: SQL) {
  const rows = await db.select({ status: orders.status, n: count() }).from(orders).where(scope).groupBy(orders.status);
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)])) as Record<string, number>;
}

export async function recentOrders(scope?: SQL, limit = 6) {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customer: users.name,
      store: sellers.storeName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(sellers, eq(orders.sellerId, sellers.id))
    .where(scope)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function topProducts(sellerId?: number, limit = 5) {
  const units = sql<number>`sum(${orderItems.quantity})::int`;
  return db
    .select({ name: orderItems.productName, units, revenue: sql<number>`sum(${orderItems.totalPrice})::int` })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.status, "delivered"), sellerId ? eq(orders.sellerId, sellerId) : undefined))
    .groupBy(orderItems.productName)
    .orderBy(desc(units))
    .limit(limit);
}

export async function topSellers(limit = 5) {
  const revenue = sql<number>`coalesce(sum(${orders.total}), 0)::int`;
  return db
    .select({ store: sellers.storeName, orders: count(), revenue })
    .from(sellers)
    .innerJoin(orders, and(eq(orders.sellerId, sellers.id), eq(orders.status, "delivered")))
    .groupBy(sellers.storeName)
    .orderBy(desc(revenue))
    .limit(limit);
}

export async function lowStock(sellerId: number, threshold = 10) {
  return db
    .select({ name: products.name, stock: products.stock })
    .from(products)
    .where(and(eq(products.sellerId, sellerId), lte(products.stock, threshold)))
    .orderBy(products.stock);
}
