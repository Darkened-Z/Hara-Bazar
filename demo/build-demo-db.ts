// Builds demo/demo.tar.gz — the embedded Postgres snapshot the app loads when DATABASE_URL is unset.
// Run from the project root: pnpm db:demo
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { hashSync } from "bcryptjs";
import * as schema from "../src/lib/db/schema";

const OUT = path.join(process.cwd(), "demo", "demo.tar.gz");
const MIGRATIONS = path.join(process.cwd(), "drizzle");

let seed = 20261022;
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const between = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const daysAgo = (d: number, h = 12) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, between(0, 59), 0, 0);
  return t;
};

async function main() {
  const pg = new PGlite();
  for (const f of fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of fs.readFileSync(path.join(MIGRATIONS, f), "utf8").split("--> statement-breakpoint")) {
      if (stmt.trim()) await pg.exec(stmt);
    }
  }
  const db = drizzle(pg, { schema });
  const pw = (p: string) => hashSync(p, 10);

  const cats = await db.insert(schema.categories).values([
    { name: "Oil & Ghee", slug: "oil-ghee", abbreviation: "OG", color: "#E85D2A", sortOrder: 1 },
    { name: "Rice & Flour", slug: "rice-flour", abbreviation: "RF", color: "#2E7D32", sortOrder: 2 },
    { name: "Spices", slug: "spices", abbreviation: "SP", color: "#D32F2F", sortOrder: 3 },
    { name: "Dairy", slug: "dairy", abbreviation: "DA", color: "#1976D2", sortOrder: 4 },
    { name: "Beverages", slug: "beverages", abbreviation: "BV", color: "#7B1FA2", sortOrder: 5 },
    { name: "Snacks", slug: "snacks", abbreviation: "SN", color: "#F57C00", sortOrder: 6 },
    { name: "Cleaning", slug: "cleaning", abbreviation: "CL", color: "#00838F", sortOrder: 7 },
    { name: "Personal Care", slug: "personal-care", abbreviation: "PC", color: "#C2185B", sortOrder: 8 },
  ]).returning();
  const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  await db.insert(schema.users).values({ name: "Hara Bazaar Admin", phone: "03009999999", passwordHash: pw("admin123"), role: "admin" });

  const sellerDefs = [
    { name: "Khan General Store", phone: "03001234567", pass: "seller123", slug: "khan-general-store", desc: "Your one-stop shop for quality groceries in Faisalabad.", address: "Shop 12, D Ground, Faisalabad" },
    { name: "Madina Kiryana", phone: "03011112222", pass: "seller123", slug: "madina-kiryana", desc: "Rice, flour and spices at wholesale prices.", address: "Jinnah Colony, Faisalabad" },
    { name: "Fresh Point Mart", phone: "03022223333", pass: "seller123", slug: "fresh-point-mart", desc: "Dairy, drinks and daily essentials, delivered same day.", address: "Peoples Colony No. 1, Faisalabad" },
  ];
  const sellers: (typeof schema.sellers.$inferSelect)[] = [];
  for (const s of sellerDefs) {
    const [u] = await db.insert(schema.users).values({ name: s.name, phone: s.phone, passwordHash: pw(s.pass), role: "seller" }).returning();
    const [row] = await db.insert(schema.sellers).values({ userId: u.id, storeName: s.name, storeSlug: s.slug, storeDescription: s.desc, address: s.address, phone: s.phone, status: "active" }).returning();
    sellers.push(row);
  }

  const riderDefs = [
    { name: "Ali Rider", phone: "03005555555", vehicle: "bike" },
    { name: "Usman Tariq", phone: "03016666666", vehicle: "bike" },
    { name: "Bilal Haider", phone: "03027777777", vehicle: "rickshaw" },
  ];
  const riders: (typeof schema.riders.$inferSelect)[] = [];
  for (const r of riderDefs) {
    const [u] = await db.insert(schema.users).values({ name: r.name, phone: r.phone, passwordHash: pw("rider123"), role: "rider" }).returning();
    const [row] = await db.insert(schema.riders).values({ userId: u.id, vehicleType: r.vehicle, phone: r.phone }).returning();
    riders.push(row);
  }

  const areas = ["Madina Town", "Gulberg", "Peoples Colony", "Samanabad", "Jinnah Colony", "Susan Road", "Batala Colony", "D Ground"];
  const customerNames = ["Ahmed Khan", "Sana Iqbal", "Hamza Butt", "Ayesha Noor", "Fahad Raza", "Maryam Saleem", "Zain Abbas", "Hira Javed"];
  const customers: (typeof schema.users.$inferSelect & { addr: string })[] = [];
  for (const [i, name] of customerNames.entries()) {
    const phone = i === 0 ? "03211234567" : `0321${String(1000000 + i * 111111).slice(0, 7)}`;
    const [u] = await db.insert(schema.users).values({ name, phone, passwordHash: pw("customer123"), role: "customer" }).returning();
    const addr = `House ${between(10, 300)}, Street ${between(1, 25)}, ${areas[i]}, Faisalabad`;
    await db.insert(schema.addresses).values({ userId: u.id, label: "Home", addressLine: addr, phone, isDefault: true });
    customers.push({ ...u, addr });
  }

  const productDefs: [string, string, number, number | null, number][] = [
    ["Dalda Cooking Oil 5L", "oil-ghee", 2850, 3200, 45], ["Guard Super Basmati Rice 5kg", "rice-flour", 1650, 1800, 120],
    ["Shan Biryani Masala 6-Pack", "spices", 480, 540, 300], ["Tapal Danedar Tea 950g", "beverages", 1350, 1500, 200],
    ["Lux Soap Bar Pack of 6", "personal-care", 590, 720, 180], ["Sufi Banaspati Ghee 5kg", "oil-ghee", 3200, 3600, 60],
    ["National Salt 800g x3", "spices", 180, null, 500], ["Surf Excel Washing Powder 3kg", "cleaning", 1250, 1400, 150],
    ["Peek Freans Sooper 12-Pack", "snacks", 720, 780, 250], ["Sunflower Cooking Oil 3L", "oil-ghee", 1650, 1900, 8],
    ["Olpers Full Cream Milk 1L x6", "dairy", 1440, 1560, 100], ["Nurpur Butter 200g", "dairy", 420, 460, 90],
    ["Nestle Everyday 900g", "beverages", 1180, 1300, 160], ["Lays Classic Large", "snacks", 180, 200, 400],
    ["Harpic Toilet Cleaner 500ml", "cleaning", 380, 420, 6], ["Habib Cooking Oil 1L", "oil-ghee", 620, 680, 130],
    ["Sunridge Chakki Atta 10kg", "rice-flour", 1200, 1350, 70], ["Mehran Chili Powder 400g", "spices", 380, 420, 280],
    ["Rooh Afza 800ml", "beverages", 490, 540, 110], ["Lifebuoy Handwash 500ml", "personal-care", 450, 500, 190],
    ["Adams Cheese Spread 500g", "dairy", 680, 750, 4], ["Kurkure Masala Munch", "snacks", 80, 100, 600],
    ["Vim Dishwash Bar 300g", "cleaning", 120, 140, 350], ["Falak Basmati Rice 1kg", "rice-flour", 480, 520, 200],
  ];
  const sellerFor = (c: string) => (["rice-flour", "spices"].includes(c) ? sellers[1] : ["dairy", "beverages"].includes(c) ? sellers[2] : sellers[0]);
  const products = await db.insert(schema.products).values(productDefs.map(([name, c, price, comparePrice, stock]) => ({
    name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""), categoryId: cat[c], sellerId: sellerFor(c).id,
    price, comparePrice, stock, status: "active" as const, description: `${name}. Delivered to your door across Faisalabad.`,
  }))).returning();

  const sold = new Map<number, number>();
  const ratings = new Map<number, number[]>();
  const delivered = new Map<number, number>();
  const statusFor = (d: number) => {
    if (d === 0) return pick(["pending", "pending", "confirmed", "processing"]);
    if (d === 1) return pick(["processing", "shipped", "shipped", "delivered"]);
    return rand() < 0.08 ? "cancelled" : "delivered";
  };
  const comments = ["Fresh and well packed.", "Arrived quickly, rider was polite.", "Good price compared to the market.", "Exactly as described.", "Will order again.", null];

  // First six orders are scripted so the rider portal has work: 3 waiting for pickup,
  // 1 out for delivery with Ali, 2 Ali already delivered today.
  const scripted: Record<number, { status: string; rider: number | null; hour: number }> = {
    1: { status: "shipped", rider: null, hour: 11 }, 2: { status: "shipped", rider: null, hour: 10 },
    3: { status: "shipped", rider: null, hour: 9 }, 4: { status: "shipped", rider: 0, hour: 9 },
    5: { status: "delivered", rider: 0, hour: 7 }, 6: { status: "delivered", rider: 0, hour: 6 },
  };

  for (let n = 1; n <= 50; n++) {
    const plan = scripted[n];
    const d = n <= 10 ? 0 : n <= 13 ? 1 : between(2, 30);
    const seller = pick(sellers);
    const own = products.filter((p) => p.sellerId === seller.id);
    const lines = Array.from({ length: between(1, 4) }, () => pick(own)).filter((p, i, a) => a.indexOf(p) === i);
    const items = lines.map((p) => ({ p, qty: between(1, 3) }));
    const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
    const fee = subtotal >= 2000 ? 0 : 150;
    const customer = pick(customers);
    const status = plan?.status ?? statusFor(d);
    const created = daysAgo(d, plan?.hour ?? between(9, 21));
    const rider = plan ? (plan.rider === null ? null : riders[plan.rider]) : status === "delivered" ? pick(riders) : null;
    const pickedUp = rider ? new Date(created.getTime() + 60 * 60 * 1000) : null;
    const deliveredAt = status === "delivered" ? new Date(created.getTime() + between(1, 2) * 60 * 60 * 1000) : null;

    const [order] = await db.insert(schema.orders).values({
      orderNumber: `HB-${String(1000 + n)}`, userId: customer.id, sellerId: seller.id, status,
      subtotal, deliveryFee: fee, total: subtotal + fee, deliveryAddress: customer.addr, deliveryPhone: customer.phone,
      riderId: rider?.id ?? null, pickedUpAt: pickedUp, deliveredAt, createdAt: created, updatedAt: deliveredAt ?? created,
    }).returning();
    await db.insert(schema.orderItems).values(items.map(({ p, qty }) => ({
      orderId: order.id, productId: p.id, productName: p.name, quantity: qty, unitPrice: p.price, totalPrice: p.price * qty,
    })));

    if (status === "delivered") {
      if (rider) delivered.set(rider.id, (delivered.get(rider.id) ?? 0) + 1);
      for (const { p, qty } of items) {
        sold.set(p.id, (sold.get(p.id) ?? 0) + qty);
        if (rand() < 0.6) {
          const rating = pick([5, 5, 5, 4, 4, 3]);
          ratings.set(p.id, [...(ratings.get(p.id) ?? []), rating]);
          await db.insert(schema.reviews).values({ userId: customer.id, productId: p.id, orderId: order.id, rating, comment: pick(comments), createdAt: deliveredAt! });
        }
      }
    }
  }

  for (const p of products) {
    const r = ratings.get(p.id) ?? [];
    await db.update(schema.products).set({
      totalSold: (sold.get(p.id) ?? 0) + between(40, 400),
      totalReviews: r.length,
      ratingAvg: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : 0,
    }).where(eq(schema.products.id, p.id));
  }
  for (const r of riders) {
    await db.update(schema.riders).set({ totalDeliveries: (delivered.get(r.id) ?? 0) + between(60, 180) })
      .where(eq(schema.riders.id, r.id));
  }

  const dump = await pg.dumpDataDir("gzip");
  fs.writeFileSync(OUT, Buffer.from(await dump.arrayBuffer()));
  console.log(`wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
  await pg.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
