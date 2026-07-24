import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: cartItems.productId,
      productName: products.name,
      productSlug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, parseInt(session.user.id)));

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();
  const userId = parseInt(session.user.id);

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + (quantity || 1) })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity: quantity || 1 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cartItemId, quantity } = await req.json();

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cartItemId } = await req.json();
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

  return NextResponse.json({ success: true });
}
