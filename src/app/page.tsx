"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import MiniCards from "@/components/fortune/mini-cards";
import YiJiSection from "@/components/fortune/yiji-section";
import LuckyStrip from "@/components/fortune/lucky-strip";
import DimensionCards from "@/components/fortune/dimension-cards";
import { useProfiles } from "@/lib/store/profile-context";
import { paiPan } from "@/lib/bazi/paiPan";
import { analyzeMingPan } from "@/lib/bazi/analysis";
import { getDayGanZhi, solarToLunar } from "@/lib/calendar/lunar";
import { aiDailyFortune, aiDimensionFortune } from "@/lib/ai/deepseek";
import Link from "next/link";

const now = new Date();
const days = ["日","一","二","三","四","五","六"];
const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} 周${days[now.getDay()]}`;

// ---- Feedback inline component ----
function FeedbackChip({ onFeedback }: { onFeedback: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="inline-block">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs text-[var(--color-text-hint)] hover:text-[var(--color-accent)] underline transition-colors">
          不够准？反馈优化
        </button>
      ) : (
        <div className="flex gap-2 mt-2">
          <input className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded text-xs bg-white outline-none"
            placeholder="哪里不准？比如：最近财运其实不好..."
            value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && (onFeedback(text), setOpen(false), setText(""))} />
          <button onClick={() => { onFeedback(text); setOpen(false); setText(""); }}
            className="px-2 py-1 bg-[var(--color-accent)] text-white rounded text-xs">发送</button>
          <button onClick={() => setOpen(false)} className="px-2 py-1 text-xs text-[var(--color-text-dim)]">取消</button>
        </div>
      )}
    </div>
  );
}

// ---- Fortune data types ----
interface FortuneData {
  score: number; scoreLabel: string; tags: string[];
  metaphor: string; plain: string;
  yi: string[]; ji: string[];
  dimensions: { icon: string; iconBg: string; name: string; stars: number; analysis: string; tip: string }[];
  lucky: { icon: string; label: string; value: string }[];
  lunarDate: string; ganzhiDay: string; solarDate: string;
}

export default function HomePage() {
  const { activeProfile, profiles, loading, setActiveProfile } = useProfiles();
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const dayGanZhi = getDayGanZhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const lunarMonthNames = ["正","二","三","四","五","六","七","八","九","十","冬","腊"];
  const lunarDayNames = ["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
  const lunarStr = `${lunar.yearGanZhi}年 · ${lunarMonthNames[lunar.lunarMonth-1]}月${lunarDayNames[lunar.lunarDay]}`;

  const chart = useMemo(() => activeProfile ? paiPan({
    year: activeProfile.year, month: activeProfile.month, day: activeProfile.day,
    hour: activeProfile.hour, minute: activeProfile.minute || 0,
    gender: activeProfile.gender as "male" | "female",
    longitude: activeProfile.longitude || 120,
  }) : null, [activeProfile]);

  const analysis = useMemo(() => chart ? analyzeMingPan(chart) : null, [chart]);
  const baziSummary = useMemo(() => chart && analysis
    ? `${chart.bazi.year.ganZhi} ${chart.bazi.month.ganZhi} ${chart.bazi.day.ganZhi} ${chart.bazi.hour.ganZhi}，日主${chart.dayMaster}${chart.dayMasterWx}命，用神${analysis.yongShen.shen}。`
    : "", [chart, analysis]);
  const dimSummary = useMemo(() => chart
    ? Object.entries(chart.shiShen).map(([k,v]) => `${k==="year"?"年":k==="month"?"月":k==="day"?"日":"时"}柱${chart.bazi[k==="year"?"year":k==="month"?"month":k==="day"?"day":"hour"].ganZhi}(${v})`).join("，")
    : "", [chart]);

  const generatedRef = useRef("");

  const defaultDims = [
    { icon: "💼", iconBg: "#fef5f4", name: "事业", stars: 3, analysis: "", tip: "" },
    { icon: "💰", iconBg: "#fdfaf4", name: "财运", stars: 3, analysis: "", tip: "" },
    { icon: "❤️", iconBg: "#fdf5f8", name: "感情", stars: 3, analysis: "", tip: "" },
    { icon: "🧘", iconBg: "#f2f7f3", name: "健康", stars: 3, analysis: "", tip: "" },
    { icon: "📚", iconBg: "#f4f2f7", name: "学业", stars: 3, analysis: "", tip: "" },
    { icon: "🤝", iconBg: "#f4f7f5", name: "人际", stars: 3, analysis: "", tip: "" },
  ];

  // Generate AI fortune
  const generateFortune = useCallback(async (feedback?: string) => {
    if (!chart || !analysis) return;
    setAiLoading(true);
    try {
      const ai = await aiDailyFortune(baziSummary, dayGanZhi, lunarStr, dimSummary, feedback);
      const dims = await Promise.all(defaultDims.map(async d => {
        try {
          const r = await aiDimensionFortune(d.name, baziSummary, dayGanZhi);
          return { ...d, analysis: r.analysis, tip: `💡 ${r.tip}`, stars: Math.round(ai.score + (d.name === "财运" ? 0.5 : d.name === "事业" ? 0.3 : 0)) || 3 };
        } catch { return { ...d, analysis: "AI 生成中...", tip: "💡 稍后重试" }; }
      }));
      setFortune({
        score: ai.score, scoreLabel: ai.scoreLabel,
        tags: (typeof ai.tags === "string" ? JSON.parse(ai.tags) : ai.tags) || [], metaphor: ai.metaphor, plain: ai.plain,
        yi: ["📝 签约", "🤝 合作", "💰 理财", "📚 学习"], ji: ["⚔️ 争执", "💸 大额消费"],
        dimensions: dims,
        lucky: [
          { icon: "🎨", label: "幸运色", value: ai.score >= 4 ? "金色 · 白色" : "蓝色 · 黑色" },
          { icon: "🔢", label: "幸运数字", value: ai.score >= 4 ? "6 · 8" : "3 · 7" },
          { icon: "🧭", label: "吉方", value: "东南" },
          { icon: "🐒", label: "贵人属相", value: "猴" },
        ],
        lunarDate: lunarStr, ganzhiDay: dayGanZhi, solarDate: `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`,
      });
    } catch { /* use fallback */ }
    setAiLoading(false);
  }, [chart, analysis, baziSummary, dayGanZhi, lunarStr, dimSummary]);

  // Regenerate specific dimension
  const regenerateDim = async (dimName: string, feedback: string) => {
    if (!chart) return;
    try {
      const r = await aiDimensionFortune(dimName, baziSummary, dayGanZhi, feedback);
      setFortune(prev => prev ? {
        ...prev,
        dimensions: prev.dimensions.map(d => d.name === dimName ? { ...d, analysis: r.analysis, tip: `💡 ${r.tip}` } : d),
      } : prev);
    } catch { /* keep old */ }
  };

  // Auto-generate once per profile+date
  useEffect(() => {
    const key = `${activeProfile?.id || "none"}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (chart && key !== generatedRef.current) {
      generatedRef.current = key;
      generateFortune();
    }
  }, [activeProfile?.id, chart]); // eslint-disable-line

  // No profile
  if (!loading && !activeProfile) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold mb-2">还没有命盘</h2>
            <p className="text-sm text-[var(--color-text-dim)] mb-6">录入出生信息，即可查看每日运势。</p>
            <Link href="/profile" className="inline-block px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors no-underline">去录入命盘 →</Link>
          </div>
        </main>
      </>
    );
  }

  if (!fortune) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[var(--color-text-dim)]">AI 正在生成今日运势...</p>
          </div>
        </main>
      </>
    );
  }

  const yearGanIdx = (now.getFullYear() - 4) % 10;
  const yearGan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][yearGanIdx];
  const yearZhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][(now.getFullYear() - 4) % 12];
  const monthNum = now.getMonth() + 1;
  const day = now.getDate();
  const mzIdx = monthNum === 2 ? (day >= 4 ? 0 : 11) : monthNum === 3 ? (day >= 6 ? 1 : 0) : monthNum === 4 ? (day >= 5 ? 2 : 1) : monthNum === 5 ? (day >= 6 ? 3 : 2) : monthNum === 6 ? (day >= 6 ? 4 : 3) : monthNum === 7 ? (day >= 7 ? 5 : 4) : monthNum === 8 ? (day >= 7 ? 6 : 5) : monthNum === 9 ? (day >= 8 ? 7 : 6) : monthNum === 10 ? (day >= 8 ? 8 : 7) : monthNum === 11 ? (day >= 7 ? 9 : 8) : monthNum === 12 ? (day >= 7 ? 10 : 9) : (day >= 6 ? 11 : 10);
  const monthZhiArr = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
  const monthZhi = monthZhiArr[mzIdx];
  const monthGanHead = ((yearGanIdx % 5) * 2 + 2) % 10;
  const monthGan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][(monthGanHead + mzIdx) % 10];
  const monthName = `${monthGan}${monthZhi}月 (${monthNum}月)`;
  const yearName = `${yearGan}${yearZhi}年`;

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text-primary)]">
              {activeProfile ? `下午好，${activeProfile.name} 👋` : "下午好 👋"}
            </h1>
            <span className="text-sm text-[var(--color-text-dim)] bg-white px-3 py-1 rounded-full border border-[var(--color-border)]">
              📅 {dateStr}
            </span>
          </div>

          {profiles.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-[var(--color-text-dim)]">查看运势：</span>
              {profiles.map(p => (
                <button key={p.id} onClick={() => setActiveProfile(p.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer border transition-all duration-150 ${activeProfile?.id === p.id ? "bg-[var(--color-accent-bg)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold" : "bg-white border-[var(--color-border)] text-[var(--color-text-body)]"}`}>
                  👤 {p.name}
                </button>
              ))}
            </div>
          )}

          <MiniCards cards={[
            { type: "monthly" as const, label: `📆 流月运势 · ${monthName}`, title: "AI 分析中...", desc: "" },
            { type: "yearly" as const,  label: `📆 流年运势 · ${yearName}`,  title: "AI 分析中...", desc: "" },
          ]} />

          {/* Hero card */}
          <div className="relative bg-white border border-[var(--color-border)] rounded-2xl p-8 mb-6 overflow-hidden">
            <div className="absolute -top-20 -right-10 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(192,64,64,0.05) 0%, rgba(201,169,110,0.03) 40%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-start gap-8 mb-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full pointer-events-none"
                      style={{ background: "radial-gradient(circle, rgba(192,64,64,0.08) 0%, transparent 70%)" }} />
                    <div className="relative w-[88px] h-[88px] rounded-full border-[3px] border-[var(--color-accent)] flex items-center justify-center flex-col">
                      {aiLoading ? (
                        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="font-[var(--font-number)] text-4xl font-bold text-[var(--color-accent)] leading-none">{fortune.score.toFixed(1)}</span>
                          <span className="text-xs text-[var(--color-text-dim)] font-medium mt-0.5">{fortune.scoreLabel}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-dim)] mt-1">运势评分</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-[var(--font-display)] text-lg font-semibold">{fortune.lunarDate}</span>
                    <span className="text-sm text-[var(--color-text-dim)]">{fortune.solarDate}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-card-gold)] text-[var(--color-gold)] font-medium">{fortune.ganzhiDay}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {fortune.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 rounded-md text-sm font-medium bg-[var(--color-green-bg)] text-[var(--color-green)]">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {aiLoading && !fortune.metaphor ? (
                <div className="text-center py-8 text-sm text-[var(--color-text-dim)]">
                  <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  AI 正在为你生成今日运势...
                </div>
              ) : (
                <>
                  <div className="bg-[var(--color-bg-card-warm)] border border-[var(--color-border-light)] rounded-xl p-5 mb-5">
                    <p className="font-[var(--font-display)] text-base text-[var(--color-accent)] font-medium leading-relaxed mb-3 pl-4 border-l-[3px] border-[var(--color-accent)]">
                      {fortune.metaphor}
                    </p>
                    <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                      <strong className="text-[var(--color-text-primary)]">通俗来说：</strong>{fortune.plain}
                    </p>
                  </div>
                  <div className="flex justify-end -mt-3 mb-3">
                    <FeedbackChip onFeedback={fb => generateFortune(fb)} />
                  </div>
                </>
              )}

              <YiJiSection yi={fortune.yi} ji={fortune.ji} />
              <LuckyStrip items={fortune.lucky} />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
            <h2 className="font-[var(--font-display)] text-xl font-semibold">详细解读</h2>
            {aiLoading && <span className="text-xs text-[var(--color-text-dim)]">AI 生成中...</span>}
          </div>
          <DimensionCards
            date={`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`}
            dimensions={fortune.dimensions.map(d => ({
              ...d,
              analysis: d.analysis ? (
                <div>
                  <p className="text-sm text-[var(--color-text-body)] leading-[1.85]">{d.analysis}</p>
                  <div className="mt-2">
                    <FeedbackChip onFeedback={fb => regenerateDim(d.name, fb)} />
                  </div>
                </div>
              ) : <p className="text-sm text-[var(--color-text-dim)]">AI 生成中...</p>,
            }))}
          />
        </div>
      </main>

      <Link href="/divination" className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--color-accent)] text-white text-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(192,64,64,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 z-50 border-none cursor-pointer no-underline"
        title="快速起卦">🎲</Link>
    </>
  );
}
