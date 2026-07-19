"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface BirthProfile {
  id: number;
  name: string;
  initial: string;
  color: string;
  year: number; month: number; day: number;
  hour: number; minute: number;
  gender: string; longitude: number;
  baziSummary: string;
}

interface ProfileContextType {
  profiles: BirthProfile[];
  activeProfile: BirthProfile | null;
  loading: boolean;
  setActiveProfile: (id: number) => void;
  refreshProfiles: () => Promise<void>;
}

const Ctx = createContext<ProfileContextType>({
  profiles: [], activeProfile: null, loading: true,
  setActiveProfile: () => {}, refreshProfiles: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [activeProfile, setActive] = useState<BirthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const raw = await res.json();
        const data: BirthProfile[] = raw.map((p: any) => ({
          ...p, baziSummary: p.bazi_summary || p.baziSummary || "",
        }));
        setProfiles(data);
        if (data.length > 0 && !activeProfile) setActive(data[0]);
        if (activeProfile) {
          const updated = data.find((p) => p.id === activeProfile.id);
          if (updated) setActive(updated);
          else if (data.length > 0) setActive(data[0]);
          else setActive(null);
        }
      }
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refreshProfiles(); }, [refreshProfiles]);

  function setActiveProfile(id: number) {
    const p = profiles.find((p) => p.id === id);
    if (p) { setActive(p); localStorage.setItem("activeProfileId", String(id)); }
  }

  useEffect(() => {
    const savedId = localStorage.getItem("activeProfileId");
    if (savedId && profiles.length > 0) {
      const p = profiles.find((p) => p.id === parseInt(savedId));
      if (p) setActive(p);
    }
  }, [profiles]);

  return (
    <Ctx.Provider value={{ profiles, activeProfile, loading, setActiveProfile, refreshProfiles }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfiles() { return useContext(Ctx); }
