import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "./schema";

// Without DATABASE_URL the app runs on an embedded Postgres loaded from demo/demo.tar.gz
// (built by demo/build-demo-db.ts). Writes live in memory per server instance.
const g = globalThis as unknown as { demoPg?: PGlite };

function demoDb() {
  if (!g.demoPg) {
    g.demoPg = new PGlite({
      loadDataDir: new Blob([fs.readFileSync(path.join(process.cwd(), "demo", "demo.tar.gz"))]),
    });
    // The snapshot's newest orders are "today" as of build day; slide every date so they stay today.
    g.demoPg.exec(`DO $$ DECLARE s interval; BEGIN
      SELECT (CURRENT_DATE - max(created_at)::date) * interval '1 day' INTO s FROM orders;
      UPDATE orders SET created_at = created_at + s, updated_at = updated_at + s,
        picked_up_at = picked_up_at + s, delivered_at = delivered_at + s;
      UPDATE reviews SET created_at = created_at + s;
    END $$;`);
  }
  return drizzlePglite(g.demoPg, { schema }) as unknown as ReturnType<typeof drizzle<typeof schema>>;
}

export const db = process.env.DATABASE_URL
  ? drizzle(postgres(process.env.DATABASE_URL, { prepare: false }), { schema })
  : demoDb();
