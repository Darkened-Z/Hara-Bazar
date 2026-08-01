import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, cartItems, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, parseInt(session.user.id)))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(userOrders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deliveryAddress, deliveryPhone, notes } = await req.json();
  const userId = parseInt(session.user.id);

  const cart = await db
    .select({
      cartItemId: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      productName: products.name,
      price: products.price,
      sellerId: products.sellerId,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  if (cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const deliveryFee = 150;
  const bySeller = new Map<number, typeof cart>();
  for (const item of cart) {
    const list = bySeller.get(item.sellerId) || [];
    list.push(item);
    bySeller.set(item.sellerId, list);
  }

  const createdOrders = [];
  for (const [sellerId, sellerItems] of bySeller) {
    const subtotal = sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + deliveryFee;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        sellerId,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress,
        deliveryPhone,
        notes,
      })
      .returning();

    await db.insert(orderItems).values(
      sellerItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
    );

    createdOrders.push(order);
  }

  await db.delete(cartItems).where(eq(cartItems.userId, userId));

  return NextResponse.json(createdOrders[0]);
}
