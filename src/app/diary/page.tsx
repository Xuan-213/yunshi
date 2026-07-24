"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";
import { getDiariesByProfile, addDiary, type DiaryEntry } from "@/lib/api/client";

export default function DiaryPage() {
  const { activeProfile } = useProfiles();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState("");
  const [content, setContent] = useState("");

  const fetchEntries = useCallback(async () => {
    if (!activeProfile?.id) { setLoading(false); return; }
    try {
      const data = await getDiariesByProfile(activeProfile.id);
      setEntries(data);
    } catch (e) { console.error("Failed to load diaries:", e); }
    setLoading(false);
  }, [activeProfile?.id]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function submit() {
    if (!period.trim() || !content.trim()) return;
    await addDiary({ period, content, profileId: activeProfile?.id ?? null });
    setPeriod(""); setContent(""); setShowForm(false);
    fetchEntries();
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-[800px]">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
            <h1 className="font-[var(--font-display)] text-xl font-semibold">运势日记</h1>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] mb-5 ml-4">
            记录你的实际感受，帮助 AI 更准确地理解你的运势模式。
          </p>

          {!showForm && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full text-sm font-medium hover:bg-[var(--color-accent-bg)] transition-colors mb-6">
              ✍️ 写新日记
            </button>
          )}

          {showForm && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">时间段</label>
                <input className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                  value={period} onChange={e => setPeriod(e.target.value)} placeholder="例如：乙未月 (7月) 或 本周" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">你的感受</label>
                <textarea className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] resize-none" rows={3}
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder="这个月的实际感受如何？和运势描述一致吗？" />
              </div>
              <div className="flex gap-2">
                <button onClick={submit} className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">保存</button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-dim)] hover:bg-gray-50 transition-colors">取消</button>
              </div>
            </div>
          )}

          {loading && <p className="text-sm text-[var(--color-text-dim)]">加载中...</p>}

          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="bg-[#fefdf9] border border-dashed border-[var(--color-border)] rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[var(--color-accent)] font-semibold">{entry.period}</span>
                  <span className="text-xs text-[var(--color-text-hint)]">
                    {new Date(entry.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-body)] leading-relaxed">{entry.content}</p>
              </div>
            ))}
            {!loading && entries.length === 0 && (
              <p className="text-sm text-center text-[var(--color-text-hint)] py-8">还没有日记记录。写第一篇吧 ✍️</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
