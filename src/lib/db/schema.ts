// ====== Database Schema (Drizzle ORM + Neon Serverless) ======

import { pgTable, serial, varchar, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/** 命盘表 */
export const birthProfiles = pgTable("birth_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  initial: varchar("initial", { length: 5 }).notNull(),
  color: varchar("color", { length: 50 }).default("from-[var(--color-accent)] to-[#d47070]"),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  hour: integer("hour").notNull(),
  minute: integer("minute").default(0),
  gender: varchar("gender", { length: 10 }).notNull(),
  longitude: integer("longitude").default(120),
  baziSummary: varchar("bazi_summary", { length: 100 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

/** 起卦记录表 */
export const divinationRecords = pgTable("divination_records", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => birthProfiles.id),
  mode: varchar("mode", { length: 20 }).notNull(), // meihua | liuyao
  question: varchar("question", { length: 500 }).notNull(),
  questionType: varchar("question_type", { length: 50 }).default(""),
  input: jsonb("input").default({}),  // { nums, digits, wyMethod, ... }
  result: jsonb("result").default({}), // full result object
  createdAt: timestamp("created_at").defaultNow(),
});

/** 运势日记表 */
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => birthProfiles.id),
  period: varchar("period", { length: 50 }).notNull(), // "乙未月" / "本周"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
