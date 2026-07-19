"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getProfiles, addProfile, deleteProfile, type BirthProfile } from "./local-store";

export type { BirthProfile };

interface ProfileContextType {
  profiles: BirthProfile[];
  activeProfile: BirthProfile | null;
  loading: boolean;
  setActiveProfile: (id: number) => void;
  refreshProfiles: () => void;
  saveProfile: (p: Omit<BirthProfile, "id">) => BirthProfile;
  removeProfile: (id: number) => void;
}

const Ctx = createContext<ProfileContextType>({
  profiles: [], activeProfile: null, loading: true,
  setActiveProfile: () => {}, refreshProfiles: () => {},
  saveProfile: () => ({ id: 0, name: "", initial: "", color: "", year: 0, month: 0, day: 0, hour: 0, minute: 0, gender: "", longitude: 0, baziSummary: "" }),
  removeProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [activeProfile, setActive] = useState<BirthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(() => {
    const data = getProfiles();
    setProfiles(data);
    const savedId = localStorage.getItem("activeProfileId");
    if (savedId) {
      const p = data.find(p => p.id === parseInt(savedId));
      if (p) setActive(p);
      else if (data.length > 0) setActive(data[0]);
    } else if (data.length > 0 && !activeProfile) {
      setActive(data[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshProfiles(); }, [refreshProfiles]);

  function setActiveProfile(id: number) {
    const p = profiles.find(p => p.id === id);
    if (p) { setActive(p); localStorage.setItem("activeProfileId", String(id)); }
  }

  function saveProfile(p: Omit<BirthProfile, "id">) {
    const row = addProfile(p);
    refreshProfiles();
    return row;
  }

  function removeProfile(id: number) {
    deleteProfile(id);
    refreshProfiles();
  }

  return (
    <Ctx.Provider value={{ profiles, activeProfile, loading, setActiveProfile, refreshProfiles, saveProfile, removeProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfiles() { return useContext(Ctx); }
