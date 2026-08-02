import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function migrate() {
  await sql`CREATE TABLE IF NOT EXISTS riders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'bike',
    zone TEXT DEFAULT 'Faisalabad',
    phone TEXT,
    cnic TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`;
  console.log("riders table created");

  try {
    await sql`ALTER TABLE orders ADD COLUMN rider_id INTEGER REFERENCES riders(id)`;
    console.log("rider_id added");
  } catch { console.log("rider_id already exists"); }

  try {
    await sql`ALTER TABLE orders ADD COLUMN picked_up_at TIMESTAMP`;
    console.log("picked_up_at added");
  } catch { console.log("picked_up_at already exists"); }

  try {
    await sql`ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP`;
    console.log("delivered_at added");
  } catch { console.log("delivered_at already exists"); }

  await sql.end();
  console.log("migration complete");
}

migrate();
