import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, sellers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(orders.id, parseInt(id)), eq(orders.sellerId, seller.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
