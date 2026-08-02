import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  return NextResponse.json({
    storeName: seller.storeName,
    storeDescription: seller.storeDescription,
    city: seller.city,
    address: seller.address,
    phone: seller.phone,
    bankName: seller.bankName,
    accountNumber: seller.accountNumber,
    accountTitle: seller.accountTitle,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await getSeller(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const body = await req.json();
  const { storeDescription, city, address, phone, bankName, accountNumber, accountTitle } = body;

  const [updated] = await db
    .update(sellers)
    .set({
      ...(storeDescription !== undefined && { storeDescription }),
      ...(city && { city }),
      ...(address !== undefined && { address }),
      ...(phone && { phone }),
      ...(bankName !== undefined && { bankName }),
      ...(accountNumber !== undefined && { accountNumber }),
      ...(accountTitle !== undefined && { accountTitle }),
    })
    .where(eq(sellers.id, seller.id))
    .returning();

  return NextResponse.json(updated);
}
