"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HistoryMode = "meihua" | "liuyao" | "all";

interface HistoryCtx {
  mode: HistoryMode;
  isOpen: boolean;
  open: (mode?: HistoryMode) => void;
  close: () => void;
  setMode: (m: HistoryMode) => void;
}

const Ctx = createContext<HistoryCtx>({
  mode: "all", isOpen: false,
  open: () => {}, close: () => {}, setMode: () => {},
});

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HistoryMode>("all");
  const [isOpen, setIsOpen] = useState(false);

  function open(m?: HistoryMode) {
    if (m) setMode(m);
    setIsOpen(true);
  }
  function close() { setIsOpen(false); }

  return <Ctx.Provider value={{ mode, isOpen, open, close, setMode }}>{children}</Ctx.Provider>;
}

export function useHistory() { return useContext(Ctx); }
