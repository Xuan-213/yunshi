// ====== Browser-side API client (replaces local-store.ts) ======

import type { BirthProfile, DivinationRecord, DiaryEntry } from "@/lib/store/local-store";

// Re-export types so existing imports work
export type { BirthProfile, DivinationRecord, DiaryEntry };

const BASE = "";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ---- Profiles ----

export async function getProfiles(): Promise<BirthProfile[]> {
  return fetchJSON<BirthProfile[]>("/api/profile");
}

export async function addProfile(p: Omit<BirthProfile, "id">): Promise<BirthProfile> {
  return fetchJSON<BirthProfile>("/api/profile", {
    method: "POST",
    body: JSON.stringify(p),
  });
}

export async function updateProfile(id: number, data: Partial<Omit<BirthProfile, "id">>): Promise<BirthProfile> {
  return fetchJSON<BirthProfile>(`/api/profile/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProfile(id: number): Promise<void> {
  await fetch(`${BASE}/api/profile/${id}`, { method: "DELETE" });
}

// ---- Divinations ----

export async function getDivinations(): Promise<DivinationRecord[]> {
  return fetchJSON<DivinationRecord[]>("/api/divination");
}

export async function getDivinationsByProfile(profileId: number): Promise<DivinationRecord[]> {
  return fetchJSON<DivinationRecord[]>(`/api/divination?profileId=${profileId}`);
}

export async function addDivination(d: Omit<DivinationRecord, "id" | "createdAt">): Promise<DivinationRecord> {
  return fetchJSON<DivinationRecord>("/api/divination", {
    method: "POST",
    body: JSON.stringify(d),
  });
}

// ---- Diaries ----

export async function getDiaries(): Promise<DiaryEntry[]> {
  return fetchJSON<DiaryEntry[]>("/api/diary");
}

export async function getDiariesByProfile(profileId: number): Promise<DiaryEntry[]> {
  return fetchJSON<DiaryEntry[]>(`/api/diary?profileId=${profileId}`);
}

export async function addDiary(d: Omit<DiaryEntry, "id" | "createdAt">): Promise<DiaryEntry> {
  return fetchJSON<DiaryEntry>("/api/diary", {
    method: "POST",
    body: JSON.stringify(d),
  });
}
