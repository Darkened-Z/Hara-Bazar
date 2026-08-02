import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, users, products } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allSellers = await db
    .select({
      id: sellers.id,
      storeName: sellers.storeName,
      city: sellers.city,
      status: sellers.status,
      createdAt: sellers.createdAt,
      ownerName: users.name,
      ownerPhone: users.phone,
    })
    .from(sellers)
    .innerJoin(users, eq(sellers.userId, users.id))
    .orderBy(desc(sellers.createdAt));

  const sellersWithProducts = await Promise.all(
    allSellers.map(async (seller) => {
      const [productCount] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.sellerId, seller.id));
      return { ...seller, productsCount: productCount.count };
    })
  );

  return NextResponse.json(sellersWithProducts);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();

  await db.update(sellers).set({ status }).where(eq(sellers.id, id));

  return NextResponse.json({ success: true });
}
