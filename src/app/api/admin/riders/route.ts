import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allRiders = await db
    .select({
      id: riders.id,
      vehicleType: riders.vehicleType,
      zone: riders.zone,
      phone: riders.phone,
      status: riders.status,
      totalDeliveries: riders.totalDeliveries,
      createdAt: riders.createdAt,
      riderName: users.name,
      userPhone: users.phone,
    })
    .from(riders)
    .innerJoin(users, eq(riders.userId, users.id))
    .orderBy(desc(riders.createdAt));

  return NextResponse.json(allRiders);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();

  await db.update(riders).set({ status }).where(eq(riders.id, id));

  return NextResponse.json({ success: true });
}
