import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seedRoles() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Seeding admin and rider accounts...");

  const adminHash = await hash("admin123", 12);
  const [adminUser] = await db.insert(schema.users).values({
    name: "Hara Bazaar Admin",
    phone: "03009999999",
    passwordHash: adminHash,
    role: "admin",
    city: "Faisalabad",
  }).returning();
  console.log("Admin created:", adminUser.phone);

  const riderHash = await hash("rider123", 12);
  const [riderUser] = await db.insert(schema.users).values({
    name: "Ali Rider",
    phone: "03005555555",
    passwordHash: riderHash,
    role: "rider",
    city: "Faisalabad",
  }).returning();

  await db.insert(schema.riders).values({
    userId: riderUser.id,
    vehicleType: "bike",
    zone: "Faisalabad",
    phone: "03005555555",
  });
  console.log("Rider created:", riderUser.phone);

  console.log("\nNew logins:");
  console.log("Admin:  03009999999 / admin123");
  console.log("Rider:  03005555555 / rider123");

  await client.end();
  process.exit(0);
}

seedRoles().catch((e) => {
  console.error(e);
  process.exit(1);
});
