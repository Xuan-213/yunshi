"use client";

import { useProfiles } from "@/lib/store/profile-context";
import Sidebar from "@/components/layout/sidebar";
import MiniCards from "@/components/fortune/mini-cards";
import YiJiSection from "@/components/fortune/yiji-section";
import LuckyStrip from "@/components/fortune/lucky-strip";
import DimensionCards from "@/components/fortune/dimension-cards";
import { calculateDayFortune } from "@/lib/bazi/riYun";
import Link from "next/link";

const now = new Date();
const days = ["日","一","二","三","四","五","六"];
const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} 周${days[now.getDay()]}`;

export default function HomePage() {
  const { activeProfile, profiles, loading, setActiveProfile } = useProfiles();

  // No profile yet
  if (!loading && !activeProfile) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold mb-2">还没有命盘</h2>
            <p className="text-sm text-[var(--color-text-dim)] mb-6">
              录入你的出生信息，即可查看每日运势。
            </p>
            <Link href="/profile" className="inline-block px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors no-underline">
              去录入命盘 →
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Calculate fortune from active profile
  const fortune = activeProfile ? calculateDayFortune({
    year: activeProfile.year, month: activeProfile.month, day: activeProfile.day,
    hour: activeProfile.hour, minute: activeProfile.minute || 0,
    gender: activeProfile.gender as "male" | "female",
    longitude: activeProfile.longitude || 120,
  }, { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }) : null;

  if (!fortune) return null;

  // Dynamic year/month labels
  const yearGanIdx = (now.getFullYear() - 4) % 10;
  const yearZhiIdx = (now.getFullYear() - 4) % 12;
  const yearGan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][yearGanIdx];
  const yearZhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][yearZhiIdx];
  const yearName = `${yearGan}${yearZhi}年`;

  const monthNum = now.getMonth() + 1;
  const monthZhiIdx = (monthNum + 1) % 12; // 正月寅=1
  const monthZhi = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"][monthZhiIdx - 1];
  const monthGanHead = (yearGanIdx % 5) * 2; // 年上起月
  const monthGan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][(monthGanHead + (monthZhiIdx - 1)) % 10];
  const monthName = `${monthGan}${monthZhi}月 (${monthNum}月)`;

  const miniCards = [
    { type: "monthly" as const, label: `📆 流月运势 · ${monthName}`, title: "平稳上升", desc: "财星渐旺，事业稳步推进。注意月中肠胃保养，宜清淡饮食。" },
    { type: "yearly" as const,  label: `📆 流年运势 · ${yearName}`,  title: "变动之年", desc: `天干${yearGan}${["木","木","火","火","土","土","金","金","水","水"][yearGanIdx]}为${yearGanIdx%2===0?"比":"印"}，宜主动求变。` },
  ];

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text-primary)]">
              {activeProfile ? `下午好，${activeProfile.name} 👋` : "下午好 👋"}
            </h1>
            <span className="text-sm text-[var(--color-text-dim)] bg-white px-3 py-1 rounded-full border border-[var(--color-border)]">
              📅 {dateStr}
            </span>
          </div>

          {/* Profile Switcher */}
          {profiles.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-[var(--color-text-dim)]">查看运势：</span>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProfile(p.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer border transition-all duration-150 ${
                    activeProfile?.id === p.id
                      ? "bg-[var(--color-accent-bg)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                      : "bg-white border-[var(--color-border)] text-[var(--color-text-body)]"
                  }`}
                >
                  👤 {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="text-center py-12 text-sm text-[var(--color-text-dim)]">加载命盘中...</div>
          )}

          <MiniCards cards={miniCards} />

          {/* Hero Card */}
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
                      <span className="font-[var(--font-number)] text-4xl font-bold text-[var(--color-accent)] leading-none">{fortune.score.toFixed(1)}</span>
                      <span className="text-xs text-[var(--color-text-dim)] font-medium mt-0.5">{fortune.scoreLabel}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-dim)] mt-1">运势较好</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-[var(--font-display)] text-lg font-semibold">{fortune.lunarDate}</span>
                    <span className="text-sm text-[var(--color-text-dim)]">{fortune.solarDate}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-card-gold)] text-[var(--color-gold)] font-medium">{fortune.ganzhiDay}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {fortune.tags.map(tag => (
                      <span key={tag.text} className={`px-3 py-1 rounded-md text-sm font-medium ${tag.type === "good" ? "bg-[var(--color-green-bg)] text-[var(--color-green)]" : "bg-[var(--color-bg-card-gold)] text-[var(--color-gold)]"}`}>{tag.text}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-bg-card-warm)] border border-[var(--color-border-light)] rounded-xl p-5 mb-5">
                <p className="font-[var(--font-display)] text-base text-[var(--color-accent)] font-medium leading-relaxed mb-3 pl-4 border-l-[3px] border-[var(--color-accent)]">
                  {fortune.metaphor}
                </p>
                <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">通俗来说：</strong>{fortune.plainExplanation}
                </p>
              </div>

              <YiJiSection yi={fortune.yi} ji={fortune.ji} />
              <LuckyStrip items={fortune.lucky} />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
            <h2 className="font-[var(--font-display)] text-xl font-semibold">详细解读</h2>
          </div>
          <DimensionCards date={`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`} dimensions={fortune.dimensions.map(d => ({ ...d, analysis: <>{d.analysis}</> }))} />
        </div>
      </main>

      <Link href="/divination" className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--color-accent)] text-white text-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(192,64,64,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 z-50 border-none cursor-pointer no-underline"
        title="快速起卦">🎲</Link>
    </>
  );
}
