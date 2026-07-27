"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface BirthProfile {
  id: number;
  name: string; initial: string; color: string;
  gender: string; birthYear: number;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string;
  baziSummary: string;
}

// Local API (no server needed for profiles)
const PROFILE_KEY = "yunshi_profiles";
function loadProfiles(): BirthProfile[] {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "[]"); } catch { return []; }
}
function saveProfiles(arr: BirthProfile[]) { localStorage.setItem(PROFILE_KEY, JSON.stringify(arr)); }

export function getProfiles(): BirthProfile[] { return loadProfiles(); }
export function addProfile(p: Omit<BirthProfile, "id">): BirthProfile {
  const arr = loadProfiles();
  const row: BirthProfile = { id: Date.now(), ...p };
  arr.push(row); saveProfiles(arr); return row;
}
export function deleteProfile(id: number) { saveProfiles(loadProfiles().filter(p => p.id !== id)); }

interface ProfileContextType {
  profiles: BirthProfile[];
  activeProfile: BirthProfile | null;
  loading: boolean;
  setActiveProfile: (id: number) => void;
  refreshProfiles: () => void;
  saveProfile: (p: Omit<BirthProfile, "id">) => BirthProfile;
  removeProfile: (id: number) => void;
}

const def: BirthProfile = { id: 0, name: "", initial: "", color: "", gender: "male", birthYear: 1990, yearPillar: "", monthPillar: "", dayPillar: "", hourPillar: "", baziSummary: "" };

const Ctx = createContext<ProfileContextType>({
  profiles: [], activeProfile: null, loading: true,
  setActiveProfile: () => {}, refreshProfiles: () => {},
  saveProfile: () => def, removeProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [activeProfile, setActive] = useState<BirthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const data = loadProfiles();
    setProfiles(data);
    const savedId = localStorage.getItem("activeProfileId");
    if (savedId) {
      const p = data.find(p => p.id === parseInt(savedId));
      if (p) setActive(p); else if (data.length > 0) setActive(data[0]);
    } else if (data.length > 0 && !activeProfile) {
      setActive(data[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function setActiveProfile(id: number) {
    const p = profiles.find(p => p.id === id);
    if (p) { setActive(p); localStorage.setItem("activeProfileId", String(id)); }
  }

  function saveProfile(p: Omit<BirthProfile, "id">) {
    const row = addProfile(p); refresh(); return row;
  }
  function removeProfile(id: number) { deleteProfile(id); refresh(); }

  return <Ctx.Provider value={{ profiles, activeProfile, loading, setActiveProfile, refreshProfiles: refresh, saveProfile, removeProfile }}>{children}</Ctx.Provider>;
}

export function useProfiles() { return useContext(Ctx); }
