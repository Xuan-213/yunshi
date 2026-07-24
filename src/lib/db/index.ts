// ====== Database — Supabase PostgreSQL via Drizzle + pg ======

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.startsWith("#")) {
    throw new Error("DATABASE_URL not configured");
  }

  // Parse URL manually to handle special chars in password reliably
  const url = new URL(connectionString);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    database: url.pathname.slice(1) || "postgres",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    max: 5,
    ssl: { rejectUnauthorized: false },
  });

  _db = drizzle(pool, { schema });
  return _db;
}
