import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  return NextResponse.json({
    vehicleType: rider.vehicleType,
    zone: rider.zone,
    phone: rider.phone,
  });
}

export async function PUT(request: NextRequest) {
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

  const { vehicleType, zone, phone } = await request.json();

  await db
    .update(riders)
    .set({ vehicleType, zone, phone })
    .where(eq(riders.id, rider.id));

  return NextResponse.json({ success: true });
}
