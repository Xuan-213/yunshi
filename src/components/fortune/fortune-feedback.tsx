"use client";

import { useState, useEffect } from "react";

interface FeedbackStore {
  [date: string]: { [dim: string]: "accurate" | "inaccurate" | null };
}

function loadFeedback(): FeedbackStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("yunshi_feedback") || "{}"); } catch { return {}; }
}
function saveFeedback(fb: FeedbackStore) {
  localStorage.setItem("yunshi_feedback", JSON.stringify(fb));
}

export function useFortuneFeedback(date: string) {
  const [feedback, setFeedback] = useState<FeedbackStore>({});

  useEffect(() => { setFeedback(loadFeedback()); }, []);

  function rate(dim: string, value: "accurate" | "inaccurate") {
    const fb = { ...loadFeedback() };
    if (!fb[date]) fb[date] = {};
    fb[date][dim] = fb[date][dim] === value ? null : value; // toggle
    saveFeedback(fb);
    setFeedback(fb);
  }

  function getRating(dim: string) {
    return feedback[date]?.[dim] || null;
  }

  return { rate, getRating };
}

export default function FeedbackButton({ dim, date }: { dim: string; date: string }) {
  const { rate, getRating } = useFortuneFeedback(date);
  const rating = getRating(dim);

  return (
    <div className="inline-flex gap-1 ml-2 align-middle">
      <button
        onClick={(e) => { e.stopPropagation(); rate(dim, "accurate"); }}
        className={`text-xs px-1.5 py-0.5 rounded transition-all ${rating === "accurate" ? "bg-[var(--color-green-bg)] text-[var(--color-green)]" : "text-[var(--color-text-hint)] hover:text-[var(--color-green)]"}`}
        title="说的准"
      >👍</button>
      <button
        onClick={(e) => { e.stopPropagation(); rate(dim, "inaccurate"); }}
        className={`text-xs px-1.5 py-0.5 rounded transition-all ${rating === "inaccurate" ? "bg-[var(--color-accent-bg)] text-[var(--color-accent)]" : "text-[var(--color-text-hint)] hover:text-[var(--color-accent)]"}`}
        title="不太准"
      >👎</button>
    </div>
  );
}
