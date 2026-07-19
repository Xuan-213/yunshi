// ====== Database — SQLite local (primary) + Neon serverless (optional) ======

import Database from "better-sqlite3";
import path from "path";

// Open SQLite database file
const DB_PATH = path.join(process.cwd(), "yunshi.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS birth_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initial TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT '',
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    hour INTEGER NOT NULL,
    minute INTEGER DEFAULT 0,
    gender TEXT NOT NULL,
    longitude INTEGER DEFAULT 120,
    bazi_summary TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS divination_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    mode TEXT NOT NULL,
    question TEXT NOT NULL,
    question_type TEXT DEFAULT '',
    input TEXT DEFAULT '{}',
    result TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    period TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Export SQLite instance
export { sqlite };

// Neon serverless (for Vercel production — not used locally)
// To enable Neon: set DATABASE_URL env var
export async function getNeonDb() {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  return drizzle({ client: neon(process.env.DATABASE_URL!) });
}
