"use client";

import { useState, useEffect, useCallback } from "react";
import { getDivinations, type DivinationRecord } from "@/lib/store/local-store";

type HistoryMode = "meihua" | "liuyao" | "all";

interface Props {
  mode: HistoryMode;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ mode, isOpen, onClose }: Props) {
  const [records, setRecords] = useState<DivinationRecord[]>([]);

  const load = useCallback(() => {
    const all = getDivinations();
    if (mode === "all") {
      setRecords(all);
    } else {
      setRecords(all.filter(r => r.mode === mode));
    }
  }, [mode]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  function del(id: number) {
    const all = JSON.parse(localStorage.getItem("yunshi_divinations") || "[]");
    localStorage.setItem("yunshi_divinations", JSON.stringify(all.filter((r: any) => r.id !== id)));
    load();
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] flex-shrink-0">
          <h2 className="font-[var(--font-display)] text-lg font-semibold">
            {mode === "meihua" ? "梅花易数" : mode === "liuyao" ? "六爻" : "全部"}历史
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-hint)] hover:text-[var(--color-text-primary)] text-xl leading-none transition-colors">✕</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {records.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">🎲</div>
              <p className="text-sm text-[var(--color-text-dim)]">暂无记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="p-4 bg-[#fdfcf9] border border-[var(--color-border-light)] rounded-xl group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.mode === "meihua" ? "bg-[var(--color-accent-bg)] text-[var(--color-accent)]" : "bg-[#f5f0e8] text-[#8b7355]"}`}>
                      {r.mode === "meihua" ? "梅花" : "六爻"}
                    </span>
                    <span className="text-xs text-[var(--color-text-hint)]">
                      {new Date(r.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button onClick={() => del(r.id)} className="ml-auto text-xs text-[var(--color-text-hint)] hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all">删除</button>
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{r.question}</div>
                  {r.result && (r.result as any).benGuaName && (
                    <div className="text-xs text-[var(--color-text-dim)] mt-1 flex items-center gap-2">
                      <span>{(r.result as any).benGuaName}</span>
                      <span className="text-[var(--color-text-hint)]">→</span>
                      <span>{(r.result as any).bianGuaName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
