import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return NextResponse.json(allCategories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, abbreviation, color, sortOrder } = await request.json();

  const [category] = await db
    .insert(categories)
    .values({ name, slug, abbreviation, color, sortOrder: sortOrder || 0 })
    .returning();

  return NextResponse.json(category);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, isActive, sortOrder } = await request.json();

  const updates: Record<string, any> = {};
  if (typeof isActive === "boolean") updates.isActive = isActive;
  if (typeof sortOrder === "number") updates.sortOrder = sortOrder;

  await db.update(categories).set(updates).where(eq(categories.id, id));

  return NextResponse.json({ success: true });
}
