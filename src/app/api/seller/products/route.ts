import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, products, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";

async function getSeller(userId: string) {
  const [seller] = await db.select().from(sellers).where(eq(sellers.userId, parseInt(userId))).limit(1);
  return seller;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const sellerProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      status: products.status,
      totalSold: products.totalSold,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt));

  return NextResponse.json(sellerProducts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const body = await req.json();
  const { name, description, price, comparePrice, stock, categoryId } = body;

  if (!name || !price || !categoryId) {
    return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
  }

  const [product] = await db
    .insert(products)
    .values({
      sellerId: seller.id,
      categoryId,
      name,
      slug: slugify(name),
      description,
      price: Math.round(price),
      comparePrice: comparePrice ? Math.round(comparePrice) : null,
      stock: stock || 0,
      status: "active",
    })
    .returning();

  return NextResponse.json(product);
}
