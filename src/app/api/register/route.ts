import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { users, sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

const PHONE_RE = /^03\d{9}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, role, storeName } = body;
    const phone = (body.phone || "").replace(/[\s-]/g, "");

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Name, phone, and password are required" }, { status: 400 });
    }

    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Enter a valid Pakistani phone number (03XXXXXXXXX)" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (role === "seller" && !storeName?.trim()) {
      return NextResponse.json({ error: "Store name is required for sellers" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({
        name,
        phone,
        passwordHash,
        role: role === "seller" ? "seller" : "customer",
      })
      .returning();

    if (role === "seller") {
      const baseSlug = slugify(storeName);
      const slug = baseSlug + "-" + user.id;
      await db.insert(sellers).values({
        userId: user.id,
        storeName: storeName.trim(),
        storeSlug: slug,
        phone,
        city: "Faisalabad",
      });
    }

    return NextResponse.json({ id: user.id, name: user.name, phone: user.phone, role: user.role });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
