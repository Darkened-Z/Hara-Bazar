import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function getSeller(userId: string) {
  const [seller] = await db.select().from(sellers).where(eq(sellers.userId, parseInt(userId))).limit(1);
  return seller;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const { id } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, parseInt(id)), eq(products.sellerId, seller.id)))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, price, comparePrice, stock, status, categoryId } = body;

  const [updated] = await db
    .update(products)
    .set({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price && { price: Math.round(price) }),
      ...(comparePrice !== undefined && { comparePrice: comparePrice ? Math.round(comparePrice) : null }),
      ...(stock !== undefined && { stock }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, parseInt(id)), eq(products.sellerId, seller.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const { id } = await params;

  await db
    .update(products)
    .set({ status: "inactive" })
    .where(and(eq(products.id, parseInt(id)), eq(products.sellerId, seller.id)));

  return NextResponse.json({ success: true });
}
