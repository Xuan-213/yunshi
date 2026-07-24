// ====== Server-side data access layer (Drizzle + PostgreSQL) ======

import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const { birthProfiles, divinationRecords, diaryEntries } = schema;

// ---- Types ----

export interface BirthProfile {
  id: number;
  name: string; initial: string; color: string;
  year: number; month: number; day: number;
  hour: number; minute: number;
  gender: string; longitude: number;
  baziSummary: string;
}

export interface DivinationRecord {
  id: number;
  profileId: number | null;
  mode: string;
  question: string;
  questionType: string;
  input: any;
  result: any;
  createdAt: string;
}

export interface DiaryEntry {
  id: number;
  profileId: number | null;
  period: string;
  content: string;
  createdAt: string;
}

// ---- Profiles ----

export async function getAllProfiles(): Promise<BirthProfile[]> {
  const rows = await getDb().select().from(birthProfiles).orderBy(desc(birthProfiles.createdAt));
  return rows.map(toProfile);
}

export async function getProfileById(id: number): Promise<BirthProfile | null> {
  const rows = await getDb().select().from(birthProfiles).where(eq(birthProfiles.id, id)).limit(1);
  return rows.length > 0 ? toProfile(rows[0]) : null;
}

export async function createProfile(data: Omit<BirthProfile, "id">): Promise<BirthProfile> {
  const rows = await getDb().insert(birthProfiles).values({
    name: data.name,
    initial: data.initial,
    color: data.color,
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.hour,
    minute: data.minute,
    gender: data.gender,
    longitude: data.longitude,
    baziSummary: data.baziSummary,
  }).returning();
  return toProfile(rows[0]);
}

export async function updateProfile(id: number, data: Partial<Omit<BirthProfile, "id">>): Promise<BirthProfile | null> {
  const vals: Record<string, any> = {};
  if (data.name !== undefined) vals.name = data.name;
  if (data.initial !== undefined) vals.initial = data.initial;
  if (data.color !== undefined) vals.color = data.color;
  if (data.year !== undefined) vals.year = data.year;
  if (data.month !== undefined) vals.month = data.month;
  if (data.day !== undefined) vals.day = data.day;
  if (data.hour !== undefined) vals.hour = data.hour;
  if (data.minute !== undefined) vals.minute = data.minute;
  if (data.gender !== undefined) vals.gender = data.gender;
  if (data.longitude !== undefined) vals.longitude = data.longitude;
  if (data.baziSummary !== undefined) vals.baziSummary = data.baziSummary;

  const rows = await getDb().update(birthProfiles).set(vals).where(eq(birthProfiles.id, id)).returning();
  return rows.length > 0 ? toProfile(rows[0]) : null;
}

export async function deleteProfile(id: number): Promise<void> {
  await getDb().delete(birthProfiles).where(eq(birthProfiles.id, id));
}

// ---- Divinations ----

export async function getDivinationsByProfile(profileId: number): Promise<DivinationRecord[]> {
  const rows = await getDb().select().from(divinationRecords)
    .where(eq(divinationRecords.profileId, profileId))
    .orderBy(desc(divinationRecords.createdAt));
  return rows.map(toDivination);
}

export async function createDivination(data: Omit<DivinationRecord, "id" | "createdAt">): Promise<DivinationRecord> {
  const rows = await getDb().insert(divinationRecords).values({
    profileId: data.profileId ?? null,
    mode: data.mode,
    question: data.question,
    questionType: data.questionType,
    input: data.input ?? {},
    result: data.result ?? {},
  }).returning();
  return toDivination(rows[0]);
}

// ---- Diaries ----

export async function getDiariesByProfile(profileId: number): Promise<DiaryEntry[]> {
  const rows = await getDb().select().from(diaryEntries)
    .where(eq(diaryEntries.profileId, profileId))
    .orderBy(desc(diaryEntries.createdAt));
  return rows.map(toDiary);
}

export async function createDiary(data: Omit<DiaryEntry, "id" | "createdAt">): Promise<DiaryEntry> {
  const rows = await getDb().insert(diaryEntries).values({
    profileId: data.profileId ?? null,
    period: data.period,
    content: data.content,
  }).returning();
  return toDiary(rows[0]);
}

// ---- Mappers ----

function toProfile(row: any): BirthProfile {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial,
    color: row.color ?? "",
    year: row.year,
    month: row.month,
    day: row.day,
    hour: row.hour,
    minute: row.minute ?? 0,
    gender: row.gender,
    longitude: row.longitude ?? 120,
    baziSummary: row.baziSummary ?? "",
  };
}

function toDivination(row: any): DivinationRecord {
  return {
    id: row.id,
    profileId: row.profileId ?? null,
    mode: row.mode,
    question: row.question,
    questionType: row.questionType ?? "",
    input: row.input ?? {},
    result: row.result ?? {},
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? ""),
  };
}

function toDiary(row: any): DiaryEntry {
  return {
    id: row.id,
    profileId: row.profileId ?? null,
    period: row.period,
    content: row.content,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? ""),
  };
}
