// ====== localStorage-based persistent store (for static export / GitHub Pages) ======

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

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function save<T>(key: string, data: T[]) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
}
function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// ---- Profiles ----
const PROFILES_KEY = "yunshi_profiles";
export function getProfiles(): BirthProfile[] { return load<BirthProfile>(PROFILES_KEY); }
export function addProfile(p: Omit<BirthProfile, "id">): BirthProfile {
  const items = load<BirthProfile>(PROFILES_KEY);
  const row: BirthProfile = { id: nextId(items), ...p };
  items.push(row); save(PROFILES_KEY, items); return row;
}
export function deleteProfile(id: number) {
  save(PROFILES_KEY, load<BirthProfile>(PROFILES_KEY).filter(p => p.id !== id));
}

// ---- Divinations ----
const DIV_KEY = "yunshi_divinations";
export function getDivinations(): DivinationRecord[] { return load<DivinationRecord>(DIV_KEY).reverse(); }
export function addDivination(d: Omit<DivinationRecord, "id" | "createdAt">): DivinationRecord {
  const items = load<DivinationRecord>(DIV_KEY);
  const row: DivinationRecord = { id: nextId(items), ...d, createdAt: new Date().toISOString() };
  items.push(row); save(DIV_KEY, items); return row;
}

// ---- Diaries ----
const DIARY_KEY = "yunshi_diaries";
export function getDiaries(): DiaryEntry[] { return load<DiaryEntry>(DIARY_KEY).reverse(); }
export function addDiary(d: Omit<DiaryEntry, "id" | "createdAt">): DiaryEntry {
  const items = load<DiaryEntry>(DIARY_KEY);
  const row: DiaryEntry = { id: nextId(items), ...d, createdAt: new Date().toISOString() };
  items.push(row); save(DIARY_KEY, items); return row;
}
